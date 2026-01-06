"""
Create Competitions Tables Script

This script reads JSON files containing competitions with their different editions.
It processes each event, groups them by year, and outputs a separate JSON file for each year.

Input:
  - json-files/input-all-competitions.json (contains both competitions and competitions_no_statistics arrays)
Output: json-files/output-events-{year}.json (one file per year containing all events for that year)
"""

import datetime
import json
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Union


@dataclass
class Edition:
    """
    Represents a single edition of a running event.

    Attributes:
        name: The name of the event
        location: The city where the event takes place
        location_details: Additional location information (e.g., specific venue)
        display_date: Formatted date string for display (e.g., "Sun 14-May-2023")
        county: The county code where the event is held
        type: The type of event (e.g., "road", "trail")
        distances: List of available race distances
        link: Official website URL for the event
        id: The competition ID (used for sorting)
        year: The year of the event (used for sorting)
        month: The month of the event (used for sorting)
        day: The day of the event (used for sorting)
    """
    name: str = ""
    location: str = ""
    location_details: str = ""
    display_date: str = ""
    county: str = ""
    type: str = ""
    distances: List[str] = None
    link: str = ""
    id: int = 0
    year: int = 0
    month: int = 0
    day: int = 0

    def __post_init__(self):
        """Initialize mutable default values."""
        if self.distances is None:
            self.distances = []


def event_by_year(current_competition: Dict[str, Any], year: int) -> Union[Dict[str, int], bool]:
    """
    Find the edition data for a specific year within a competition.

    Args:
        current_competition: Dictionary containing competition data with an "editions" key
        year: The year to search for

    Returns:
        Dictionary containing year, month, and day keys if found, False otherwise
    """
    for current_edition in current_competition["editions"]:
        if current_edition["year"] == year:
            return current_edition
    return False


def display_date(year: int, month: int, day: int) -> str:
    """
    Convert a date to a formatted display string.

    Args:
        year: The year (e.g., 2023)
        month: The month (1-12)
        day: The day (1-31)

    Returns:
        Formatted date string in the format "Weekday DD-Mon-YYYY" (e.g., "Sun 14-May-2023")
    """
    date_object = datetime.date(year, month, day)
    displayed_date = date_object.strftime("%a %d-%b-%Y")
    return displayed_date


def read_json_file(json_file: str) -> Dict[str, Any]:
    """
    Read and parse a JSON file.

    Args:
        json_file: Path to the JSON file to read

    Returns:
        Parsed JSON data as a dictionary

    Raises:
        FileNotFoundError: If the file does not exist
        json.JSONDecodeError: If the file contains invalid JSON
    """
    with open(json_file, 'r', encoding='utf-8') as file:
        return json.load(file)


def convert_object_into_json(input_object: Any, input_indent: int = 2) -> str:
    """
    Convert a Python object into a JSON string.

    Args:
        input_object: The object to convert (typically a list or dict)
        input_indent: Number of spaces for indentation (default: 2)

    Returns:
        JSON-formatted string representation of the object
    """
    return json.dumps(input_object, default=lambda o: o.__dict__, indent=input_indent, ensure_ascii=False)


def write_file(output_file_name: str, output_content: str) -> None:
    """
    Write content to a file.

    Args:
        output_file_name: Path to the output file
        output_content: String content to write to the file

    Returns:
        None
    """
    with open(output_file_name, "w", encoding='utf-8') as output_editions_file:
        output_editions_file.write(output_content)


def main() -> None:
    """
    Main execution function.

    Reads competition data from input JSON, processes each edition by year,
    and writes separate output files for each year.

    Returns:
        None
    """
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Get the parent directory (romaniarunning folder)
    parent_dir = os.path.dirname(script_dir)
    # Build path to json-files folder
    json_files_dir = os.path.join(parent_dir, 'json-files')

    # Read input JSON file from json-files folder
    input_file_path = os.path.join(json_files_dir, 'input-all-competitions.json')
    input_data = read_json_file(input_file_path)

    # Merge competitions from both arrays (competitions and competitions_no_statistics)
    all_competitions = input_data["competitions"] + input_data["competitions_no_statistics"]
    # Dictionary to store events grouped by year
    competitions_output: Dict[int, List[Edition]] = {2026: [], 2025: [], 2024: [], 2023: []}

    # Process each competition and its editions
    for competition in all_competitions:
        for edition in competition["editions"]:
            current_event = Edition()

            # Get event data for the specific year
            event_date = event_by_year(competition, edition['year'])
            if not event_date:
                continue

            current_event.display_date = display_date(
                event_date["year"],
                event_date["month"],
                event_date["day"]
            )
            current_event.name = competition["name"]
            current_event.location = competition["location"]

            # Add location_details if it exists
            if "location_details" in competition:
                current_event.location_details = competition["location_details"]

            current_event.county = competition["county"]
            current_event.type = competition["type"]

            # Use custom_distances from edition if it exists, otherwise use main distances
            if "custom_distances" in event_date:
                current_event.distances = event_date["custom_distances"]
            else:
                current_event.distances = competition["distances"]

            # Link priority: 1) main link, 2) event_link from edition, 3) link_fb, 4) empty
            if competition["link"]:
                current_event.link = competition["link"]
            elif "event_link" in event_date and event_date["event_link"]:
                current_event.link = event_date["event_link"]
            elif "link_fb" in competition and competition["link_fb"]:
                current_event.link = competition["link_fb"]
            else:
                current_event.link = ""
            current_event.id = competition["id"]
            current_event.year = event_date["year"]
            current_event.month = event_date["month"]
            current_event.day = event_date["day"]

            # Add event to the corresponding year
            competitions_output[event_date["year"]].append(current_event)

    # Write a separate JSON file for each year to json-files folder
    for year, events in competitions_output.items():
        # Sort events by date (year, month, day), then by id
        # Special case: events with id=0 are sorted last when dates are equal
        events.sort(key=lambda event: (event.year, event.month, event.day, float('inf') if event.id == 0 else event.id))

        competition_output_json = convert_object_into_json(events, 2)
        output_filename = os.path.join(json_files_dir, f"output-events-{year}.json")
        write_file(output_filename, competition_output_json)
        print(f"Created {output_filename} with {len(events)} events")


if __name__ == "__main__":
    main()