/**
 * JavaScript file specific to index.html (Home page - Competitions)
 * Handles year selection, sport selection, and competition table display
 */

// Current year/sport trackers
let currentCompetitionYear = new Date().getFullYear();
let currentCompetitionSport = 'running';

// SPORTS, formatSportName, getSportFromUrl and updateSportInUrl are defined in main.js
// and shared across pages that support multisport filtering.

// Currently displayed competitions and sort state (date ascending is the default)
let currentCompetitions = [];
let currentSort = { column: 'date', ascending: true };

// Active filters ('all' / empty text means no filtering on that column)
const DEFAULT_FILTERS = { month: 'all', name: '', location: 'all', county: 'all', type: 'all' };
let competitionFilters = { ...DEFAULT_FILTERS };

/**
 * Compares two competitions chronologically (year, month, day)
 * @returns {number} Negative, zero or positive like Array.sort comparators
 */
function compareByDate(a, b) {
    return (a.year - b.year) || (a.month - b.month) || (a.day - b.day);
}

/**
 * Sorts competitions by the given column; ties (and the date column itself) fall back to date order
 * @param {Array} competitions - Array of competition objects
 * @param {string} column - Column key to sort by
 * @param {boolean} ascending - Sort direction
 * @returns {Array} New sorted array
 */
function sortCompetitionList(competitions, column, ascending) {
    const direction = ascending ? 1 : -1;
    const collator = new Intl.Collator('ro', { sensitivity: 'base' });

    return [...competitions].sort((a, b) => {
        if (column === 'date') {
            return direction * compareByDate(a, b);
        }

        const valA = column === 'sport' ? formatSportName(a.sport) : (a[column] || '');
        const valB = column === 'sport' ? formatSportName(b.sport) : (b[column] || '');
        // Empty values always go last, regardless of direction
        if (!valA && valB) return 1;
        if (valA && !valB) return -1;

        return direction * collator.compare(String(valA), String(valB)) || compareByDate(a, b);
    });
}

/**
 * Handles a click on a sortable header: toggles direction on the same column, otherwise sorts ascending
 * @param {string} column - Column key to sort by
 */
function sortCompetitionsBy(column) {
    if (currentSort.column === column) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort = { column, ascending: true };
    }
    renderCurrentCompetitions();
}

/**
 * Renders the current competitions into the container using the current sort
 */
function renderCurrentCompetitions() {
    const container = document.getElementById('competitions-container');
    container.innerHTML = renderCompetitionsTable(getVisibleCompetitions(), currentCompetitionYear, currentCompetitionSport);

    container.querySelectorAll('th[data-column]').forEach(th => {
        th.addEventListener('click', () => sortCompetitionsBy(th.dataset.column));
    });
    container.querySelectorAll('[data-filter]').forEach(control => {
        control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', () => {
            competitionFilters[control.dataset.filter] = control.value;
            refreshTableBody();
        });
    });
    container.querySelector('[data-reset-filters]')?.addEventListener('click', resetFilters);
}

/**
 * Restores every filter to its default ("All" / empty text) and refreshes the table body
 */
function resetFilters() {
    competitionFilters = { ...DEFAULT_FILTERS };
    document.querySelectorAll('#competitions-container [data-filter]').forEach(control => {
        control.value = DEFAULT_FILTERS[control.dataset.filter];
    });
    refreshTableBody();
}

/**
 * Re-renders only the table body (keeps the filter controls, and their focus, untouched)
 */
function refreshTableBody() {
    const table = document.querySelector('#competitions-container table');
    if (!table) return;

    const template = document.createElement('template');
    template.innerHTML = renderCompetitionsTable(getVisibleCompetitions(), currentCompetitionYear, currentCompetitionSport);
    table.querySelector('tbody').replaceWith(template.content.querySelector('tbody'));
}

/**
 * Applies the active filters, then the current sort
 * @returns {Array} Competitions to display
 */
function getVisibleCompetitions() {
    const normalize = text => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const nameQuery = normalize(competitionFilters.name.trim());

    const filtered = currentCompetitions.filter(competition =>
        (competitionFilters.month === 'all' || String(competition.month) === competitionFilters.month) &&
        (!nameQuery || normalize(competition.name).includes(nameQuery)) &&
        (competitionFilters.location === 'all' || competition.location === competitionFilters.location) &&
        (competitionFilters.county === 'all' || competition.county === competitionFilters.county) &&
        (competitionFilters.type === 'all' || competition.type === competitionFilters.type)
    );

    return sortCompetitionList(filtered, currentSort.column, currentSort.ascending);
}

/**
 * Builds a filter <select> with an "All" option followed by the given options
 * @param {string} key - Filter key in competitionFilters
 * @param {Array<{value: string, label: string}>} options - Options after "All"
 * @returns {string} HTML string
 */
function filterSelect(key, options) {
    const items = [{ value: 'all', label: 'All' }, ...options].map(option =>
        `<option value="${option.value}"${competitionFilters[key] === option.value ? ' selected' : ''}>${option.label}</option>`
    );
    return `<select class="form-select form-select-sm" data-filter="${key}" aria-label="Filter by ${key}">${items.join('')}</select>`;
}

/**
 * Sorted unique non-empty values of a competition field (placeholder "-" excluded)
 * @param {string} field - Field name
 * @returns {Array<{value: string, label: string}>} Select options
 */
function uniqueFieldOptions(field) {
    const collator = new Intl.Collator('ro', { sensitivity: 'base' });
    const values = [...new Set(currentCompetitions.map(competition => competition[field]))]
        .filter(value => value && value !== '-')
        .sort(collator.compare);
    return values.map(value => ({ value, label: value }));
}

/**
 * Builds the two filter rows (title + controls) placed under the table header so each
 * control lines up with its column. Hidden until the "Filter competitions" checkbox is checked.
 */
function renderFilterRows(showSportColumn, showTypeColumn, showDistancesColumn) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const hidden = document.getElementById('filter-toggle')?.checked ? '' : ' hidden';
    const columnCount = 4 + (showSportColumn ? 1 : 0) + (showTypeColumn ? 1 : 0) + (showDistancesColumn ? 1 : 0);

    return `
            <tr class="filters-row filters-title"${hidden}>
                <th colspan="${columnCount}">
                    <div class="h5 mb-2">Filters</div>
                    <button type="button" class="btn btn-outline-secondary btn-sm" data-reset-filters>
                        <i class="bi bi-x-circle"></i> Reset filters
                    </button>
                </th>
            </tr>
            <tr class="filters-row filters-controls"${hidden}>
                ${showSportColumn ? '<th></th>' : ''}
                <th>${filterSelect('month', monthNames.map((label, index) => ({ value: String(index + 1), label })))}</th>
                <th><input type="text" class="form-control form-control-sm" data-filter="name" placeholder="Search" value="${competitionFilters.name.replace(/"/g, '&quot;')}" aria-label="Filter by competition name"></th>
                <th>${filterSelect('location', uniqueFieldOptions('location'))}</th>
                <th>${filterSelect('county', uniqueFieldOptions('county'))}</th>
                ${showTypeColumn ? `<th>${filterSelect('type', uniqueFieldOptions('type'))}</th>` : ''}
                ${showDistancesColumn ? '<th></th>' : ''}
            </tr>
            <tr class="filters-row filters-spacer"${hidden} aria-hidden="true">
                <td colspan="${columnCount}"></td>
            </tr>`;
}

/**
 * Changes the displayed year and updates the competition table
 * @param {number} year - The year to display
 */
function change_year(year) {
    currentCompetitionYear = year;
    document.getElementById('text_year').textContent = year;
    loadCompetitionsForYear(year, currentCompetitionSport);
}

/**
 * Changes the displayed sport and updates the competition table
 * @param {string} sport - The sport value to display ('all' for every sport)
 */
function change_sport(sport) {
    currentCompetitionSport = sport;
    const sportEntry = SPORTS.find(s => s.value === sport);
    document.getElementById('text_sport').textContent = sportEntry ? sportEntry.label : sport;
    updateSportInUrl(sport);
    loadCompetitionsForYear(currentCompetitionYear, sport);
}

/**
 * Loads competitions for the specified year from JSON file and filters by sport
 * @param {number} year - The year to load competitions for
 * @param {string} sport - The sport to filter by ('all' for every sport)
 */
async function loadCompetitionsForYear(year, sport) {
    const container = document.getElementById('competitions-container');

    try {
        // Load year-specific JSON file (contains every sport)
        const response = await fetch(`json-files/output-events-${year}.json`);

        if (response.ok) {
            const allCompetitions = await response.json();
            const competitions = sport === 'all'
                ? allCompetitions
                : allCompetitions.filter(competition => competition.sport === sport);

            currentCompetitions = competitions;
            // Option lists depend on the loaded data, so start from a clean filter state
            competitionFilters = { ...DEFAULT_FILTERS };
            renderCurrentCompetitions();

            // Scroll to current month if viewing current year (only meaningful in date order)
            const now = new Date();
            if (year === now.getFullYear() && currentSort.column === 'date') {
                scrollToCurrentMonth(competitions);
            }
        } else {
            // Fallback: show message if file doesn't exist yet
            container.innerHTML = `
                <div class="alert alert-info" role="alert">
                    <h4 class="alert-heading">Competitions for ${year}</h4>
                    <p>Competition data for ${year} is being prepared. Please check back later.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading competitions:', error);
        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error</h4>
                <p>Unable to load competitions for ${year}. Please try again later.</p>
            </div>
        `;
    }
}

/**
 * Renders competitions data as an HTML table
 * @param {Array} competitions - Array of competition objects
 * @param {number} year - The year being displayed
 * @param {string} sport - The sport being displayed ('all' for every sport)
 * @returns {string} HTML string for the competitions table
 */
function renderCompetitionsTable(competitions, year, sport) {
    // Determine if we should show links and distances
    // Show full version for: current year, next year, and last year
    // Hide links and distances for years older than (currentYear - 1)
    const currentYear = new Date().getFullYear();
    const showFullVersion = year >= (currentYear - 1);
    const showSportColumn = sport === 'all';

    // Hide the Type/Distances columns entirely when none of the displayed
    // competitions have that data (e.g. most non-running sports have no "type",
    // and most non-running/swimming sports have no "distances")
    // (based on all loaded competitions, so filtering never makes a column disappear)
    const showTypeColumn = currentCompetitions.some(competition => !!competition.type);
    const showDistancesColumn = showFullVersion &&
        currentCompetitions.some(competition => Array.isArray(competition.distances) && competition.distances.length > 0);

    const sortableHeader = (column, cssClass, label) => {
        const icon = currentSort.column !== column
            ? 'bi-arrow-down-up'
            : (currentSort.ascending ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up');
        return `<th scope="col" class="${cssClass} user-select-none" data-column="${column}" style="cursor: pointer;">${label} <i class="bi ${icon}"></i></th>`;
    };

    let html = `
        <table class="table table-striped competition-table" id="competitions_${year}">
            <thead>
            <tr>
                ${showSportColumn ? sortableHeader('sport', 'col-sport', 'Sport') : ''}
                ${sortableHeader('date', 'col-date', 'Date')}
                ${sortableHeader('name', 'col-competition', 'Competition')}
                ${sortableHeader('location', 'col-location', 'Location')}
                ${sortableHeader('county', 'col-county', 'County')}
                ${showTypeColumn ? sortableHeader('type', 'col-type', 'Type') : ''}
                ${showDistancesColumn ? '<th scope="col" class="col-distances">Distances</th>' : ''}
            </tr>
            ${renderFilterRows(showSportColumn, showTypeColumn, showDistancesColumn)}
            </thead>
            <tbody>
    `;

    if (competitions.length === 0) {
        const columnCount = 4 + (showSportColumn ? 1 : 0) + (showTypeColumn ? 1 : 0) + (showDistancesColumn ? 1 : 0);
        html += `<tr><td colspan="${columnCount}" class="text-center">No competitions match the filters</td></tr>`;
    }

    // Month separators only make sense when rows are in date order
    const groupByMonth = currentSort.column === 'date';

    competitions.forEach((competition, index) => {
        // Check if this is the last competition of the month
        const isLastOfMonth = groupByMonth && index < competitions.length - 1 &&
                              competition.month !== competitions[index + 1].month;

        const rowClass = isLastOfMonth ? ' class="last-of-month"' : '';

        // Render competition name: as link if showFullVersion, otherwise as plain text
        // Add Facebook icon if link_fb exists
        let competitionNameCell;
        if (showFullVersion) {
            competitionNameCell = `<a href="${competition.link}" target="_blank">${competition.name}</a>`;
            if (competition.link_fb) {
                competitionNameCell += ` <a href="${competition.link_fb}" target="_blank" title="Facebook Page"><i class="bi bi-facebook"></i></a>`;
            }
        } else {
            competitionNameCell = competition.name;
        }

        // Render location with location_details if it exists
        const locationCell = competition.location_details
            ? `${competition.location}<br><small class="text-muted">${competition.location_details}</small>`
            : competition.location;

        // Render distances cell only if the Distances column is shown
        const distancesCell = showDistancesColumn
            ? `<td class="col-distances">
                    <ul>
                        ${competition.distances.map(distance => `<li>${distance}</li>`).join('\n                        ')}
                    </ul>
                </td>`
            : '';

        html += `
            <tr${rowClass} data-month="${competition.month}">
                ${showSportColumn ? `<td class="col-sport">${formatSportName(competition.sport)}</td>` : ''}
                <td class="col-date">${competition.display_date}</td>
                <td class="col-competition">${competitionNameCell}</td>
                <td class="col-location">${locationCell}</td>
                <td class="col-county">${competition.county}</td>
                ${showTypeColumn ? `<td class="col-type">${competition.type}</td>` : ''}
                ${distancesCell}
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    return html;
}

/**
 * Scrolls to the first competition of the current month
 * @param {Array} competitions - Array of competition objects
 */
function scrollToCurrentMonth(competitions) {
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed

    // Find the first competition of the current month
    const firstCurrentMonthCompetition = competitions.find(comp => comp.month === currentMonth);

    if (firstCurrentMonthCompetition) {
        // Use setTimeout to ensure the DOM is fully rendered
        setTimeout(() => {
            const row = document.querySelector(`tr[data-month="${currentMonth}"]`);
            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
}

/**
 * Loads the last update date from versions.json and displays it
 * Finds the version with the highest version_id and formats the date as DD-Mon-YYYY
 */
async function loadLastUpdateDate() {
    try {
        const response = await fetch('json-files/versions.json');

        if (response.ok) {
            const data = await response.json();

            // Find the version with the highest version_id
            const latestVersion = data.versions.reduce((max, version) => {
                const currentId = parseInt(version.version_id);
                const maxId = parseInt(max.version_id);
                return currentId > maxId ? version : max;
            });

            // Format the date as DD-Mon-YYYY (without day of week)
            const date = new Date(
                latestVersion.date.year,
                latestVersion.date.month - 1, // JavaScript months are 0-indexed
                latestVersion.date.day
            );

            // Format: DD-Mon-YYYY
            const day = String(date.getDate()).padStart(2, '0');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();

            const formattedDate = `${day}-${month}-${year}`;

            // Update the badges
            const dateElement = document.getElementById('last-update-date');
            if (dateElement) {
                dateElement.textContent = formattedDate;
            }

            const versionElement = document.getElementById('version-number');
            if (versionElement) {
                versionElement.textContent = latestVersion.version_id;
            }
        } else {
            console.error('Failed to load versions.json');
            document.getElementById('last-update-date').textContent = 'N/A';
            document.getElementById('version-number').textContent = 'N/A';
        }
    } catch (error) {
        console.error('Error loading last update date:', error);
        document.getElementById('last-update-date').textContent = 'N/A';
        document.getElementById('version-number').textContent = 'N/A';
    }
}

/**
 * Loads available years from the competitions list JSON and populates the year dropdown
 */
async function loadAvailableYears() {
    try {
        const response = await fetch('json-files/output-all-competitions-list.json');
        if (!response.ok) return;

        const data = await response.json();
        const years = data.years || [];
        const dropdownMenu = document.getElementById('year-dropdown-menu');
        if (!dropdownMenu) return;

        dropdownMenu.innerHTML = '';
        years.forEach(year => {
            const li = document.createElement('li');
            li.innerHTML = `<a class="dropdown-item" href="javascript:void(0);" onclick="change_year(${year})">${year}</a>`;
            dropdownMenu.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading available years:', error);
    }
}

// Initialize page with current year and sport (from URL, if provided) when DOM is ready
/**
 * Shows the back-to-top button after scrolling down and scrolls to the top on click
 */
function setupBackToTopButton() {
    const button = document.getElementById('back-to-top');
    if (!button) return;

    const SHOW_AFTER_PX = 400;
    window.addEventListener('scroll', () => {
        button.classList.toggle('visible', window.scrollY > SHOW_AFTER_PX);
    }, { passive: true });

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Shows or hides the filters container when the "Filter competitions" checkbox is toggled
 */
function setupFilterToggle() {
    const toggle = document.getElementById('filter-toggle');
    if (!toggle) return;

    // Browsers may restore a checked state on reload, so sync on load too
    const sync = () => {
        document.querySelectorAll('.filters-row').forEach(row => { row.hidden = !toggle.checked; });
        toggle.setAttribute('aria-expanded', String(toggle.checked));
    };
    toggle.addEventListener('change', sync);
    sync();
}

document.addEventListener('DOMContentLoaded', () => {
    setupBackToTopButton();
    setupFilterToggle();
    const currentYear = new Date().getFullYear();
    const initialSport = getSportFromUrl();
    const sportEntry = SPORTS.find(s => s.value === initialSport);

    currentCompetitionSport = initialSport;

    document.getElementById('text_year').textContent = currentYear;
    document.getElementById('text_sport').textContent = sportEntry ? sportEntry.label : initialSport;
    updateSportInUrl(initialSport);

    loadCompetitionsForYear(currentYear, currentCompetitionSport);
    loadLastUpdateDate();
    loadAvailableYears();
    loadAvailableSports('sport-dropdown-menu', 'change_sport');
});