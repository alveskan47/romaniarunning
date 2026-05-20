"""
update-coordinates.py

Step 1 — Sync locations from input-all-competitions into coordinates.json:
  - For every competition, derive its location key (county, location, location_details).
  - If the key is not yet in coordinates.json, add it with null lat/lon so it can be
    filled in manually later.
  - When a competition has a non-empty location_details, two entries are added:
      • (county, location, "")               — the default/fallback for that place
      • (county, location, location_details) — the specific venue

Step 2 — Back-fill coordinates into input-all-competitions.json:
  - For every competition that has no lat/lon yet, look it up in coordinates.json:
      1. Specific match: (county, location, location_details)
      2. Fallback match: (county, location, "")
  - If a match with valid (non-null) coordinates is found, write them onto the competition.

Input/Output:
  - json-files/input-all-competitions.json (read + possibly updated in Step 2)
  - json-files/coordinates.json            (read + possibly updated in Step 1)
"""

import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def get_paths():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    json_dir = os.path.join(parent_dir, 'json-files')
    return (
        os.path.join(json_dir, 'input-all-competitions.json'),
        os.path.join(json_dir, 'coordinates.json'),
    )


def read_json(path):
    with open(path, 'r', encoding='utf-8') as f:
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
    input_path, coords_path = get_paths()

    input_data = read_json(input_path)
    coords_list = read_json(coords_path)

    all_competitions = (
        input_data.get('competitions', []) +
        input_data.get('competitions_no_statistics', [])
    )

    coords_list, removed = deduplicate_coords(coords_list)
    if removed:
        print(f"\nDeduplication: removed {removed} duplicate key(s) from coordinates.json")

    index = build_coords_index(coords_list)

    # Step 1
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

    # Step 2
    print("\nStep 2: Back-filling coordinates into input-all-competitions.json...")
    updated = backfill_coordinates(all_competitions, coords_list, index)
    if updated:
        write_json(input_path, input_data)
        print(f"  → {updated} competition(s) updated with coordinates.")
    else:
        print("  → Nothing to update.")


if __name__ == "__main__":
    main()