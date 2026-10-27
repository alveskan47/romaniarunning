import json
from datetime import datetime
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8', errors='replace')


def load_json_file(json_file_path):
    """
    Load and parse the JSON file.
    Returns a tuple of (success, data_or_error_message)
    """
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return True, data
    except FileNotFoundError:
        return False, f"File not found: {json_file_path}"
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"


def list_keys(sport):
    """Returns the (main, no_statistics) root keys for a sport."""
    return f"{sport}_competitions", f"{sport}_competitions_no_statistics"


def find_sport_files():
    """Returns a sorted list of (sport, path) for every input-*-competitions.json."""
    base_path = Path(__file__).parent.parent / 'json-files'
    result = []
    for json_file in sorted(base_path.glob('input-*-competitions.json')):
        sport = json_file.name[len('input-'):-len('-competitions.json')]
        result.append((sport, json_file))
    return result


def run_validator_for_all_sports(validator, pass_message):
    """Runs a validator(data, sport) on every sport file. Returns 0 on success, 1 otherwise."""
    all_errors = []
    sports = find_sport_files()
    for sport, json_file in sports:
        success, data = load_json_file(json_file)
        if not success:
            all_errors.append(f"[{sport}] {data}")
            continue
        _, errors = validator(data, sport)
        all_errors.extend(f"[{sport}] {e}" for e in errors)

    if not all_errors:
        print(f"[PASS] {pass_message} ({len(sports)} sport files checked)")
        return 0
    print(f"[FAIL] Found {len(all_errors)} error(s):\n")
    for error in all_errors:
        print(f"  - {error}")
    return 1


def validate_json_structure(data, sport="running"):
    """
    Validates the overall JSON structure of a sport's competition file.
    Required fields: id, name, location, county, link, link_fb, editions;
    "type" and "distances" are required for running only.
    Returns a tuple of (is_valid, errors_list)
    """
    main_key, nostats_key = list_keys(sport)
    errors = []

    # Check if root keys exist
    if not isinstance(data, dict):
        errors.append("Root element must be a JSON object/dictionary")
        return False, errors

    if main_key not in data:
        errors.append(f"Missing required root key: '{main_key}'")

    if nostats_key not in data:
        errors.append(f"Missing required root key: '{nostats_key}'")

    # If root structure is wrong, return early
    if errors:
        return False, errors

    # Validate each competition array
    competition_lists = [
        (main_key, data[main_key]),
        (nostats_key, data[nostats_key])
    ]

    for list_name, competitions in competition_lists:
        if not isinstance(competitions, list):
            errors.append(f"'{list_name}' must be an array/list")
            continue

        for comp_idx, competition in enumerate(competitions):
            if not isinstance(competition, dict):
                errors.append(
                    f"{list_name}[{comp_idx}]: Must be an object/dictionary"
                )
                continue

            comp_name = competition.get("name", f"Unknown_{comp_idx}")
            comp_id = competition.get("id", "?")

            # Check required fields for each competition
            required_fields = ["id", "name", "location", "county", "link", "link_fb", "editions"]
            if sport == "running":
                required_fields[4:4] = ["type", "distances"]

            for field in required_fields:
                if field not in competition:
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): "
                        f"Missing required field '{field}'"
                    )

            # Validate field types
            if "id" in competition and not isinstance(competition["id"], int):
                errors.append(
                    f"{list_name}[{comp_idx}] '{comp_name}': "
                    f"Field 'id' must be an integer"
                )

            if "name" in competition and not isinstance(competition["name"], str):
                errors.append(
                    f"{list_name}[{comp_idx}] (id={comp_id}): "
                    f"Field 'name' must be a string"
                )

            if "location" in competition and not isinstance(competition["location"], str):
                errors.append(
                    f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): "
                    f"Field 'location' must be a string"
                )

            if "county" in competition and not isinstance(competition["county"], str):
                errors.append(
                    f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): "
                    f"Field 'county' must be a string"
                )

            if "type" in competition and not isinstance(competition["type"], str):
                errors.append(
                    f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): "
                    f"Field 'type' must be a string"
                )

            if "distances" in competition:
                if not isinstance(competition["distances"], list):
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): "
                        f"Field 'distances' must be an array/list"
                    )
                else:
                    for dist_idx, distance in enumerate(competition["distances"]):
                        if not isinstance(distance, str):
                            errors.append(
                                f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                                f"distances[{dist_idx}]: Must be a string"
                            )

            if "link" in competition and not isinstance(competition["link"], str):
                errors.append(
                    f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): "
                    f"Field 'link' must be a string"
                )

            if "link_fb" in competition and not isinstance(competition["link_fb"], str):
                errors.append(
                    f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): "
                    f"Field 'link_fb' must be a string"
                )

            # Validate editions array
            if "editions" in competition:
                if not isinstance(competition["editions"], list):
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): "
                        f"Field 'editions' must be an array/list"
                    )
                    continue

                if len(competition["editions"]) == 0:
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): "
                        f"'editions' array cannot be empty"
                    )

                for ed_idx, edition in enumerate(competition["editions"]):
                    if not isinstance(edition, dict):
                        errors.append(
                            f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                            f"edition[{ed_idx}]: Must be an object/dictionary"
                        )
                        continue

                    # Check required fields in each edition
                    required_edition_fields = ["year", "month", "day"]
                    for field in required_edition_fields:
                        if field not in edition:
                            errors.append(
                                f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                                f"edition[{ed_idx}]: Missing required field '{field}'"
                            )

                    # Validate edition field types
                    if "year" in edition and not isinstance(edition["year"], int):
                        errors.append(
                            f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                            f"edition[{ed_idx}]: Field 'year' must be an integer"
                        )

                    if "month" in edition and not isinstance(edition["month"], int):
                        errors.append(
                            f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                            f"edition[{ed_idx}]: Field 'month' must be an integer"
                        )

                    if "day" in edition and not isinstance(edition["day"], int):
                        errors.append(
                            f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                            f"edition[{ed_idx}]: Field 'day' must be an integer"
                        )

    is_valid = len(errors) == 0
    return is_valid, errors


def validate_dates_in_json(data, sport="running"):
    """
    Validates all dates in the editions property of a sport's JSON file.
    Returns a tuple of (is_valid, errors_list)
    """
    main_key, nostats_key = list_keys(sport)
    errors = []

    # Check both competitions and competitions_no_statistics
    competition_lists = []
    if main_key in data:
        competition_lists.append((main_key, data[main_key]))
    if nostats_key in data:
        competition_lists.append((nostats_key, data[nostats_key]))

    for list_name, competitions in competition_lists:
        for comp_idx, competition in enumerate(competitions):
            comp_name = competition.get("name", f"Unknown_{comp_idx}")
            comp_id = competition.get("id", "?")

            if "editions" not in competition:
                errors.append(f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): Missing 'editions' property")
                continue

            for ed_idx, edition in enumerate(competition["editions"]):
                year = edition.get("year")
                month = edition.get("month")
                day = edition.get("day")

                # Check if all date fields are present
                if year is None:
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                        f"edition[{ed_idx}]: Missing 'year'"
                    )
                    continue

                if month is None:
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                        f"edition[{ed_idx}]: Missing 'month'"
                    )
                    continue

                if day is None:
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                        f"edition[{ed_idx}]: Missing 'day'"
                    )
                    continue

                # Validate year (reasonable range: 2000-2050)
                if not isinstance(year, int) or year < 2000 or year > 2050:
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                        f"edition[{ed_idx}]: Invalid year '{year}' (must be integer between 2000-2050)"
                    )
                    continue

                # Validate month (1-12)
                if not isinstance(month, int) or month < 1 or month > 12:
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                        f"edition[{ed_idx}]: Invalid month '{month}' (must be integer between 1-12)"
                    )
                    continue

                # Validate day (1-31, depending on month)
                if not isinstance(day, int) or day < 1:
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                        f"edition[{ed_idx}]: Invalid day '{day}' (must be positive integer)"
                    )
                    continue

                # Validate that the date is valid (e.g., no Feb 30, no Apr 31, etc.)
                try:
                    datetime(year, month, day)
                except ValueError as e:
                    errors.append(
                        f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}), "
                        f"edition[{ed_idx}]: Invalid date {year}-{month:02d}-{day:02d} - {str(e)}"
                    )

    is_valid = len(errors) == 0
    return is_valid, errors


def validate_unique_years_per_competition(data, sport="running"):
    """
    Validates that each competition has unique years in its editions.
    A competition cannot have multiple editions in the same year.
    Returns a tuple of (is_valid, errors_list)
    """
    main_key, nostats_key = list_keys(sport)
    errors = []

    # Check both competitions and competitions_no_statistics
    competition_lists = []
    if main_key in data:
        competition_lists.append((main_key, data[main_key]))
    if nostats_key in data:
        competition_lists.append((nostats_key, data[nostats_key]))

    for list_name, competitions in competition_lists:
        for comp_idx, competition in enumerate(competitions):
            comp_name = competition.get("name", f"Unknown_{comp_idx}")
            comp_id = competition.get("id", "?")

            if "editions" not in competition:
                # This error is already caught by validate_dates_in_json
                continue

            # Collect all years for this competition
            years = []
            for ed_idx, edition in enumerate(competition["editions"]):
                year = edition.get("year")
                if year is not None:
                    years.append(year)

            # Check for duplicates
            seen_years = set()
            duplicate_years = set()

            for year in years:
                if year in seen_years:
                    duplicate_years.add(year)
                seen_years.add(year)

            if duplicate_years:
                duplicate_years_str = ", ".join(str(y) for y in sorted(duplicate_years))
                errors.append(
                    f"{list_name}[{comp_idx}] '{comp_name}' (id={comp_id}): "
                    f"Duplicate year(s) found in editions: {duplicate_years_str}"
                )

    is_valid = len(errors) == 0
    return is_valid, errors


def validate_competition_ids(data, sport="running"):
    """
    Validates that:
    - In '<sport>_competitions', all IDs are consecutive starting with 1
    - In '<sport>_competitions_no_statistics', all IDs are 0
    Returns a tuple of (is_valid, errors_list)
    """
    main_key, nostats_key = list_keys(sport)
    errors = []

    # Validate main list - IDs should be consecutive starting with 1
    if main_key in data:
        competitions = data[main_key]
        if isinstance(competitions, list):
            expected_id = 1
            for comp_idx, competition in enumerate(competitions):
                if not isinstance(competition, dict):
                    continue  # Skip non-dict items, caught by other validation

                comp_name = competition.get("name", f"Unknown_{comp_idx}")
                comp_id = competition.get("id")

                if comp_id is None:
                    # Missing ID error is caught by validate_json_structure
                    continue

                if comp_id != expected_id:
                    errors.append(
                        f"{main_key}[{comp_idx}] '{comp_name}': "
                        f"Expected id={expected_id}, but found id={comp_id}. "
                        f"IDs must be consecutive starting with 1."
                    )

                expected_id += 1

    # Validate no_statistics list - all IDs should be 0
    if nostats_key in data:
        competitions_no_stats = data[nostats_key]
        if isinstance(competitions_no_stats, list):
            for comp_idx, competition in enumerate(competitions_no_stats):
                if not isinstance(competition, dict):
                    continue  # Skip non-dict items, caught by other validation

                comp_name = competition.get("name", f"Unknown_{comp_idx}")
                comp_id = competition.get("id")

                if comp_id is None:
                    # Missing ID error is caught by validate_json_structure
                    continue

                if comp_id != 0:
                    errors.append(
                        f"{nostats_key}[{comp_idx}] '{comp_name}': "
                        f"Expected id=0, but found id={comp_id}. "
                        f"All competitions in this list must have id=0."
                    )

    is_valid = len(errors) == 0
    return is_valid, errors


def validate_unique_competition_names(data, sport="running"):
    """
    Validates that all competition names are unique across both
    '<sport>_competitions' and '<sport>_competitions_no_statistics' arrays.
    Returns a tuple of (is_valid, errors_list)
    """
    main_key, nostats_key = list_keys(sport)
    errors = []

    # Collect all competition names from both lists
    all_names = []
    name_locations = {}  # Map name to list of locations where it appears

    # Check both competitions and competitions_no_statistics
    competition_lists = []
    if main_key in data:
        competition_lists.append((main_key, data[main_key]))
    if nostats_key in data:
        competition_lists.append((nostats_key, data[nostats_key]))

    for list_name, competitions in competition_lists:
        if not isinstance(competitions, list):
            continue

        for comp_idx, competition in enumerate(competitions):
            if not isinstance(competition, dict):
                continue

            comp_name = competition.get("name")
            comp_id = competition.get("id", "?")

            if comp_name is None:
                # Missing name error is caught by validate_json_structure
                continue

            # Track where this name appears
            location = f"{list_name}[{comp_idx}] (id={comp_id})"
            if comp_name not in name_locations:
                name_locations[comp_name] = []
            name_locations[comp_name].append(location)

    # Find duplicate names
    for name, locations in name_locations.items():
        if len(locations) > 1:
            locations_str = ", ".join(locations)
            errors.append(
                f"Duplicate competition name '{name}' found at: {locations_str}"
            )

    is_valid = len(errors) == 0
    return is_valid, errors


def test_json_structure():
    """Runs validate_json_structure on every sport file"""
    print("TEST 1: Validating JSON structure")
    print("-" * 80)
    return run_validator_for_all_sports(validate_json_structure, "JSON structure is valid!")


def test_dates():
    """Runs validate_dates_in_json on every sport file"""
    print("\nTEST 2: Validating dates")
    print("-" * 80)
    return run_validator_for_all_sports(validate_dates_in_json, "All dates are valid!")


def test_unique_years():
    """Runs validate_unique_years_per_competition on every sport file"""
    print("\nTEST 3: Validating unique years per competition")
    print("-" * 80)
    return run_validator_for_all_sports(validate_unique_years_per_competition, "All competitions have unique years in their editions!")


def test_competition_ids():
    """Runs validate_competition_ids on every sport file"""
    print("\nTEST 4: Validating competition IDs")
    print("-" * 80)
    return run_validator_for_all_sports(validate_competition_ids, "All competition IDs are valid!")


def test_unique_competition_names():
    """Runs validate_unique_competition_names on every sport file"""
    print("\nTEST 5: Validating unique competition names")
    print("-" * 80)
    return run_validator_for_all_sports(validate_unique_competition_names, "All competition names are unique!")


def test_duplicate_ids_all_sports():
    """Test function that checks for duplicate ids in every input-*-competitions.json"""
    print("\nTEST 6: Validating unique ids in all sports input files")
    print("-" * 80)

    base_path = Path(__file__).parent.parent / 'json-files'
    errors = []
    for json_file in sorted(base_path.glob('input-*-competitions.json')):
        success, data = load_json_file(json_file)
        if not success:
            errors.append(f"{json_file.name}: {data}")
            continue
        for list_name, competitions in data.items():
            if not isinstance(competitions, list):
                continue
            seen = {}
            for comp in competitions:
                if isinstance(comp, dict) and comp.get("id"):  # id 0 = placeholder (no statistics)
                    seen.setdefault(comp["id"], []).append(comp.get("name", "?"))
            for comp_id, names in seen.items():
                if len(names) > 1:
                    errors.append(f"{json_file.name} {list_name}: id {comp_id} used by {', '.join(names)}")

    if not errors:
        print("[PASS] All ids are unique in every sport file!")
        return 0
    print(f"[FAIL] Found {len(errors)} error(s):\n")
    for error in errors:
        print(f"  - {error}")
    return 1


def run_all_tests():
    """Run all tests and return overall result"""
    print("Running all tests for all input-*-competitions.json files")
    print("=" * 80)

    test_results = []

    # Run test 1: JSON structure validation
    result1 = test_json_structure()
    test_results.append(result1)

    # Run test 2: Date validation
    result2 = test_dates()
    test_results.append(result2)

    # Run test 3: Unique years validation
    result3 = test_unique_years()
    test_results.append(result3)

    # Run test 4: Competition IDs validation
    result4 = test_competition_ids()
    test_results.append(result4)

    # Run test 5: Unique competition names validation
    result5 = test_unique_competition_names()
    test_results.append(result5)

    # Run test 6: Unique ids across all sports
    test_results.append(test_duplicate_ids_all_sports())

    # Summary
    print("\n" + "=" * 80)
    total_tests = len(test_results)
    passed_tests = sum(1 for r in test_results if r == 0)
    failed_tests = total_tests - passed_tests

    print(f"SUMMARY: {passed_tests}/{total_tests} tests passed")

    if failed_tests == 0:
        print("[ALL TESTS PASSED]")
        return 0
    else:
        print(f"[{failed_tests} TEST(S) FAILED]")
        return 1


if __name__ == "__main__":
    sys.exit(run_all_tests())