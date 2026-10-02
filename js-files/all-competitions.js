// JavaScript file for All Competitions (Archive) page

// Years with per-year event data available (json-files/output-events-{year}.json)
const ARCHIVE_YEARS = [2023, 2024, 2025, 2026, 2027];
const ARCHIVE_MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ARCHIVE_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let selectedSport = 'running';
// Cache: year -> events[] (every sport, unfiltered)
const rawEventsByYear = {};

// Global variables to store data and sorting state
let competitionsData = [];
let moldovaCompetitionsData = [];
let otherCompetitionsData = [];
let availableYears = ARCHIVE_YEARS.slice().sort((a, b) => b - a);
let showSportColumn = false;
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
 * Formats a year/month/day as "DayName DD-Mon" (e.g., "Sat 24-Jan"), matching the
 * format produced by python-files/create-all-competitions-list.py
 * @param {number} year - Full year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day of month
 * @returns {string} Formatted date string
 */
function formatArchiveEditionDate(year, month, day) {
    const date = new Date(year, month - 1, day);
    return `${ARCHIVE_DAY_NAMES[date.getDay()]} ${day}-${ARCHIVE_MONTH_ABBR[month - 1]}`;
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
 * Builds the regular/Moldova/other competition lists for the selected sport by
 * reshaping the per-year events (json-files/output-events-{year}.json) into one
 * row per competition, with a year_YYYY column per edition.
 * - Regular competitions have a non-zero id (unique within their sport).
 * - Competitions without individual statistics tracking share id 0; among those,
 *   county "MDA*" marks a Moldova competition, everything else is "other" (virtual, etc.)
 * @param {string} sport - The sport to filter by ('all' for every sport)
 */
function buildCompetitionLists(sport) {
    const regularMap = new Map();
    const moldovaMap = new Map();
    const otherMap = new Map();

    ARCHIVE_YEARS.forEach(year => {
        const events = rawEventsByYear[year] || [];
        events.forEach(e => {
            if (sport !== 'all' && e.sport !== sport) return;

            const formattedDate = formatArchiveEditionDate(e.year, e.month, e.day);

            if (e.id !== 0) {
                const key = `${e.sport}::${e.id}`;
                if (!regularMap.has(key)) {
                    regularMap.set(key, {
                        id: e.id,
                        name: e.name,
                        location: e.location,
                        county: e.county,
                        sport: e.sport
                    });
                }
                regularMap.get(key)[`year_${year}`] = formattedDate;
            } else if (e.county === 'MDA*') {
                const key = `${e.sport}::${e.name}`;
                if (!moldovaMap.has(key)) {
                    moldovaMap.set(key, { name: e.name, location: e.location, sport: e.sport });
                }
                moldovaMap.get(key)[`year_${year}`] = formattedDate;
            } else {
                const key = `${e.sport}::${e.name}`;
                if (!otherMap.has(key)) {
                    otherMap.set(key, { name: e.name, sport: e.sport });
                }
                otherMap.get(key)[`year_${year}`] = formattedDate;
            }
        });
    });

    competitionsData = Array.from(regularMap.values());
    moldovaCompetitionsData = Array.from(moldovaMap.values());
    otherCompetitionsData = Array.from(otherMap.values());
    showSportColumn = sport === 'all';
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
        const colspan = (showSportColumn ? 5 : 4) + availableYears.length;
        tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center">No competitions found</td></tr>`;
        return;
    }

    // Create table rows for each competition
    competitions.forEach((competition) => {
        const row = document.createElement('tr');

        if (showSportColumn) {
            const sportCell = document.createElement('td');
            sportCell.textContent = formatSportName(competition.sport);
            row.appendChild(sportCell);
        }

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

        // Year columns (dynamic)
        availableYears.forEach(year => {
            const yearCell = document.createElement('td');
            yearCell.textContent = competition[`year_${year}`] || '';
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
        const colspan = (showSportColumn ? 3 : 2) + availableYears.length;
        tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center">No competitions found</td></tr>`;
        return;
    }

    // Create table rows for each competition
    competitions.forEach((competition) => {
        const row = document.createElement('tr');

        if (showSportColumn) {
            const sportCell = document.createElement('td');
            sportCell.textContent = formatSportName(competition.sport);
            row.appendChild(sportCell);
        }

        // Name column
        const nameCell = document.createElement('td');
        nameCell.textContent = competition.name || '';
        row.appendChild(nameCell);

        // Location column
        const locationCell = document.createElement('td');
        locationCell.textContent = competition.location || '';
        row.appendChild(locationCell);

        // Year columns (dynamic)
        availableYears.forEach(year => {
            const yearCell = document.createElement('td');
            yearCell.textContent = competition[`year_${year}`] || '';
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
        const colspan = (showSportColumn ? 2 : 1) + availableYears.length;
        tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center">No competitions found</td></tr>`;
        return;
    }

    // Create table rows for each competition
    competitions.forEach((competition) => {
        const row = document.createElement('tr');

        if (showSportColumn) {
            const sportCell = document.createElement('td');
            sportCell.textContent = formatSportName(competition.sport);
            row.appendChild(sportCell);
        }

        // Name column
        const nameCell = document.createElement('td');
        nameCell.textContent = competition.name || '';
        row.appendChild(nameCell);

        // Year columns (dynamic)
        availableYears.forEach(year => {
            const yearCell = document.createElement('td');
            yearCell.textContent = competition[`year_${year}`] || '';
            row.appendChild(yearCell);
        });

        tableBody.appendChild(row);
    });
}

// Fixed (non-year) columns for each table, before the Sport column (if shown) and year columns are added
const TABLE_CONFIGS = {
    'table-1': {
        fixedColumns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Competition Name' },
            { key: 'location', label: 'Location' },
            { key: 'county', label: 'County' }
        ],
        sortFn: column => sortTable1(column)
    },
    'table-2': {
        fixedColumns: [
            { key: 'name', label: 'Competition Name' },
            { key: 'location', label: 'Location' }
        ],
        sortFn: column => sortTable2(column)
    },
    'table-3': {
        fixedColumns: [
            { key: 'name', label: 'Competition Name' }
        ],
        sortFn: column => sortTable3(column)
    }
};

/**
 * Rebuilds a table's header row (fixed columns, optional Sport column, year columns)
 * and (re)attaches sort click handlers
 * @param {string} tableId - ID of the table
 */
function renderTableHeader(tableId) {
    const config = TABLE_CONFIGS[tableId];
    const headerRow = document.querySelector(`#${tableId} thead tr`);
    if (!headerRow || !config) return;

    headerRow.innerHTML = '';

    const columns = [];
    if (showSportColumn) columns.push({ key: 'sport', label: 'Sport' });
    columns.push(...config.fixedColumns);
    availableYears.forEach(year => columns.push({ key: `year_${year}`, label: String(year), isYear: true }));

    columns.forEach(col => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.setAttribute('data-column', col.key);
        th.className = 'user-select-none' + (col.isYear ? ' year-column' : '');
        th.style.cursor = 'pointer';
        th.innerHTML = `${col.label} <i class="bi bi-arrow-down-up"></i>`;
        th.addEventListener('click', () => config.sortFn(col.key));
        headerRow.appendChild(th);
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
 * Updates the "Total: N competitions" captions under each table title
 */
function updateCompetitionCounts() {
    const count1Element = document.getElementById('competition-count-1');
    if (count1Element) count1Element.textContent = `Total: ${competitionsData.length} competitions`;

    const count2Element = document.getElementById('competition-count-2');
    if (count2Element) count2Element.textContent = `Total: ${moldovaCompetitionsData.length} competitions`;

    const count3Element = document.getElementById('competition-count-3');
    if (count3Element) count3Element.textContent = `Total: ${otherCompetitionsData.length} competitions`;
}

/**
 * Rebuilds the competition lists for the selected sport and redraws every table from scratch
 */
function rebuildAndRenderTables() {
    buildCompetitionLists(selectedSport);

    renderTableHeader('table-1');
    renderTableHeader('table-2');
    renderTableHeader('table-3');

    sortState = {
        table1: { column: 'name', ascending: true },
        table2: { column: 'name', ascending: true },
        table3: { column: 'name', ascending: true }
    };

    const sorted1 = sortCompetitions(competitionsData, 'name', true);
    const sorted2 = sortCompetitions(moldovaCompetitionsData, 'name', true);
    const sorted3 = sortCompetitions(otherCompetitionsData, 'name', true);

    populateTable1(sorted1);
    populateTable2(sorted2);
    populateTable3(sorted3);

    updateSortIcons('table-1', 'name', true);
    updateSortIcons('table-2', 'name', true);
    updateSortIcons('table-3', 'name', true);

    updateCompetitionCounts();
}

/**
 * Changes the displayed sport and rebuilds/redraws every table
 * @param {string} sport - The sport value to display ('all' for every sport)
 */
function change_sport(sport) {
    selectedSport = sport;
    const sportEntry = SPORTS.find(s => s.value === sport);
    document.getElementById('text_sport').textContent = sportEntry ? sportEntry.label : sport;
    updateSportInUrl(sport);
    rebuildAndRenderTables();
}

/**
 * Loads (and caches) every year's events, then builds and displays all three tables
 */
async function loadAllCompetitions() {
    try {
        await Promise.all(ARCHIVE_YEARS.map(async year => {
            if (rawEventsByYear[year] === undefined) {
                rawEventsByYear[year] = await fetch_json_file(`json-files/output-events-${year}.json`);
            }
        }));

        rebuildAndRenderTables();
    } catch (error) {
        console.error('Error loading competitions:', error);

        ['competitions-table-body', 'competitions-moldova-table-body', 'competitions-other-table-body'].forEach(id => {
            const tableBody = document.getElementById(id);
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="99" class="text-center text-danger">Error loading competitions data</td></tr>';
            }
        });
    }
}

// Initialize the page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    selectedSport = getSportFromUrl();
    const sportEntry = SPORTS.find(s => s.value === selectedSport);
    document.getElementById('text_sport').textContent = sportEntry ? sportEntry.label : selectedSport;
    updateSportInUrl(selectedSport);
    loadAvailableSports('sport-dropdown-menu', 'change_sport');

    loadAllCompetitions();
});
