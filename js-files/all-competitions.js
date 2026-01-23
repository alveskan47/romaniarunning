// JavaScript file for All Competitions page

// Global variables to store data and sorting state
let competitionsData = [];
let moldovaCompetitionsData = [];
let otherCompetitionsData = [];
let sortState = {
    table1: { column: 'name', ascending: true },
    table2: { column: 'name', ascending: true },
    table3: { column: 'name', ascending: true }
};

/**
 * Romanian sort key function for proper alphabetical ordering
 * @param {string} text - Text to create sort key for
 * @returns {string} Modified text for proper sorting
 */
function romanianSortKey(text) {
    if (!text) return '';

    const replacements = {
        'ă': 'a~1', 'Ă': 'A~1',
        'â': 'a~2', 'Â': 'A~2',
        'î': 'i~1', 'Î': 'I~1',
        'ș': 's~1', 'Ș': 'S~1',
        'ț': 't~1', 'Ț': 'T~1'
    };

    let result = text.toLowerCase();
    for (const [char, replacement] of Object.entries(replacements)) {
        result = result.replace(new RegExp(char.toLowerCase(), 'g'), replacement.toLowerCase());
    }
    return result;
}

/**
 * Converts date string like "Sat 24-Jan" to a sortable number (MMDD format)
 * @param {string} dateStr - Date string in format "DayName DD-Mon"
 * @returns {number} Sortable number representing the date
 */
function dateToSortableNumber(dateStr) {
    if (!dateStr) return 0;

    const months = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };

    // Extract day and month from "Sat 24-Jan" format
    const parts = dateStr.split(' ');
    if (parts.length !== 2) return 0;

    const dayMonth = parts[1].split('-');
    if (dayMonth.length !== 2) return 0;

    const day = parseInt(dayMonth[0]) || 0;
    const month = months[dayMonth[1]] || 0;

    // Return MMDD as a number (e.g., 524 for May 24)
    return month * 100 + day;
}

/**
 * Sorts an array of competition objects by the specified column
 * @param {Array} data - Array of competition objects
 * @param {string} column - Column name to sort by
 * @param {boolean} ascending - Sort direction
 * @returns {Array} Sorted array
 */
function sortCompetitions(data, column, ascending) {
    const sorted = [...data];

    sorted.sort((a, b) => {
        let valA = a[column] || '';
        let valB = b[column] || '';

        // For ID column, use numeric sorting
        if (column === 'id') {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
            return ascending ? valA - valB : valB - valA;
        }

        // For year columns, use date sorting
        if (column.startsWith('year_')) {
            const dateA = dateToSortableNumber(valA);
            const dateB = dateToSortableNumber(valB);

            // Empty dates should be at the end
            if (dateA === 0 && dateB === 0) return 0;
            if (dateA === 0) return 1;
            if (dateB === 0) return -1;

            return ascending ? dateA - dateB : dateB - dateA;
        }

        // For text columns, use Romanian sorting
        const keyA = romanianSortKey(valA.toString());
        const keyB = romanianSortKey(valB.toString());

        if (keyA < keyB) return ascending ? -1 : 1;
        if (keyA > keyB) return ascending ? 1 : -1;
        return 0;
    });

    return sorted;
}

/**
 * Updates sort icons for table headers
 * @param {string} tableId - ID of the table
 * @param {string} column - Currently sorted column
 * @param {boolean} ascending - Sort direction
 */
function updateSortIcons(tableId, column, ascending) {
    const table = document.querySelector(`#${tableId}`);
    if (!table) return;

    // Reset all icons
    table.querySelectorAll('th i').forEach(icon => {
        icon.className = 'bi bi-arrow-down-up';
    });

    // Set active icon
    const activeHeader = table.querySelector(`th[data-column="${column}"] i`);
    if (activeHeader) {
        activeHeader.className = ascending ? 'bi bi-sort-alpha-down' : 'bi bi-sort-alpha-up';
    }
}

/**
 * Populates the first table with full competition data (ID, Name, Location, County, Year columns)
 * @param {Array} competitions - Array of competition objects
 */
function populateTable1(competitions) {
    const tableBody = document.getElementById('competitions-table-body');

    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }

    // Clear any existing content
    tableBody.innerHTML = '';

    // Check if we have data
    if (!competitions || competitions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No competitions found</td></tr>';
        return;
    }

    // Create table rows for each competition
    competitions.forEach((competition) => {
        const row = document.createElement('tr');

        // ID column
        const idCell = document.createElement('td');
        idCell.textContent = competition.id || '';
        row.appendChild(idCell);

        // Name column
        const nameCell = document.createElement('td');
        nameCell.textContent = competition.name || '';
        row.appendChild(nameCell);

        // Location column
        const locationCell = document.createElement('td');
        locationCell.textContent = competition.location || '';
        row.appendChild(locationCell);

        // County column
        const countyCell = document.createElement('td');
        countyCell.textContent = competition.county || '';
        row.appendChild(countyCell);

        // Year columns (2026, 2025, 2024, 2023)
        ['year_2026', 'year_2025', 'year_2024', 'year_2023'].forEach(yearKey => {
            const yearCell = document.createElement('td');
            yearCell.textContent = competition[yearKey] || '';
            row.appendChild(yearCell);
        });

        tableBody.appendChild(row);
    });
}

/**
 * Populates the second table with Moldova competition data (Name, Location, Year columns)
 * @param {Array} competitions - Array of competition objects
 */
function populateTable2(competitions) {
    const tableBody = document.getElementById('competitions-moldova-table-body');

    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }

    // Clear any existing content
    tableBody.innerHTML = '';

    // Check if we have data
    if (!competitions || competitions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No competitions found</td></tr>';
        return;
    }

    // Create table rows for each competition
    competitions.forEach((competition) => {
        const row = document.createElement('tr');

        // Name column
        const nameCell = document.createElement('td');
        nameCell.textContent = competition.name || '';
        row.appendChild(nameCell);

        // Location column
        const locationCell = document.createElement('td');
        locationCell.textContent = competition.location || '';
        row.appendChild(locationCell);

        // Year columns (2026, 2025, 2024, 2023)
        ['year_2026', 'year_2025', 'year_2024', 'year_2023'].forEach(yearKey => {
            const yearCell = document.createElement('td');
            yearCell.textContent = competition[yearKey] || '';
            row.appendChild(yearCell);
        });

        tableBody.appendChild(row);
    });
}

/**
 * Populates the third table with other competition data (Name and Year columns)
 * @param {Array} competitions - Array of competition objects
 */
function populateTable3(competitions) {
    const tableBody = document.getElementById('competitions-other-table-body');

    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }

    // Clear any existing content
    tableBody.innerHTML = '';

    // Check if we have data
    if (!competitions || competitions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No competitions found</td></tr>';
        return;
    }

    // Create table rows for each competition
    competitions.forEach((competition) => {
        const row = document.createElement('tr');

        // Name column
        const nameCell = document.createElement('td');
        nameCell.textContent = competition.name || '';
        row.appendChild(nameCell);

        // Year columns (2026, 2025, 2024, 2023)
        ['year_2026', 'year_2025', 'year_2024', 'year_2023'].forEach(yearKey => {
            const yearCell = document.createElement('td');
            yearCell.textContent = competition[yearKey] || '';
            row.appendChild(yearCell);
        });

        tableBody.appendChild(row);
    });
}

/**
 * Handles sorting for table 1
 * @param {string} column - Column name to sort by
 */
function sortTable1(column) {
    // Toggle sort direction if clicking the same column
    if (sortState.table1.column === column) {
        sortState.table1.ascending = !sortState.table1.ascending;
    } else {
        sortState.table1.column = column;
        sortState.table1.ascending = true;
    }

    // Sort and display
    const sorted = sortCompetitions(competitionsData, column, sortState.table1.ascending);
    populateTable1(sorted);
    updateSortIcons('table-1', column, sortState.table1.ascending);
}

/**
 * Handles sorting for table 2 (Moldova competitions)
 * @param {string} column - Column name to sort by
 */
function sortTable2(column) {
    // Toggle sort direction if clicking the same column
    if (sortState.table2.column === column) {
        sortState.table2.ascending = !sortState.table2.ascending;
    } else {
        sortState.table2.column = column;
        sortState.table2.ascending = true;
    }

    // Sort and display
    const sorted = sortCompetitions(moldovaCompetitionsData, column, sortState.table2.ascending);
    populateTable2(sorted);
    updateSortIcons('table-2', column, sortState.table2.ascending);
}

/**
 * Handles sorting for table 3 (Other competitions)
 * @param {string} column - Column name to sort by
 */
function sortTable3(column) {
    // Toggle sort direction if clicking the same column
    if (sortState.table3.column === column) {
        sortState.table3.ascending = !sortState.table3.ascending;
    } else {
        sortState.table3.column = column;
        sortState.table3.ascending = true;
    }

    // Sort and display
    const sorted = sortCompetitions(otherCompetitionsData, column, sortState.table3.ascending);
    populateTable3(sorted);
    updateSortIcons('table-3', column, sortState.table3.ascending);
}

/**
 * Loads and displays all competitions in three separate tables
 */
async function loadAllCompetitions() {
    try {
        // Fetch the competitions list data
        const data = await fetch_json_file('json-files/output-all-competitions-list.json');

        // Store data globally
        competitionsData = data.competitions || [];
        moldovaCompetitionsData = data.competitions_moldova || [];
        otherCompetitionsData = data.competitions_other || [];

        // Sort by name initially (already sorted from Python, but ensure consistency)
        const sorted1 = sortCompetitions(competitionsData, 'name', true);
        const sorted2 = sortCompetitions(moldovaCompetitionsData, 'name', true);
        const sorted3 = sortCompetitions(otherCompetitionsData, 'name', true);

        // Populate the tables
        populateTable1(sorted1);
        populateTable2(sorted2);
        populateTable3(sorted3);

        // Update sort icons to show initial state
        updateSortIcons('table-1', 'name', true);
        updateSortIcons('table-2', 'name', true);
        updateSortIcons('table-3', 'name', true);

        // Update the competition counts
        const count1Element = document.getElementById('competition-count-1');
        if (count1Element) {
            count1Element.textContent = `Total: ${competitionsData.length} competitions`;
        }

        const count2Element = document.getElementById('competition-count-2');
        if (count2Element) {
            count2Element.textContent = `Total: ${moldovaCompetitionsData.length} competitions`;
        }

        const count3Element = document.getElementById('competition-count-3');
        if (count3Element) {
            count3Element.textContent = `Total: ${otherCompetitionsData.length} competitions`;
        }

        console.log(`Loaded ${competitionsData.length} regular competitions`);
        console.log(`Loaded ${moldovaCompetitionsData.length} Moldova competitions`);
        console.log(`Loaded ${otherCompetitionsData.length} other competitions`);

    } catch (error) {
        console.error('Error loading competitions:', error);

        // Show error in all tables
        const tableBody1 = document.getElementById('competitions-table-body');
        if (tableBody1) {
            tableBody1.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading competitions data</td></tr>';
        }

        const tableBody2 = document.getElementById('competitions-moldova-table-body');
        if (tableBody2) {
            tableBody2.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading competitions data</td></tr>';
        }

        const tableBody3 = document.getElementById('competitions-other-table-body');
        if (tableBody3) {
            tableBody3.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading competitions data</td></tr>';
        }
    }
}

/**
 * Initialize sort button event listeners
 */
function initializeSortButtons() {
    // Table 1 sort buttons
    document.querySelectorAll('#table-1 th[data-column]').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            sortTable1(header.getAttribute('data-column'));
        });
    });

    // Table 2 sort buttons (Moldova)
    document.querySelectorAll('#table-2 th[data-column]').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            sortTable2(header.getAttribute('data-column'));
        });
    });

    // Table 3 sort buttons (Other)
    document.querySelectorAll('#table-3 th[data-column]').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            sortTable3(header.getAttribute('data-column'));
        });
    });
}

// Initialize the page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadAllCompetitions();
    initializeSortButtons();
});