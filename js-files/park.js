// JavaScript file specific to park.html

/**
 * Creates an HTML list item for a single park entry
 * @param {Object} park - The park object
 * @returns {string} HTML string for the list item
 */
function createParkListItem(park) {
    const lapText = park.laps === "1" ? "lap" : "laps";

    return `
        <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
                <div class="fw-bold">${park.park_name}</div>
                <a href="${park.strava_activity}" target="_blank">Strava Activity</a>
            </div>
            <span class="badge text-bg-primary rounded-pill me-2">
                ${park.laps} ${lapText} - ${park.distance_km}km
            </span>
            <span class="badge text-bg-success rounded-pill">
                ${park.distance_km_per_lap}km/lap
            </span>
        </li>
    `;
}

/**
 * Generates and displays a Bootstrap list group table with parks data
 * Creates a numbered list where each item shows park name, Strava activity link,
 * and distance information with badges
 * @param {Object} jsonData - The JSON object containing parks array
 * @param {Array} jsonData.parks - Array of park objects with properties:
 *                                  park_name, strava_activity, laps, distance_km, distance_km_per_lap
 */
function update_parks_table(jsonData) {
    // Generate HTML for all park list items
    const parkItems = jsonData.parks.map(park => createParkListItem(park)).join('');

    // Create the complete ordered list with all items
    const html_content = `
        <ol class="list-group list-group-numbered">
            ${parkItems}
        </ol>
    `;

    // Insert the generated HTML into the parks_table div
    const parksTableElement = document.getElementById('parks_table');
    if (parksTableElement) {
        parksTableElement.innerHTML = html_content;
    }
}

/**
 * Main initialization function for the park.html page
 * Called on page load (via onload attribute in body tag)
 * Fetches parks data from JSON file and populates the table
 */
function parks_main() {
    (async () => {
        try {
            // Fetch park data from JSON file
            const jsonData = await fetch_json_file('json-files/parks.json');
            // Update the parks table with the fetched data
            update_parks_table(jsonData);
        } catch (error) {
            console.error('Error in fetching or using JSON:', error);
        }
    })()
}
