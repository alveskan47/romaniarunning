const HYATLON_MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HYATLON_DAY_NAMES_SHORT   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let currentHyatlonYear = new Date().getFullYear();
let hyatlonData = null;

function formatHyatlonDate(day, month, year) {
    const date = new Date(year, month - 1, day);
    const dayName = HYATLON_DAY_NAMES_SHORT[date.getDay()];
    const paddedDay = String(day).padStart(2, '0');
    return `<strong>${dayName} ${paddedDay}-${HYATLON_MONTH_NAMES_SHORT[month - 1]}-${year}</strong>`;
}

function change_hyatlon_year(year) {
    currentHyatlonYear = year;
    document.getElementById('text_year').textContent = year;
    renderHyatlonTable(year);
}

function renderHyatlonTable(year) {
    const container = document.getElementById('hyatlon-table');

    const rows = [];
    hyatlonData.hyatlon_competitions.forEach(comp => {
        comp.editions.forEach(edition => {
            if (edition.year !== year) return;

            let link = '';
            if (comp.link) {
                link = comp.link;
            } else if (edition.event_link) {
                link = edition.event_link;
            } else if (comp.link_fb) {
                link = comp.link_fb;
            }

            rows.push({
                day: edition.day,
                month: edition.month,
                display_date: formatHyatlonDate(edition.day, edition.month, edition.year),
                name: comp.name,
                link: link,
                link_fb: comp.link_fb || null,
                location: comp.location,
                location_details: comp.location_details || null,
                county: comp.county
            });
        });
    });

    rows.sort((a, b) => a.month !== b.month ? a.month - b.month : a.day - b.day);

    if (rows.length === 0) {
        container.innerHTML = `<div class="alert alert-info">No hyatlon competitions found for ${year}.</div>`;
        return;
    }

    let html = `
        <table class="table table-striped competition-table" id="hyatlon_${year}">
            <thead>
                <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Competition</th>
                    <th scope="col">Location</th>
                    <th scope="col">County</th>
                </tr>
            </thead>
            <tbody>
    `;

    rows.forEach(row => {
        let competitionCell = row.link
            ? `<a href="${row.link}" target="_blank">${row.name}</a>`
            : row.name;
        if (row.link_fb) {
            competitionCell += ` <a href="${row.link_fb}" target="_blank" title="Facebook Page"><i class="bi bi-facebook"></i></a>`;
        }

        const locationCell = row.location_details
            ? `${row.location}<br><small class="text-muted">${row.location_details}</small>`
            : row.location;

        html += `
                <tr>
                    <td>${row.display_date}</td>
                    <td>${competitionCell}</td>
                    <td>${locationCell}</td>
                    <td>${row.county}</td>
                </tr>`;
    });

    html += `
            </tbody>
        </table>`;

    container.innerHTML = html;
}

async function hyatlon_main() {
    try {
        const response = await fetch('json-files/input-hyatlon-competitions.json');
        if (!response.ok) throw new Error('Failed to load hyatlon competitions');

        hyatlonData = await response.json();

        const yearsSet = new Set();
        hyatlonData.hyatlon_competitions.forEach(comp => {
            comp.editions.forEach(edition => yearsSet.add(edition.year));
        });
        const years = Array.from(yearsSet).sort((a, b) => b - a);

        const dropdownMenu = document.getElementById('year-dropdown-menu');
        dropdownMenu.innerHTML = '';
        years.forEach(year => {
            const li = document.createElement('li');
            li.innerHTML = `<a class="dropdown-item" href="javascript:void(0);" onclick="change_hyatlon_year(${year})">${year}</a>`;
            dropdownMenu.appendChild(li);
        });

        const currentYear = new Date().getFullYear();
        const initialYear = years.includes(currentYear) ? currentYear : years[0];
        currentHyatlonYear = initialYear;
        document.getElementById('text_year').textContent = initialYear;
        renderHyatlonTable(initialYear);

    } catch (error) {
        console.error('Error loading hyatlon competitions:', error);
        document.getElementById('hyatlon-table').innerHTML = `
            <div class="alert alert-danger">Unable to load hyatlon competitions. Please try again later.</div>`;
    }
}