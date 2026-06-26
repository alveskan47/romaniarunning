/**
 * JavaScript file specific to swimming.html
 * Reads directly from input-swimming-competitions.json and renders the table
 */

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES_SHORT   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let currentSwimmingYear = new Date().getFullYear();
let swimmingData = null;

function formatSwimmingDate(day, month, year) {
    const date = new Date(year, month - 1, day);
    const dayName = DAY_NAMES_SHORT[date.getDay()];
    const paddedDay = String(day).padStart(2, '0');
    return `<strong>${dayName} ${paddedDay}-${MONTH_NAMES_SHORT[month - 1]}-${year}</strong>`;
}

function change_swimming_year(year) {
    currentSwimmingYear = year;
    document.getElementById('text_year').textContent = year;
    renderSwimmingTable(year);
}

function renderSwimmingTable(year) {
    const container = document.getElementById('swimming-table');

    // Flatten competitions for the selected year
    const rows = [];
    swimmingData.swimming_competitions.forEach(comp => {
        comp.editions.forEach(edition => {
            if (edition.year !== year) return;
            rows.push({
                day: edition.day,
                month: edition.month,
                display_date: formatSwimmingDate(edition.day, edition.month, edition.year),
                name: comp.name,
                link: comp.link,
                link_fb: comp.link_fb || null,
                location: comp.location,
                county: comp.county,
                distances: edition.event_distances || comp.distances
            });
        });
    });

    // Sort by month, then day
    rows.sort((a, b) => a.month !== b.month ? a.month - b.month : a.day - b.day);

    if (rows.length === 0) {
        container.innerHTML = `<div class="alert alert-info">No swimming competitions found for ${year}.</div>`;
        return;
    }

    let html = `
        <table class="table table-striped competition-table" id="swimming_${year}">
            <thead>
                <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Competition</th>
                    <th scope="col">Location</th>
                    <th scope="col">County</th>
                    <th scope="col">Distances</th>
                </tr>
            </thead>
            <tbody>
    `;

    rows.forEach(row => {
        let competitionCell = `<a href="${row.link}" target="_blank">${row.name}</a>`;
        if (row.link_fb) {
            competitionCell += ` <a href="${row.link_fb}" target="_blank" title="Facebook Page"><i class="bi bi-facebook"></i></a>`;
        }

        html += `
                <tr>
                    <td>${row.display_date}</td>
                    <td>${competitionCell}</td>
                    <td>${row.location}</td>
                    <td>${row.county}</td>
                    <td>
                        <ul class="mb-0">
                            ${row.distances.map(d => `<li>${d}</li>`).join('\n                            ')}
                        </ul>
                    </td>
                </tr>`;
    });

    html += `
            </tbody>
        </table>`;

    container.innerHTML = html;
}

async function swimming_main() {
    try {
        const response = await fetch('json-files/input-swimming-competitions.json');
        if (!response.ok) throw new Error('Failed to load swimming competitions');

        swimmingData = await response.json();

        // Extract unique years from all editions
        const yearsSet = new Set();
        swimmingData.swimming_competitions.forEach(comp => {
            comp.editions.forEach(edition => yearsSet.add(edition.year));
        });
        const years = Array.from(yearsSet).sort((a, b) => b - a);

        // Populate year dropdown
        const dropdownMenu = document.getElementById('year-dropdown-menu');
        dropdownMenu.innerHTML = '';
        years.forEach(year => {
            const li = document.createElement('li');
            li.innerHTML = `<a class="dropdown-item" href="javascript:void(0);" onclick="change_swimming_year(${year})">${year}</a>`;
            dropdownMenu.appendChild(li);
        });

        // Default to current year if available, otherwise first in list
        const currentYear = new Date().getFullYear();
        const initialYear = years.includes(currentYear) ? currentYear : years[0];
        currentSwimmingYear = initialYear;
        document.getElementById('text_year').textContent = initialYear;
        renderSwimmingTable(initialYear);

    } catch (error) {
        console.error('Error loading swimming competitions:', error);
        document.getElementById('swimming-table').innerHTML = `
            <div class="alert alert-danger">Unable to load swimming competitions. Please try again later.</div>`;
    }
}