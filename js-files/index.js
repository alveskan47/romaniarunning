/**
 * JavaScript file specific to index.html (Home page - Competitions)
 * Handles year selection and competition table display
 */

// Current year tracker - dynamically set to current year
let currentCompetitionYear = new Date().getFullYear();

/**
 * Changes the displayed year and updates the competition table
 * @param {number} year - The year to display (2023-2026)
 */
function change_year(year) {
    currentCompetitionYear = year;
    document.getElementById('text_year').textContent = year;
    loadCompetitionsForYear(year);
}

/**
 * Loads competitions for the specified year from JSON file
 * @param {number} year - The year to load competitions for
 */
async function loadCompetitionsForYear(year) {
    const container = document.getElementById('competitions-container');

    try {
        // Load year-specific JSON file
        const response = await fetch(`json-files/output-events-${year}.json`);

        if (response.ok) {
            const competitions = await response.json();
            container.innerHTML = renderCompetitionsTable(competitions, year);

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
 * @returns {string} HTML string for the competitions table
 */
function renderCompetitionsTable(competitions, year) {
    // Determine if we should show links and distances
    // Show full version for: current year, next year, and last year
    // Hide links and distances for years older than (currentYear - 1)
    const currentYear = new Date().getFullYear();
    const showFullVersion = year >= (currentYear - 1);

    let html = `
        <table class="table table-striped competition-table" id="competitions_${year}">
            <thead>
            <tr>
                <th scope="col">Date</th>
                <th scope="col">Competition</th>
                <th scope="col">Location</th>
                <th scope="col">County</th>
                <th scope="col">Type</th>
                ${showFullVersion ? '<th scope="col">Distances</th>' : ''}
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

        // Render distances cell only if showFullVersion
        const distancesCell = showFullVersion
            ? `<td>
                    <ul>
                        ${competition.distances.map(distance => `<li>${distance}</li>`).join('\n                        ')}
                    </ul>
                </td>`
            : '';

        html += `
            <tr${rowClass} data-month="${competition.month}">
                <td>${competition.display_date}</td>
                <td>${competitionNameCell}</td>
                <td>${locationCell}</td>
                <td>${competition.county}</td>
                <td>${competition.type}</td>
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

// Initialize page with current year when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const currentYear = new Date().getFullYear();
    document.getElementById('text_year').textContent = currentYear;
    loadCompetitionsForYear(currentYear);
    loadLastUpdateDate();
});
