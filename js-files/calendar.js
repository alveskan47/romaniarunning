// Calendar page JavaScript

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const YEARS = [2023, 2024, 2025, 2026, 2027];

let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth(); // 0-indexed

// Clamp to valid range
if (selectedYear < YEARS[0]) selectedYear = YEARS[0];
if (selectedYear > YEARS[YEARS.length - 1]) selectedYear = YEARS[YEARS.length - 1];

// Cache: year -> { "YYYY-M-D": count }
const eventCounts = {};
// Cache: year -> { "YYYY-M-D": [event, ...] }
const eventsByDay = {};

function dayKey(year, month1, day) {
    return `${year}-${month1}-${day}`;
}

function getCount(year, month0, day) {
    const counts = eventCounts[year];
    if (!counts) return 0;
    return counts[dayKey(year, month0 + 1, day)] || 0;
}

function getEvents(year, month0, day) {
    const byDay = eventsByDay[year];
    if (!byDay) return [];
    return byDay[dayKey(year, month0 + 1, day)] || [];
}

function loadYearData(year) {
    if (eventCounts[year] !== undefined) return Promise.resolve();
    return fetch(`json-files/output-events-${year}.json`)
        .then(r => r.json())
        .then(events => {
            const counts = {};
            const byDay = {};
            events.forEach(e => {
                const k = dayKey(e.year, e.month, e.day);
                counts[k] = (counts[k] || 0) + 1;
                if (!byDay[k]) byDay[k] = [];
                byDay[k].push(e);
            });
            eventCounts[year] = counts;
            eventsByDay[year] = byDay;
        })
        .catch(() => {
            eventCounts[year] = {};
            eventsByDay[year] = {};
        });
}

function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}/${String(weekNo).padStart(2, '0')}`;
}

function getCellDate(i, startOffset, prevMonthDays, prevYear, prevMonth, year, month, daysInMonth, nextYear, nextMonth) {
    if (i < startOffset) {
        return new Date(prevYear, prevMonth, prevMonthDays - startOffset + 1 + i);
    }
    const d = i - startOffset + 1;
    if (d <= daysInMonth) {
        return new Date(year, month, d);
    }
    return new Date(nextYear, nextMonth, d - daysInMonth);
}

function formatDate(day, month, year) {
    return `${String(day).padStart(2, '0')}-${MONTH_ABBR[month]}-${year}`;
}

function weekBadgeClass(count) {
    return count > 0 ? 'bg-primary' : 'bg-secondary';
}

function dayBadgeClass(count) {
    if (count === 0) return 'bg-secondary';
    if (count <= 5) return 'bg-success';
    if (count <= 9) return 'bg-warning';
    return 'bg-danger';
}

function renderCalendar() {
    const year = selectedYear;
    const month = selectedMonth;

    // Update dropdown labels
    document.getElementById('yearDropdownLabel').textContent = year;
    document.getElementById('monthDropdownLabel').textContent = MONTHS[month];

    // First day of month (0=Sun...6=Sat), convert to Mon-based (0=Mon...6=Sun)
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Days from previous month to fill leading cells
    const prevMonthDays = new Date(year, month, 0).getDate();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    // Next month info
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();

    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    let cells = '';
    let nextDayCounter = 1;

    for (let i = 0; i < totalCells; i++) {
        if (i % 7 === 0) {
            // Calculate week total from all 7 days in this row
            let weekTotal = 0;
            for (let j = i; j < i + 7; j++) {
                const cd = getCellDate(j, startOffset, prevMonthDays, prevYear, prevMonth, year, month, daysInMonth, nextYear, nextMonth);
                weekTotal += getCount(cd.getFullYear(), cd.getMonth(), cd.getDate());
            }
            const rowDate = getCellDate(i, startOffset, prevMonthDays, prevYear, prevMonth, year, month, daysInMonth, nextYear, nextMonth);
            cells += `<tr><td class="calendar-week-cell">${getISOWeek(rowDate)}<br><span class="badge ${weekBadgeClass(weekTotal)}">${weekTotal}</span></td>`;
        }

        if (i < startOffset) {
            const d = prevMonthDays - startOffset + 1 + i;
            const count = getCount(prevYear, prevMonth, d);
            cells += `<td class="calendar-day calendar-overflow">${formatDate(d, prevMonth, prevYear)}<br><span class="badge ${dayBadgeClass(count)}">${count}</span></td>`;
        } else {
            const d = i - startOffset + 1;
            if (d <= daysInMonth) {
                const isToday = isCurrentMonth && d === todayDate;
                const count = getCount(year, month, d);
                cells += `<td class="calendar-day${isToday ? ' calendar-today' : ''}">${formatDate(d, month, year)}<br><span class="badge ${dayBadgeClass(count)}">${count}</span></td>`;
            } else {
                const count = getCount(nextYear, nextMonth, nextDayCounter);
                cells += `<td class="calendar-day calendar-overflow">${formatDate(nextDayCounter, nextMonth, nextYear)}<br><span class="badge ${dayBadgeClass(count)}">${count}</span></td>`;
                nextDayCounter++;
            }
        }

        if ((i + 1) % 7 === 0) cells += '</tr>';
    }

    document.getElementById('calendar-body').innerHTML = cells;
    renderRacesList();
}

async function renderRacesList() {
    const year = selectedYear;
    const month = selectedMonth;

    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    // Load adjacent year data if overflow cells belong to a different year
    const yearsNeeded = new Set([year]);
    if (startOffset > 0) yearsNeeded.add(prevYear);
    if (totalCells - startOffset > daysInMonth) yearsNeeded.add(nextYear);
    await Promise.all([...yearsNeeded].map(y => loadYearData(y)));

    const weekOrder = [];
    const weeks = {};
    let weekKey = null;

    for (let i = 0; i < totalCells; i++) {
        const cellDate = getCellDate(i, startOffset, prevMonthDays, prevYear, prevMonth, year, month, daysInMonth, nextYear, nextMonth);

        if (i % 7 === 0) {
            weekKey = getISOWeek(cellDate);
            if (!weeks[weekKey]) {
                weeks[weekKey] = [];
                weekOrder.push(weekKey);
            }
        }

        const cy = cellDate.getFullYear();
        const cm = cellDate.getMonth();
        const cd = cellDate.getDate();
        const events = getEvents(cy, cm, cd);
        if (events.length > 0) {
            weeks[weekKey].push({ day: cd, month: cm, year: cy, events });
        }
    }

    let html = '';
    for (const wk of weekOrder) {
        const days = weeks[wk];
        if (!days || days.length === 0) continue;
        html += `<div class="races-week"><h5>Week ${wk}</h5>`;
        for (const { day, month: m, year: y, events } of days) {
            const dow = DAY_ABBR[new Date(y, m, day).getDay()];
            html += `<p class="mb-1"><strong>${dow} ${formatDate(day, m, y)}</strong></p>`;
            html += '<ul class="list-unstyled ms-3 mb-2">';
            for (const e of events) {
                html += `<li><a href="${e.link}" target="_blank" rel="noopener">${e.name}</a></li>`;
            }
            html += '</ul>';
        }
        html += '</div>';
    }

    document.getElementById('races-list').innerHTML = html;
}

function changeYear(year) {
    selectedYear = year;
    loadYearData(year).then(renderCalendar);
}

function changeMonth(month) {
    selectedMonth = month;
    renderCalendar();
}

function prevMonth() {
    if (selectedMonth === 0) {
        if (selectedYear <= YEARS[0]) return;
        selectedYear--;
        selectedMonth = 11;
        loadYearData(selectedYear).then(renderCalendar);
    } else {
        selectedMonth--;
        renderCalendar();
    }
}

function nextMonth() {
    if (selectedMonth === 11) {
        if (selectedYear >= YEARS[YEARS.length - 1]) return;
        selectedYear++;
        selectedMonth = 0;
        loadYearData(selectedYear).then(renderCalendar);
    } else {
        selectedMonth++;
        renderCalendar();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Populate year dropdown
    const yearMenu = document.getElementById('yearDropdownMenu');
    YEARS.forEach(y => {
        yearMenu.insertAdjacentHTML('beforeend',
            `<li><a class="dropdown-item" href="javascript:void(0);" onclick="changeYear(${y})">${y}</a></li>`
        );
    });

    // Populate month dropdown
    const monthMenu = document.getElementById('monthDropdownMenu');
    MONTHS.forEach((m, i) => {
        monthMenu.insertAdjacentHTML('beforeend',
            `<li><a class="dropdown-item" href="javascript:void(0);" onclick="changeMonth(${i})">${m}</a></li>`
        );
    });

    loadYearData(selectedYear).then(renderCalendar);
});