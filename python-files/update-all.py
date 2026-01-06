"""
update-all.py

Purpose:
--------
This is the main script to update all competition data and statistics.
It orchestrates the execution of three sub-scripts in the correct order:

1. test_json_input_file.py - Tests and validates the input JSON data
2. create-competitions-tables.py - Generates yearly competition tables from the input data
3. update-statistics.py - Calculates and updates all statistics based on the competition data

Usage:
------
Run this script whenever you need to update the competition data:
    python update-all.py

This ensures both the yearly tables and statistics are updated consistently.
"""

import subprocess
import sys
from pathlib import Path


def run_script(script_name, description):
    """
    Run a Python script and handle its output.

    Parameters:
    -----------
    script_name : str
        Name of the Python script to run (e.g., "create-competitions-tables.py")
    description : str
        Human-readable description of what the script does

    Returns:
    --------
    bool
        True if the script ran successfully, False otherwise
    """
    print(f"\n{'=' * 70}")
    print(f"Running: {description}")
    print(f"{'=' * 70}\n")

    # Get the directory where this script is located
    script_dir = Path(__file__).parent
    script_path = script_dir / script_name

    try:
        # Run the script using subprocess
        result = subprocess.run(
            [sys.executable, str(script_path)],
            check=True,
            capture_output=True,
            text=True
        )

        # Print the output from the script
        if result.stdout:
            print(result.stdout)

        print(f"\n✓ {description} completed successfully!")
        return True

    except subprocess.CalledProcessError as e:
        print(f"\n✗ Error running {script_name}:")
        print(e.stderr if e.stderr else str(e))
        return False

    except Exception as e:
        print(f"\n✗ Unexpected error running {script_name}:")
        print(str(e))
        return False


def main():
    """
    Main function to run all update scripts in sequence.

    This function coordinates the execution of:
    1. JSON input validation
    2. Competition tables generation
    3. Statistics calculation

    If any script fails, the process stops and reports the error.
    """
    print("\n" + "=" * 70)
    print("COMPETITION DATA UPDATE PROCESS")
    print("=" * 70)

    # Step 1: Test and validate JSON input
    success = run_script(
        "test_json_input_file.py",
        "Testing and validating JSON input data"
    )

    if not success:
        print("\n" + "=" * 70)
        print("✗ UPDATE FAILED: JSON validation failed")
        print("=" * 70)
        sys.exit(1)

    # Step 2: Create competition tables
    success = run_script(
        "create-competitions-tables.py",
        "Creating competition tables by year"
    )

    if not success:
        print("\n" + "=" * 70)
        print("✗ UPDATE FAILED: Could not create competition tables")
        print("=" * 70)
        sys.exit(1)

    # Step 3: Update statistics
    success = run_script(
        "update-statistics.py",
        "Updating competition statistics"
    )

    if not success:
        print("\n" + "=" * 70)
        print("✗ UPDATE FAILED: Could not update statistics")
        print("=" * 70)
        sys.exit(1)

    # All scripts completed successfully
    print("\n" + "=" * 70)
    print("✓ ALL UPDATES COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    print("\nUpdated files:")
    print("  - json-files/output-events-{year}.json (one file per year)")
    print("  - json-files/output-all-statistics.json")
    print("\n")


if __name__ == "__main__":
    main()