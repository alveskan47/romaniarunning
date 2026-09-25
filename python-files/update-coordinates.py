"""
update-coordinates.py

coordinates.json is shared across every sport - one unique catalogue of locations,
not one per sport. Every input-{sport}-competitions.json file is synced against it.

Step 1 — Sync locations from every sport's input file into coordinates.json:
  - For every competition, in every sport, derive its location key
    (county, location, location_details).
  - If the key is not yet in coordinates.json, add it with null lat/lon so it can be
    filled in manually later.
  - When a competition has a non-empty location_details, two entries are added:
      • (county, location, "")               — the default/fallback for that place
      • (county, location, location_details) — the specific venue

Step 2 — Back-fill coordinates into every input-{sport}-competitions.json:
  - For every competition that has no lat/lon yet, look it up in coordinates.json:
      1. Specific match: (county, location, location_details)
      2. Fallback match: (county, location, "")
  - If a match with valid (non-null) coordinates is found, write them onto the competition.

Input/Output:
  - json-files/input-{sport}-competitions.json for every sport in SPORTS
    (read + possibly updated in Step 2)
  - json-files/coordinates.json (read + possibly updated in Step 1)
"""

import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Every sport with an input-{sport}-competitions.json file in json-files/.
SPORTS = [
    "running", "cycling", "aquatlon", "climbing", "duathlon", "hyatlon",
    "kayak", "orienteering", "skiing", "swimming", "triathlon",
]


def get_paths():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    json_dir = os.path.join(parent_dir, 'json-files')
    return (
        {sport: os.path.join(json_dir, f'input-{sport}-competitions.json') for sport in SPORTS},
        os.path.join(json_dir, 'coordinates.json'),
    )


def read_json(path):
    with open(path, 'r', encoding='utf-8-sig') as f:
        return json.load(f)


def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def make_key(county, location, location_details):
    return (county, location, location_details or "")


def build_coords_index(coords_list):
    """Return a dict keyed by (county, location, location_details) → list index."""
    return {
        make_key(e['county'], e['location'], e.get('location_details', '')): i
        for i, e in enumerate(coords_list)
    }


def deduplicate_coords(coords_list):
    """
    Collapse duplicate keys, keeping the first entry that has valid coordinates.
    Falls back to the first entry if none have coordinates.
    Returns (deduplicated_list, number_of_duplicates_removed).
    """
    seen = {}
    for entry in coords_list:
        key = make_key(entry['county'], entry['location'], entry.get('location_details', ''))
        if key not in seen:
            seen[key] = entry
        elif not is_valid(seen[key]) and is_valid(entry):
            seen[key] = entry

    deduped = list(seen.values())
    removed = len(coords_list) - len(deduped)
    return deduped, removed


def is_valid(entry):
    return entry.get('lat') is not None and entry.get('lon') is not None


# ─── Step 1 ───────────────────────────────────────────────────────────────────

def sync_locations(all_competitions, coords_list, index):
    """Add missing location keys to coords_list (with null lat/lon)."""
    added = 0

    for comp in all_competitions:
        county = comp['county']
        location = comp['location']
        location_details = comp.get('location_details', '') or ''

        keys_to_ensure = [make_key(county, location, '')]
        if location_details:
            keys_to_ensure.append(make_key(county, location, location_details))

        for key in keys_to_ensure:
            if key not in index:
                entry = {
                    'county': key[0],
                    'location': key[1],
                    'location_details': key[2],
                    'lat': None,
                    'lon': None,
                }
                index[key] = len(coords_list)
                coords_list.append(entry)
                added += 1
                print(f"  + New location: {key[0]} / {key[1]}"
                      + (f" / {key[2]}" if key[2] else ''))

    new_index = build_coords_index(coords_list)
    return added, new_index


# ─── Step 2 ───────────────────────────────────────────────────────────────────

def backfill_coordinates(all_competitions, coords_list, index):
    """Write lat/lon from coordinates.json onto competitions that are missing them."""
    updated = 0

    for comp in all_competitions:
        if 'lat' in comp and 'lon' in comp:
            continue

        county = comp['county']
        location = comp['location']
        location_details = comp.get('location_details', '') or ''

        specific_key = make_key(county, location, location_details)
        default_key  = make_key(county, location, '')

        entry = None
        for key in (specific_key, default_key):
            idx = index.get(key)
            if idx is not None and is_valid(coords_list[idx]):
                entry = coords_list[idx]
                break

        if entry:
            comp['lat'] = entry['lat']
            comp['lon'] = entry['lon']
            updated += 1
            print(f"  ✓ Coordinates set for: {comp['name']} ({county} / {location})")

    return updated


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    input_paths, coords_path = get_paths()
    coords_list = read_json(coords_path)

    # Read every sport's input file up front, and collect every competition
    # (across every sport) into one flat list for the coordinates sync step.
    sport_data = {}
    all_competitions = []
    for sport, path in input_paths.items():
        data = read_json(path)
        sport_data[sport] = data
        all_competitions.extend(
            data.get(f'{sport}_competitions', []) +
            data.get(f'{sport}_competitions_no_statistics', [])
        )

    coords_list, removed = deduplicate_coords(coords_list)
    if removed:
        print(f"\nDeduplication: removed {removed} duplicate key(s) from coordinates.json")

    index = build_coords_index(coords_list)

    # Step 1 — sync locations from every sport into the shared coordinates.json
    print("\nStep 1: Syncing locations into coordinates.json...")
    added, index = sync_locations(all_competitions, coords_list, index)
    coords_list.sort(key=lambda e: (e['county'], e['location'], e.get('location_details', '') or ''))
    index = build_coords_index(coords_list)
    write_json(coords_path, coords_list)

    if added:
        print(f"  → {added} new location(s) added to coordinates.json")
    if removed:
        print(f"  → {removed} duplicate(s) removed from coordinates.json")
    if not added and not removed:
        print("  → No new locations found.")

    # Step 2 — back-fill coordinates into each sport's own input file
    print("\nStep 2: Back-filling coordinates into input-{sport}-competitions.json files...")
    total_updated = 0
    for sport, path in input_paths.items():
        data = sport_data[sport]
        sport_competitions = (
            data.get(f'{sport}_competitions', []) +
            data.get(f'{sport}_competitions_no_statistics', [])
        )
        updated = backfill_coordinates(sport_competitions, coords_list, index)
        if updated:
            write_json(path, data)
            print(f"  → {sport}: {updated} competition(s) updated with coordinates.")
            total_updated += updated

    if not total_updated:
        print("  → Nothing to update.")


if __name__ == "__main__":
    main()