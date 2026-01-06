# JSON Data Files Documentation

This folder contains JSON data files used throughout the application.

## File Structure

### parks.json
Contains information about parks in Bucharest with running activities.

**Structure:**
```json
{
  "parks": [
    {
      "id": number,                    // Unique identifier for the park
      "park_name": string,             // Name of the park
      "strava_activity": string,       // URL to Strava activity
      "laps": string,                  // Number of laps completed
      "distance_km": string,           // Total distance in kilometers
      "distance_km_per_lap": string    // Distance per lap in kilometers
    }
  ]
}
```

**Usage:** Used by `park.html` to display the list of parks and their running activities.

---

### statistics.json
Contains competition statistics organized by year.

**Structure:**
```json
{
  "statistics": {
    "total_competitions": {
      "YYYY": number              // Total competitions per year
    },
    "competitions_by_month": {
      "YYYY": [number]            // Array of 12 numbers (Jan-Dec)
    },
    "competitions_by_type": {
      "YYYY": {
        "trail": number,
        "road": number,
        "other": number
      }
    },
    "competitions_by_county": {
      "YYYY": {
        "AB": number,             // County codes (Romanian counties)
        // ... more counties
      }
    },
    "competitions_by_towns": {
      "YYYY": {
        "Town Name": number       // Competitions per town
      }
    }
  }
}
```

**Usage:** Intended for future statistics and analytics pages.

**County Codes:**
- AB: Alba, AR: Arad, AG: Argeș, B: Bucharest, BC: Bacău, BH: Bihor
- BN: Bistrița-Năsăud, BT: Botoșani, BR: Brăila, BV: Brașov, BZ: Buzău
- CL: Călărași, CS: Caraș-Severin, CJ: Cluj, CT: Constanța, CV: Covasna
- DB: Dâmbovița, DJ: Dolj, GL: Galați, GR: Giurgiu, GJ: Gorj, HR: Harghita
- HD: Hunedoara, IL: Ialomița, IS: Iași, IF: Ilfov, MM: Maramureș
- MH: Mehedinți, MS: Mureș, NT: Neamț, OT: Olt, PH: Prahova
- SJ: Sălaj, SM: Satu Mare, SB: Sibiu, SV: Suceava, TR: Teleorman
- TM: Timiș, TL: Tulcea, VL: Vâlcea, VS: Vaslui, VN: Vrancea

---

### pages.json
Contains navigation page information for dynamic navbar generation.

**Structure:**
```json
{
  "pages": [
    {
      "page_name": string,        // Display name shown in navigation menu
      "page_link": string         // Filename of the page (e.g., "index.html")
    }
  ]
}
```

**Usage:**
- Used by `initializeNavbar()` function in `main.js`
- Automatically generates navigation links on all pages
- Current page is automatically highlighted as active
- Order in JSON determines order in navigation menu

**Adding a New Page:**
1. Add new entry to the `pages` array in this file
2. Create the corresponding HTML file
3. Navigation will automatically appear on all pages

**Example:**
```json
{
  "pages": [
    { "page_name": "Home", "page_link": "index.html" },
    { "page_name": "Park Run", "page_link": "park.html" },
    { "page_name": "Statistics", "page_link": "statistics.html" }
  ]
}
```

---

## Data Format Notes

- All distances are in kilometers
- Years are represented as strings (e.g., "2026", "2025")
- Lap counts are strings to maintain consistency with the source data
- County codes follow Romanian administrative divisions (ISO 3166-2:RO)

## Adding New Data

When adding new parks or statistics:
1. Follow the existing structure exactly
2. Ensure all required fields are present
3. Validate JSON syntax before committing
4. Update this README if adding new fields or files
