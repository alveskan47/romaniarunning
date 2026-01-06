"""
update-statistics.py

Purpose:
--------
This script updates the statistics file (output-all-statistics.json) with calculated
data from the competitions database (input-all-competitions.json). It processes competition
data to generate various statistics including:
- Total competitions per year
- Competitions by month
- Competitions by type (road, trail, etc.)
- Competitions by county and town

The script ensures that the statistics file always reflects the current state of the
competitions database.
"""

import json
from collections import defaultdict
from pathlib import Path

# List of all Romanian county codes (41 counties + București)
ALL_COUNTIES = [
    "AB", "AR", "AG", "B", "BC", "BH", "BN", "BT", "BR", "BV", "BZ",
    "CL", "CS", "CJ", "CT", "CV", "DB", "DJ", "GL", "GR", "GJ",
    "HR", "HD", "IL", "IS", "IF", "MM", "MH", "MS", "NT", "OT",
    "PH", "SJ", "SM", "SB", "SV", "TR", "TM", "TL", "VL", "VS", "VN"
]

# List of all competition types
ALL_TYPES = ["trail", "road", "other"]


def load_json_file(file_path):
    """
    Load and parse a JSON file.

    Parameters:
    -----------
    file_path : str or Path
        Path to the JSON file to load

    Returns:
    --------
    dict
        Parsed JSON data
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json_file(file_path, data):
    """
    Save data to a JSON file with proper formatting.

    Parameters:
    -----------
    file_path : str or Path
        Path to the JSON file to save
    data : dict
        Data to save as JSON
    """
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def update_total_competitions(competitions_data):
    """
    Calculate the total number of competitions per year.

    This function counts how many competitions are held in each year by examining
    the editions array for each competition. Each edition has a year field that
    indicates when that particular edition of the competition takes place.

    Parameters:
    -----------
    competitions_data : dict
        The competitions data loaded from input-all-competitions.json
        Expected structure: {"competitions": [{"editions": [{"year": 2024, ...}]}]}

    Returns:
    --------
    dict
        Dictionary with years as keys and competition counts as values
        Example: {"2024": 328, "2025": 355, "2026": 73}
    """
    # Dictionary to store count of competitions per year
    year_counts = defaultdict(int)

    # Iterate through all competitions
    competitions = competitions_data.get('competitions', [])
    for competition in competitions:
        # Get editions for this competition
        editions = competition.get('editions', [])

        # Count each edition by year
        for edition in editions:
            year = str(edition.get('year'))
            if year:
                year_counts[year] += 1

    # Convert defaultdict to regular dict and sort by year
    return dict(sorted(year_counts.items()))


def update_competitions_by_month(competitions_data):
    """
    Calculate the number of competitions per month for each year.

    This function counts how many competitions are held in each month of each year
    by examining the editions array for each competition. Each edition has a year
    and month field that indicates when that particular edition takes place.

    Parameters:
    -----------
    competitions_data : dict
        The competitions data loaded from input-all-competitions.json
        Expected structure: {"competitions": [{"editions": [{"year": 2024, "month": 5, ...}]}]}

    Returns:
    --------
    dict
        Dictionary with years as keys and arrays of 12 integers as values
        Each array contains the count of competitions for each month (January to December)
        Example: {"2024": [2, 10, 10, 30, 40, 54, 19, 25, 51, 47, 25, 15]}
    """
    # Dictionary to store competitions by month for each year
    # Each year will have an array of 12 integers (one for each month)
    year_month_counts = defaultdict(lambda: [0] * 12)

    # Iterate through all competitions
    competitions = competitions_data.get('competitions', [])
    for competition in competitions:
        # Get editions for this competition
        editions = competition.get('editions', [])

        # Count each edition by year and month
        for edition in editions:
            year = str(edition.get('year'))
            month = edition.get('month')

            # Validate year and month
            if year and month and 1 <= month <= 12:
                # Increment the count for this month (month - 1 for 0-based index)
                year_month_counts[year][month - 1] += 1

    # Convert defaultdict to regular dict and sort by year
    return dict(sorted(year_month_counts.items()))


def update_competitions_by_type(competitions_data):
    """
    Calculate the number of competitions per type for each year.

    This function counts how many competitions of each type (road, trail, sand, etc.)
    are held in each year by examining the type field of each competition and the
    year field of each edition. All types (trail, road, other) will be included
    even if they have 0 competitions for a given year.

    Parameters:
    -----------
    competitions_data : dict
        The competitions data loaded from input-all-competitions.json
        Expected structure: {"competitions": [{"type": "road", "editions": [{"year": 2024, ...}]}]}

    Returns:
    --------
    dict
        Dictionary with years as keys and nested dictionaries as values
        Each nested dictionary contains type names as keys and counts as values
        Example: {"2024": {"trail": 189, "road": 131, "other": 8}}
    """
    # Dictionary to store competitions by type for each year
    year_type_counts = defaultdict(lambda: defaultdict(int))

    # Iterate through all competitions
    competitions = competitions_data.get('competitions', [])
    for competition in competitions:
        # Get the type of competition (road, trail, sand, etc.)
        comp_type = competition.get('type', 'other')

        # Map specific types to categories (sand -> other, etc.)
        if comp_type not in ['road', 'trail']:
            comp_type = 'other'

        # Get editions for this competition
        editions = competition.get('editions', [])

        # Count each edition by year and type
        for edition in editions:
            year = str(edition.get('year'))
            if year:
                year_type_counts[year][comp_type] += 1

    # Convert nested defaultdicts to regular dicts and sort by year
    # Ensure all types (trail, road, other) are present for each year
    result = {}
    for year in sorted(year_type_counts.keys()):
        year_data = {}
        for comp_type in ALL_TYPES:
            year_data[comp_type] = year_type_counts[year].get(comp_type, 0)
        result[year] = year_data

    return result


def update_competitions_by_county(competitions_data):
    """
    Calculate the number of competitions per county for each year.

    This function counts how many competitions are held in each county for each year
    by examining the county field of each competition and the year field of each edition.
    All Romanian counties will be included even if they have 0 competitions for a given year.

    Parameters:
    -----------
    competitions_data : dict
        The competitions data loaded from input-all-competitions.json
        Expected structure: {"competitions": [{"county": "B", "editions": [{"year": 2024, ...}]}]}

    Returns:
    --------
    dict
        Dictionary with years as keys and nested dictionaries as values
        Each nested dictionary contains county codes as keys and counts as values
        All 42 counties will be present (41 counties + București)
        Example: {"2024": {"AB": 10, "AR": 19, "B": 31, ...}}
    """
    # Dictionary to store competitions by county for each year
    year_county_counts = defaultdict(lambda: defaultdict(int))

    # Iterate through all competitions
    competitions = competitions_data.get('competitions', [])
    for competition in competitions:
        # Get the county code
        county = competition.get('county')

        # Get editions for this competition
        editions = competition.get('editions', [])

        # Count each edition by year and county
        for edition in editions:
            year = str(edition.get('year'))
            if year and county:
                year_county_counts[year][county] += 1

    # Convert nested defaultdicts to regular dicts and sort by year
    # Ensure all counties are present for each year
    result = {}
    for year in sorted(year_county_counts.keys()):
        year_data = {}
        for county in ALL_COUNTIES:
            year_data[county] = year_county_counts[year].get(county, 0)
        result[year] = year_data

    return result


def update_competitions_by_towns(competitions_data):
    """
    Calculate the top 10 towns by number of competitions for each year.

    This function counts how many competitions are held in each town for each year
    and returns the top 10 towns. If multiple towns are tied at the 10th place,
    they are all included unless the total would exceed 20 towns (in which case
    all tied towns at 10th place are excluded).

    Parameters:
    -----------
    competitions_data : dict
        The competitions data loaded from input-all-competitions.json
        Expected structure: {"competitions": [{"location": "București", "editions": [{"year": 2024, ...}]}]}

    Returns:
    --------
    dict
        Dictionary with years as keys and nested dictionaries as values
        Each nested dictionary contains town names as keys and competition counts as values
        Only top 10 towns (plus ties at 10th place if total <= 20) are included
        Example: {"2024": {"București": 31, "Cluj-Napoca": 20, ...}}
    """
    # Dictionary to store competitions by town for each year
    year_town_counts = defaultdict(lambda: defaultdict(int))

    # Iterate through all competitions
    competitions = competitions_data.get('competitions', [])
    for competition in competitions:
        # Get the location (town name)
        location = competition.get('location')

        # Get editions for this competition
        editions = competition.get('editions', [])

        # Count each edition by year and location
        for edition in editions:
            year = str(edition.get('year'))
            if year and location:
                year_town_counts[year][location] += 1

    # Process each year to get top 10 towns with tie-breaking logic
    result = {}
    for year in sorted(year_town_counts.keys()):
        # Sort towns by count (descending), then by name (ascending) for consistent ordering
        sorted_towns = sorted(
            year_town_counts[year].items(),
            key=lambda x: (-x[1], x[0])
        )

        # Get top 10 towns
        if len(sorted_towns) <= 10:
            # If we have 10 or fewer towns, include them all
            result[year] = dict(sorted_towns)
        else:
            # Get the value at 10th position (index 9)
            tenth_place_value = sorted_towns[9][1]

            # Find all towns with the same value as 10th place
            top_10 = sorted_towns[:10]
            tied_towns = [town for town in sorted_towns[10:] if town[1] == tenth_place_value]

            # Check if including tied towns would exceed 20 total towns
            total_towns = len(top_10) + len(tied_towns)

            if total_towns > 20:
                # Exclude all towns with 10th place value
                final_towns = [town for town in top_10 if town[1] > tenth_place_value]
                result[year] = dict(final_towns)
            else:
                # Include top 10 plus all tied towns
                final_towns = top_10 + tied_towns
                result[year] = dict(final_towns)

    return result


def main():
    """
    Main function to update all statistics.

    This function orchestrates the statistics update process:
    1. Load the competitions data
    2. Load the existing statistics
    3. Calculate updated statistics
    4. Save the updated statistics back to the file
    """
    # Define file paths
    base_path = Path(__file__).parent.parent / 'json-files'
    input_file = base_path / 'input-all-competitions.json'
    output_file = base_path / 'output-all-statistics.json'

    # Load data files
    print("Loading competitions data...")
    competitions_data = load_json_file(input_file)

    print("Loading statistics data...")
    statistics_data = load_json_file(output_file)

    # Update total_competitions
    print("Calculating total competitions per year...")
    total_competitions = update_total_competitions(competitions_data)
    statistics_data['statistics']['total_competitions'] = total_competitions

    # Update competitions_by_month
    print("Calculating competitions by month...")
    competitions_by_month = update_competitions_by_month(competitions_data)
    statistics_data['statistics']['competitions_by_month'] = competitions_by_month

    # Update competitions_by_type
    print("Calculating competitions by type...")
    competitions_by_type = update_competitions_by_type(competitions_data)
    statistics_data['statistics']['competitions_by_type'] = competitions_by_type

    # Update competitions_by_county
    print("Calculating competitions by county...")
    competitions_by_county = update_competitions_by_county(competitions_data)
    statistics_data['statistics']['competitions_by_county'] = competitions_by_county

    # Update competitions_by_towns
    print("Calculating top towns by competitions...")
    competitions_by_towns = update_competitions_by_towns(competitions_data)
    statistics_data['statistics']['competitions_by_towns'] = competitions_by_towns

    # Save updated statistics
    print("Saving updated statistics...")
    save_json_file(output_file, statistics_data)

    print("\nStatistics updated successfully!")
    print(f"Total competitions by year: {total_competitions}")
    print(f"Competitions by month calculated for {len(competitions_by_month)} years")
    print(f"Competitions by type calculated for {len(competitions_by_type)} years")
    print(f"Competitions by county calculated for {len(competitions_by_county)} years")
    print(f"Competitions by towns calculated for {len(competitions_by_towns)} years")


if __name__ == "__main__":
    main()