// JavaScript file specific to bad-news.html

/**
 * Formats a date object to display format like "Sat 13-Sep-2025"
 * @param {Object} dateObj - The date object with year, month, day properties
 * @returns {string} Formatted date string
 */
function formatDate(dateObj) {
    const date = new Date(dateObj.year, dateObj.month - 1, dateObj.day);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[date.getDay()];
    const day = dateObj.day;
    const monthName = months[dateObj.month - 1];
    const year = dateObj.year;

    return `${dayName} ${day}-${monthName}-${year}`;
}

/**
 * Converts a date object to a sortable number for comparison
 * @param {Object} dateObj - The date object with year, month, day properties
 * @returns {number} Date as number (YYYYMMDD format)
 */
function dateToNumber(dateObj) {
    return dateObj.year * 10000 + dateObj.month * 100 + dateObj.day;
}

/**
 * Creates an HTML table row for a single bad news entry
 * @param {Object} news - The bad news object
 * @returns {string} HTML string for the table row
 */
function createBadNewsRow(news) {
    const originalDate = formatDate(news.original_date);

    // Competition column - strikethrough if NOT Rescheduled
    const competitionClass = news.status !== 'Rescheduled' ? ' class="text-decoration-line-through"' : '';

    // Status column - show status and new date if Rescheduled
    let statusContent = news.status;
    if (news.status === 'Rescheduled' && news.new_date) {
        const newDate = formatDate(news.new_date);
        statusContent = `${news.status} <strong>(${newDate})</strong>`;
    }

    return `
        <tr>
            <td class="text-decoration-line-through">${originalDate}</td>
            <td${competitionClass}>${news.competition}</td>
            <td>${statusContent}</td>
        </tr>
    `;
}

/**
 * Generates and displays a Bootstrap table with bad news data
 * Sorts entries by original date (latest first) and displays with proper formatting
 * @param {Object} jsonData - The JSON object containing bad_news array
 */
function update_bad_news_table(jsonData) {
    // Sort by original_date descending (latest on top)
    const sortedNews = jsonData.bad_news.sort((a, b) => {
        return dateToNumber(b.original_date) - dateToNumber(a.original_date);
    });

    // Generate HTML for all bad news rows
    const newsRows = sortedNews.map(news => createBadNewsRow(news)).join('');

    // Create the complete table with all rows
    const html_content = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Original Date</th>
                    <th scope="col">Competition</th>
                    <th scope="col">Status</th>
                </tr>
            </thead>
            <tbody>
                ${newsRows}
            </tbody>
        </table>
    `;

    // Insert the generated HTML into the bad-news-table div
    const badNewsTableElement = document.getElementById('bad-news-table');
    if (badNewsTableElement) {
        badNewsTableElement.innerHTML = html_content;
    }
}

/**
 * Main initialization function for the bad-news.html page
 * Called on page load (via onload attribute in body tag)
 * Fetches bad news data from JSON file and populates the table
 */
function bad_news_main() {
    (async () => {
        try {
            // Fetch bad news data from JSON file
            const jsonData = await fetch_json_file('json-files/bad-news.json');
            // Update the bad news table with the fetched data
            update_bad_news_table(jsonData);
        } catch (error) {
            console.error('Error in fetching or using JSON:', error);
        }
    })()
}
