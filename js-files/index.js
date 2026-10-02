/**
 * JavaScript file specific to index.html (Home page - Competitions)
 * Handles year selection, sport selection, and competition table display
 */

// Current year/sport trackers
let currentCompetitionYear = new Date().getFullYear();
let currentCompetitionSport = 'running';

// SPORTS, formatSportName, getSportFromUrl and updateSportInUrl are defined in main.js
// and shared across pages that support multisport filtering.

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

            container.innerHTML = renderCompetitionsTable(competitions, year, sport);

            // Scroll to current month if viewing current year
            const now = new Date();
            if (year === now.getFullYear()) {
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
    const showTypeColumn = competitions.some(competition => !!competition.type);
    const showDistancesColumn = showFullVersion &&
        competitions.some(competition => Array.isArray(competition.distances) && competition.distances.length > 0);

    let html = `
        <table class="table table-striped competition-table" id="competitions_${year}">
            <thead>
            <tr>
                ${showSportColumn ? '<th scope="col" class="col-sport">Sport</th>' : ''}
                <th scope="col" class="col-date">Date</th>
                <th scope="col" class="col-competition">Competition</th>
                <th scope="col" class="col-location">Location</th>
                <th scope="col" class="col-county">County</th>
                ${showTypeColumn ? '<th scope="col" class="col-type">Type</th>' : ''}
                ${showDistancesColumn ? '<th scope="col" class="col-distances">Distances</th>' : ''}
            </tr>
            </thead>
            <tbody>
    `;

    competitions.forEach((competition, index) => {
        // Check if this is the last competition of the month
        const isLastOfMonth = index < competitions.length - 1 &&
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
document.addEventListener('DOMContentLoaded', () => {
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