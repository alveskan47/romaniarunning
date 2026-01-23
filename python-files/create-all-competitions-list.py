"""
Create All Competitions List Script

This script reads the input JSON file containing all competitions and creates
alphabetically sorted lists of competition data including edition dates.

Input:
  - json-files/input-all-competitions.json (contains both competitions and competitions_no_statistics arrays)
Output:
  - json-files/output-all-competitions-list.json (alphabetically sorted lists using Romanian alphabet with edition dates)
"""

import json
import os
import locale
from pathlib import Path
from datetime import datetime


def load_competitions_data(file_path):
    """
    Load competitions data from JSON file.

    Parameters:
    -----------
    file_path : str or Path
        Path to the JSON file containing competition data

    Returns:
    --------
    dict
        Parsed JSON data containing competitions
    """
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)


def setup_romanian_locale():
    """
    Attempt to set up Romanian locale for proper alphabetical sorting.
    Falls back to custom sorting if locale is not available.

    Returns:
    --------
    bool
        True if Romanian locale was successfully set, False otherwise
    """
    try:
        # Try different variations of Romanian locale
        for loc in ['ro_RO.UTF-8', 'ro_RO', 'Romanian_Romania.1250', 'Romanian']:
            try:
                locale.setlocale(locale.LC_COLLATE, loc)
                return True
            except locale.Error:
                continue
        return False
    except Exception:
        return False


def romanian_sort_key(text):
    """
    Create a sort key for Romanian alphabetical order.
    Romanian alphabet: A Ă Â B C D E F G H I Î J K L M N O P Q R S Ș T Ț U V W X Y Z

    Parameters:
    -----------
    text : str
        The text to create a sort key for

    Returns:
    --------
    str
        Modified text for proper sorting
    """
    # Replace Romanian special characters with sortable equivalents
    # This ensures proper ordering in the Romanian alphabet
    replacements = {
        'ă': 'a~1', 'Ă': 'A~1',
        'â': 'a~2', 'Â': 'A~2',
        'î': 'i~1', 'Î': 'I~1',
        'ș': 's~1', 'Ș': 'S~1',
        'ț': 't~1', 'Ț': 'T~1'
    }

    result = text.lower()
    for char, replacement in replacements.items():
        result = result.replace(char.lower(), replacement.lower())

    return result


def format_edition_date(year, month, day):
    """
    Format a date as "DayName DD-Mon" (e.g., "Sat 24-Jan")

    Parameters:
    -----------
    year : int
        Year of the edition
    month : int
        Month of the edition
    day : int
        Day of the edition

    Returns:
    --------
    str
        Formatted date string or empty string if invalid
    """
    try:
        date = datetime(year, month, day)
        # Format: DayName DD-Mon (e.g., "Sat 24-Jan")
        # Use %d and strip leading zero for cross-platform compatibility
        formatted = date.strftime('%a %d-%b')
        # Remove leading zero from day if present
        parts = formatted.split(' ')
        if len(parts) == 2:
            day_month = parts[1]
            if day_month[0] == '0':
                day_month = day_month[1:]
            formatted = f"{parts[0]} {day_month}"
        return formatted
    except (ValueError, TypeError):
        return ''


def get_edition_dates_for_years(editions, years):
    """
    Extract edition dates for specified years.

    Parameters:
    -----------
    editions : list
        List of edition dictionaries with year, month, day
    years : list
        List of years to extract dates for

    Returns:
    --------
    dict
        Dictionary with year as key and formatted date as value
    """
    result = {}
    for year in years:
        result[str(year)] = ''  # Default empty string

    if not editions:
        return result

    for edition in editions:
        year = edition.get('year')
        if year in years:
            month = edition.get('month')
            day = edition.get('day')
            formatted_date = format_edition_date(year, month, day)
            result[str(year)] = formatted_date

    return result


def extract_competitions(data):
    """
    Extract competition data and sort them alphabetically by name using Romanian collation.

    Parameters:
    -----------
    data : dict
        Dictionary containing 'competitions' and optionally 'competitions_no_statistics'

    Returns:
    --------
    tuple
        Three lists of dictionaries: (competitions_list, moldova_competitions_list, other_competitions_list)
        - competitions_list: id, name, location, county, and edition dates for 2026-2023
        - moldova_competitions_list: name, location, and edition dates for 2026-2023
        - other_competitions_list: name and edition dates for 2026-2023
    """
    competitions_list = []
    moldova_competitions_list = []
    other_competitions_list = []

    # Years to extract edition dates for
    years = [2026, 2025, 2024, 2023]

    # Extract data from 'competitions' array
    if 'competitions' in data:
        for competition in data['competitions']:
            if 'name' in competition:
                # Get edition dates for all years
                editions = competition.get('editions', [])
                edition_dates = get_edition_dates_for_years(editions, years)

                comp_data = {
                    'id': competition.get('id', ''),
                    'name': competition.get('name', ''),
                    'location': competition.get('location', ''),
                    'county': competition.get('county', ''),
                    'year_2026': edition_dates['2026'],
                    'year_2025': edition_dates['2025'],
                    'year_2024': edition_dates['2024'],
                    'year_2023': edition_dates['2023']
                }
                competitions_list.append(comp_data)

    # Extract data from 'competitions_no_statistics' array if it exists
    # Split into Moldova competitions and other competitions
    if 'competitions_no_statistics' in data:
        for competition in data['competitions_no_statistics']:
            if 'name' in competition:
                county = competition.get('county', '')
                editions = competition.get('editions', [])
                edition_dates = get_edition_dates_for_years(editions, years)

                # Check if it's a Moldova competition (county is "MDA*")
                if county == 'MDA*':
                    comp_data = {
                        'name': competition.get('name', ''),
                        'location': competition.get('location', ''),
                        'year_2026': edition_dates['2026'],
                        'year_2025': edition_dates['2025'],
                        'year_2024': edition_dates['2024'],
                        'year_2023': edition_dates['2023']
                    }
                    moldova_competitions_list.append(comp_data)
                else:
                    # Other competitions (virtual, etc.)
                    comp_data = {
                        'name': competition.get('name', ''),
                        'year_2026': edition_dates['2026'],
                        'year_2025': edition_dates['2025'],
                        'year_2024': edition_dates['2024'],
                        'year_2023': edition_dates['2023']
                    }
                    other_competitions_list.append(comp_data)

    # Try to use Romanian locale for sorting
    use_locale = setup_romanian_locale()

    # Define sorting key function for competition objects
    def get_name_sort_key(comp):
        name = comp.get('name', '')
        if use_locale:
            try:
                return locale.strxfrm(name)
            except Exception:
                return romanian_sort_key(name)
        else:
            return romanian_sort_key(name)

    # Sort by name using Romanian collation
    competitions_list.sort(key=get_name_sort_key)
    moldova_competitions_list.sort(key=get_name_sort_key)
    other_competitions_list.sort(key=get_name_sort_key)

    return competitions_list, moldova_competitions_list, other_competitions_list


def save_output(competitions_list, moldova_competitions_list, other_competitions_list, output_path):
    """
    Save the sorted competition data to a JSON file.

    Parameters:
    -----------
    competitions_list : list
        List of regular competition objects
    moldova_competitions_list : list
        List of Moldova competition objects
    other_competitions_list : list
        List of other competition objects (virtual, etc.)
    output_path : str or Path
        Path where the output JSON file will be saved
    """
    output_data = {
        "competitions": competitions_list,
        "competitions_moldova": moldova_competitions_list,
        "competitions_other": other_competitions_list
    }

    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(output_data, file, ensure_ascii=False, indent=2)


def main():
    """
    Main function to create the alphabetically sorted competitions lists.
    """
    # Define paths relative to the script location
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    input_path = project_root / 'json-files' / 'input-all-competitions.json'
    output_path = project_root / 'json-files' / 'output-all-competitions-list.json'

    print("Loading competitions data...")
    data = load_competitions_data(input_path)

    print("Extracting and sorting competition data (using Romanian alphabet)...")
    competitions_list, moldova_competitions_list, other_competitions_list = extract_competitions(data)

    print(f"Found {len(competitions_list)} regular competitions")
    print(f"Found {len(moldova_competitions_list)} Moldova competitions")
    print(f"Found {len(other_competitions_list)} other competitions (virtual, etc.)")
    print(f"Total: {len(competitions_list) + len(moldova_competitions_list) + len(other_competitions_list)} competitions")

    print("Saving output...")
    save_output(competitions_list, moldova_competitions_list, other_competitions_list, output_path)

    print(f"Successfully created {output_path}")
    print(f"  Regular competitions: {len(competitions_list)}")
    print(f"  Moldova competitions: {len(moldova_competitions_list)}")
    print(f"  Other competitions: {len(other_competitions_list)}")
    print(f"  Total: {len(competitions_list) + len(moldova_competitions_list) + len(other_competitions_list)}")


if __name__ == "__main__":
    main()