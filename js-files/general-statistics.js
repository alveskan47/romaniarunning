// Years with per-year event data available (json-files/output-events-{year}.json)
const GENERAL_STATISTICS_YEARS = [2023, 2024, 2025, 2026, 2027];

function getThemeColorsGeneral() {
    const theme = document.documentElement.getAttribute('data-bs-theme');
    const isDark = theme === 'dark';

    return {
        backgroundColor: isDark ? '#212529' : '#ffffff',
        textColor: isDark ? '#dee2e6' : '#333333',
        gridColor: isDark ? '#495057' : '#e6e6e6',
        tooltipBackground: isDark ? '#343a40' : '#ffffff',
        tooltipBorder: isDark ? '#6c757d' : '#cccccc'
    };
}

let selectedSport = 'running';
// Cache: year -> events[] (every sport, unfiltered)
const rawEventsByYear = {};

/**
 * Filters the raw per-year events down to the selected sport, excluding
 * competitions without individual statistics tracking (Moldova / virtual entries, id 0)
 * @param {Array} events - Raw events for a year (every sport)
 * @param {string} sport - The sport to filter by ('all' for every sport)
 * @returns {Array} Filtered events
 */
function filterGeneralStatisticsEvents(events, sport) {
    const tracked = events.filter(e => e.id !== 0);
    return sport === 'all' ? tracked : tracked.filter(e => e.sport === sport);
}

/**
 * Loads (and caches) every year's events, then draws the chart
 */
async function general_statistics_main() {
    try {
        await Promise.all(GENERAL_STATISTICS_YEARS.map(async year => {
            if (rawEventsByYear[year] === undefined) {
                rawEventsByYear[year] = await fetch_json_file(`json-files/output-events-${year}.json`);
            }
        }));
        renderGeneralStatistics();
    } catch (error) {
        console.error('Error in fetching or using JSON:', error);
    }
}

/**
 * Recomputes the per-year totals for the selected sport and redraws the chart
 */
function renderGeneralStatistics() {
    const years = GENERAL_STATISTICS_YEARS.slice().sort((a, b) => a - b);
    const values = years.map(year => filterGeneralStatisticsEvents(rawEventsByYear[year] || [], selectedSport).length);
    draw_competitions_by_year(years, values);
}

function draw_competitions_by_year(years, values) {
    const colors = getThemeColorsGeneral();

    Highcharts.chart('container-by-year', {
        chart: {
            type: 'line',
            backgroundColor: colors.backgroundColor
        },
        title: {
            text: 'Competitions by year',
            style: {
                color: colors.textColor
            }
        },
        subtitle: {
            text: ''
        },
        tooltip: {
            backgroundColor: colors.tooltipBackground,
            borderColor: colors.tooltipBorder,
            style: {
                color: colors.textColor
            }
        },
        xAxis: {
            categories: years.map(String),
            labels: {
                style: {
                    color: colors.textColor
                }
            },
            gridLineColor: colors.gridColor
        },
        yAxis: {
            title: {
                text: 'Competitions',
                style: {
                    color: colors.textColor
                }
            },
            labels: {
                style: {
                    color: colors.textColor
                }
            },
            gridLineColor: colors.gridColor
        },
        legend: {
            itemStyle: {
                color: colors.textColor
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                    style: {
                        color: colors.textColor,
                        textOutline: '2px contrast'
                    }
                },
                enableMouseTracking: false,
                marker: {
                    fillColor: colors.textColor,
                    lineWidth: 2,
                    lineColor: colors.backgroundColor
                }
            }
        },
        series: [{
            name: 'Year',
            data: values
        }]
    });
}

/**
 * Changes the displayed sport and redraws the chart
 * @param {string} sport - The sport value to display ('all' for every sport)
 */
function change_sport(sport) {
    selectedSport = sport;
    const sportEntry = SPORTS.find(s => s.value === sport);
    document.getElementById('text_sport').textContent = sportEntry ? sportEntry.label : sport;
    updateSportInUrl(sport);
    renderGeneralStatistics();
}

document.addEventListener('themeChanged', () => {
    if (Object.keys(rawEventsByYear).length > 0) {
        renderGeneralStatistics();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    selectedSport = getSportFromUrl();
    const sportEntry = SPORTS.find(s => s.value === selectedSport);
    document.getElementById('text_sport').textContent = sportEntry ? sportEntry.label : selectedSport;
    updateSportInUrl(selectedSport);
    loadAvailableSports('sport-dropdown-menu', 'change_sport');

    general_statistics_main();
});
