// Statistics page JavaScript - Functions for loading and displaying statistics charts

// Years with per-year event data available (json-files/output-events-{year}.json)
const STATISTICS_YEARS = [2023, 2024, 2025, 2026, 2027];

// Romanian county codes mapped to their Highcharts map "hc-key" values
const COUNTY_HC_KEYS = [
    ['AB', 'ro-ab'], ['AR', 'ro-ar'], ['AG', 'ro-ag'], ['B', 'ro-bi'],
    ['BC', 'ro-bc'], ['BH', 'ro-bh'], ['BN', 'ro-bn'], ['BT', 'ro-bt'],
    ['BR', 'ro-br'], ['BV', 'ro-bv'], ['BZ', 'ro-bz'], ['CL', 'ro-cl'],
    ['CS', 'ro-cs'], ['CJ', 'ro-cj'], ['CT', 'ro-ct'], ['CV', 'ro-cv'],
    ['DB', 'ro-db'], ['DJ', 'ro-dj'], ['GL', 'ro-gl'], ['GR', 'ro-gr'],
    ['GJ', 'ro-gj'], ['HR', 'ro-hr'], ['HD', 'ro-hd'], ['IL', 'ro-il'],
    ['IS', 'ro-is'], ['IF', 'ro-if'], ['MM', 'ro-mm'], ['MH', 'ro-mh'],
    ['MS', 'ro-ms'], ['NT', 'ro-nt'], ['OT', 'ro-ot'], ['PH', 'ro-ph'],
    ['SJ', 'ro-sj'], ['SM', 'ro-sm'], ['SB', 'ro-sb'], ['SV', 'ro-sv'],
    ['TR', 'ro-tr'], ['TM', 'ro-tm'], ['TL', 'ro-tl'], ['VL', 'ro-vl'],
    ['VS', 'ro-vs'], ['VN', 'ro-vn']
];

// Gauge upper bound (chart 1) per sport, reflecting each sport's typical yearly volume
const GAUGE_MAX_BY_SPORT = {
    running: 500,
    all: 1000,
    swimming: 20,
    triathlon: 30,
    cycling: 150,
    aquatlon: 10,
    duathlon: 20,
    skiing: 10,
    climbing: 10,
    orienteering: 20,
    kayak: 10,
    hyatlon: 10
};

/**
 * Gets the current theme colors based on the active Bootstrap theme
 * @returns {Object} Object containing theme-specific colors
 */
function getThemeColors() {
    const theme = document.documentElement.getAttribute('data-bs-theme');
    const isDark = theme === 'dark';

    return {
        backgroundColor: isDark ? '#212529' : '#ffffff',
        textColor: isDark ? '#dee2e6' : '#333333',
        gridColor: isDark ? '#495057' : '#e6e6e6',
        nullColor: isDark ? '#343a40' : '#E0E0E0',
        tooltipBackground: isDark ? '#343a40' : '#ffffff',
        tooltipBorder: isDark ? '#6c757d' : '#cccccc'
    };
}

/**
 * Populates the year dropdown (runs only once)
 */
function populateYearDropdown() {
    const dropdownMenu = document.getElementById('year-dropdown-menu');
    if (!dropdownMenu || dropdownMenu.children.length > 0) return;

    const years = STATISTICS_YEARS.slice().sort((a, b) => b - a);

    years.forEach(year => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="javascript:void(0);" onclick="change_data(${year})">${year}</a>`;
        dropdownMenu.appendChild(li);
    });
}

// Store current year/sport and raw (unfiltered) events globally to allow theme/sport redraws
let currentYear = new Date().getFullYear();
let selectedSport = 'running';
let currentRawEvents = null;

/**
 * Filters the raw per-year events down to the selected sport, excluding
 * competitions without individual statistics tracking (Moldova / virtual entries, id 0)
 * @param {Array} events - Raw events for a year (every sport)
 * @param {string} sport - The sport to filter by ('all' for every sport)
 * @returns {Array} Filtered events
 */
function filterStatisticsEvents(events, sport) {
    const tracked = events.filter(e => e.id !== 0);
    return sport === 'all' ? tracked : tracked.filter(e => e.sport === sport);
}

/**
 * Computes the top 10 towns by competition count, including ties at 10th place
 * (unless that would push the total over 20 towns), matching python-files/update-statistics.py
 * @param {Object} townCounts - Map of town name -> competition count
 * @returns {Object} Map of the selected towns -> competition count
 */
function topTowns(townCounts) {
    const sorted = Object.entries(townCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    if (sorted.length <= 10) return Object.fromEntries(sorted);

    const tenthValue = sorted[9][1];
    const top10 = sorted.slice(0, 10);
    const tied = sorted.slice(10).filter(([, count]) => count === tenthValue);

    if (top10.length + tied.length > 20) {
        return Object.fromEntries(top10.filter(([, count]) => count > tenthValue));
    }
    return Object.fromEntries([...top10, ...tied]);
}

/**
 * Computes all chart statistics from a (sport-filtered) list of events
 * @param {Array} events - Filtered events to aggregate
 * @returns {Object} Aggregated statistics for all charts
 */
function computeStatistics(events) {
    const total_competitions = events.length;

    const competitions_by_month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    events.forEach(e => {
        if (e.month >= 1 && e.month <= 12) competitions_by_month[e.month - 1]++;
    });

    const competitions_by_type = { trail: 0, road: 0, other: 0 };
    events.forEach(e => {
        const type = (e.type === 'road' || e.type === 'trail') ? e.type : 'other';
        competitions_by_type[type]++;
    });

    const countyCounts = {};
    COUNTY_HC_KEYS.forEach(([code]) => { countyCounts[code] = 0; });
    events.forEach(e => {
        if (e.county && countyCounts[e.county] !== undefined) countyCounts[e.county]++;
    });
    const competitions_by_county = COUNTY_HC_KEYS.map(([code, hcKey]) => [hcKey, countyCounts[code]]);

    const townCounts = {};
    events.forEach(e => {
        if (e.location) townCounts[e.location] = (townCounts[e.location] || 0) + 1;
    });
    const competitions_by_towns = topTowns(townCounts);

    return { total_competitions, competitions_by_month, competitions_by_type, competitions_by_county, competitions_by_towns };
}

/**
 * Main function to initialize statistics page with data for a specific year
 * @param {number} year - The year to display statistics for
 */
async function statistics_main(year) {
    try {
        const events = await fetch_json_file(`json-files/output-events-${year}.json`);
        currentYear = year;
        currentRawEvents = events;
        update_charts_by_year();
    } catch (error) {
        console.error('Error in fetching or using JSON:', error);
    }
}

/**
 * Updates the chart section headers to reflect the selected sport, and shows/hides
 * the "by type" chart (chart 3), which is only meaningful for running
 */
function updateSectionHeaders() {
    const sportEntry = SPORTS.find(s => s.value === selectedSport);
    const sportLabel = selectedSport === 'all' ? 'all sports' : (sportEntry ? sportEntry.label.toLowerCase() : selectedSport);

    document.getElementById('header-total').textContent = `1. Total number of ${sportLabel} competitions in Romania`;
    document.getElementById('header-month').textContent = `2. Number of ${sportLabel} competitions in Romania by month`;
    document.getElementById('header-county').textContent = `4. Number of ${sportLabel} competitions in Romania by county`;
    document.getElementById('header-towns').textContent = `5. Number of ${sportLabel} competitions in Romania by towns`;

    const typeSection = document.getElementById('section-type');
    if (typeSection) {
        typeSection.style.display = selectedSport === 'running' ? '' : 'none';
    }
}

/**
 * Updates all charts based on the currently selected year/sport
 */
function update_charts_by_year() {
    if (!currentRawEvents) return;

    document.getElementById('text_year').textContent = currentYear;
    updateSectionHeaders();

    const filtered = filterStatisticsEvents(currentRawEvents, selectedSport);
    const stats = computeStatistics(filtered);
    const gaugeMax = GAUGE_MAX_BY_SPORT[selectedSport] ?? 500;

    // Draw all charts
    draw_highcharts_total(stats.total_competitions, gaugeMax);
    draw_highcharts_months(stats.competitions_by_month);
    if (selectedSport === 'running') {
        draw_highcharts_type(stats.competitions_by_type);
    }
    draw_highcharts_county(stats.competitions_by_county);
    draw_highcharts_towns(stats.competitions_by_towns);
}

/**
 * Draws the total competitions gauge chart
 * @param {number} total_competitions - Total number of competitions
 * @param {number} maxValue - Upper bound of the gauge, scaled to the selected sport
 */
function draw_highcharts_total(total_competitions, maxValue) {
    const colors = getThemeColors();

    Highcharts.chart('container-total', {
        chart: {
            type: 'gauge',
            backgroundColor: colors.backgroundColor,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            height: '400px'
        },
        title: {
            text: 'Total Competitions',
            style: {
                color: colors.textColor
            }
        },
        tooltip: {
            backgroundColor: colors.tooltipBackground,
            borderColor: colors.tooltipBorder,
            style: {
                color: colors.textColor
            }
        },
        pane: {
            startAngle: -90,
            endAngle: 89.9,
            background: null,
            center: ['50%', '75%'],
            size: '110%'
        },
        yAxis: {
            min: 0,
            max: maxValue,
            tickPixelInterval: 72,
            tickPosition: 'inside',
            tickColor: colors.backgroundColor,
            tickLength: 20,
            tickWidth: 2,
            minorTickInterval: null,
            labels: {
                distance: 20,
                style: {
                    fontSize: '14px',
                    color: colors.textColor
                }
            },
            lineWidth: 0,
            plotBands: [{
                from: 0,
                to: maxValue / 3,
                color: '#DF5353', // red
                thickness: 20
            }, {
                from: maxValue / 3,
                to: (maxValue / 3) * 2,
                color: '#DDDF0D', // yellow
                thickness: 20
            }, {
                from: (maxValue / 3) * 2,
                to: maxValue,
                color: '#0018F9', // blue
                thickness: 20
            }]
        },
        series: [{
            name: 'Total Competitions',
            data: [total_competitions],
            tooltip: {
                valueSuffix: ' '
            },
            dataLabels: {
                format: '{y}',
                borderWidth: 0,
                color: colors.textColor,
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            },
            dial: {
                radius: '80%',
                backgroundColor: 'gray',
                baseWidth: 12,
                baseLength: '0%',
                rearLength: '0%'
            },
            pivot: {
                backgroundColor: 'gray',
                radius: 6
            }
        }]
    });
}

/**
 * Draws the competitions by month line chart
 * @param {Array} competitions_by_month - Array of 12 numbers representing competitions per month
 */
function draw_highcharts_months(competitions_by_month) {
    const colors = getThemeColors();

    Highcharts.chart('container-month', {
        chart: {
            type: 'line',
            backgroundColor: colors.backgroundColor
        },
        title: {
            text: 'Competitions by month',
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
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
            name: 'Month',
            data: competitions_by_month
        }]
    });
}

/**
 * Draws the competitions by type pie chart
 * @param {Object} competitions_by_type - Object with trail, road, and other counts
 */
function draw_highcharts_type(competitions_by_type) {
    const colors = getThemeColors();

    Highcharts.chart('container-type', {
        chart: {
            type: 'pie',
            backgroundColor: colors.backgroundColor
        },
        title: {
            text: 'Competitions by type',
            style: {
                color: colors.textColor
            }
        },
        tooltip: {
            valueSuffix: '',
            backgroundColor: colors.tooltipBackground,
            borderColor: colors.tooltipBorder,
            style: {
                color: colors.textColor
            }
        },
        subtitle: {
            text: ''
        },
        legend: {
            itemStyle: {
                color: colors.textColor
            }
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: [{
                    enabled: true,
                    distance: 20,
                    style: {
                        color: colors.textColor,
                        textOutline: '1px contrast'
                    }
                }, {
                    enabled: true,
                    distance: -40,
                    format: '{point.y}',
                    style: {
                        fontSize: '1.2em',
                        color: colors.textColor,
                        textOutline: '2px contrast',
                        fontWeight: 'bold'
                    },
                    filter: {
                        operator: '>',
                        property: 'percentage',
                        value: 5
                    }
                }]
            }
        },
        series: [{
            name: 'Total',
            colorByPoint: true,
            data: [
                {
                    name: 'Trail',
                    sliced: true,
                    selected: true,
                    y: competitions_by_type['trail']
                },
                {
                    name: 'Road',
                    y: competitions_by_type['road']
                },
                {
                    name: 'Other',
                    y: competitions_by_type['other']
                }
            ]
        }]
    });
}

/**
 * Draws the competitions by county map chart
 * @param {Array} competitions_by_county - Array of [county_code, count] pairs
 */
function draw_highcharts_county(competitions_by_county) {
    (async () => {
        const colors = getThemeColors();
        const topology = await fetch(
            'json-files/ro-all.topo.json'
        ).then(response => response.json());

        // Create the chart
        Highcharts.mapChart('container-counties', {
            chart: {
                map: topology,
                backgroundColor: colors.backgroundColor
            },
            title: {
                text: 'Competitions by county',
                style: {
                    color: colors.textColor
                }
            },
            subtitle: {
                text: ' '
            },
            tooltip: {
                backgroundColor: colors.tooltipBackground,
                borderColor: colors.tooltipBorder,
                style: {
                    color: colors.textColor
                }
            },
            legend: {
                itemStyle: {
                    color: colors.textColor
                }
            },
            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },
            colorAxis: {
                min: 0,
                labels: {
                    style: {
                        color: colors.textColor
                    }
                }
            },
            series: [{
                data: competitions_by_county,
                name: 'Number of competitions',
                joinBy: ['hc-key', 0],
                states: {
                    hover: {
                        color: '#BADA55'
                    }
                },
                dataLabels: {
                    enabled: true,
                    format: '{point.name}',
                    allowOverlap: true,
                    crop: false,
                    overflow: 'allow',
                    color: colors.textColor,
                    style: {
                        fontSize: '10px',
                        fontWeight: 'normal',
                        color: colors.textColor,
                        textOutline: '2px contrast'
                    }
                },
                allAreas: true,
                nullColor: colors.nullColor
            }]
        });
    })();
}

/**
 * Draws the competitions by towns column chart
 * @param {Object} competitions_by_towns - Object with town names as keys and counts as values
 */
function draw_highcharts_towns(competitions_by_towns) {
    const colors = getThemeColors();

    Highcharts.chart('container-towns', {
        chart: {
            type: 'column',
            backgroundColor: colors.backgroundColor
        },
        title: {
            text: 'Top towns',
            style: {
                color: colors.textColor
            }
        },
        subtitle: {
            text: 'Competitions by towns',
            style: {
                color: colors.textColor
            }
        },
        xAxis: {
            categories: Object.keys(competitions_by_towns),
            labels: {
                style: {
                    color: colors.textColor
                }
            },
            accessibility: {
                description: 'Towns'
            },
            gridLineColor: colors.gridColor
        },
        yAxis: {
            min: 0,
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
        tooltip: {
            valueSuffix: ' ',
            backgroundColor: colors.tooltipBackground,
            borderColor: colors.tooltipBorder,
            style: {
                color: colors.textColor
            }
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
                dataLabels: {
                    enabled: false
                }
            }
        },
        series: [{
            name: 'Competitions',
            data: Object.values(competitions_by_towns),
            colorByPoint: true
        }]
    });
}

/**
 * Changes the displayed data when a new year is selected
 * @param {number} year - The year to switch to
 */
function change_data(year) {
    statistics_main(year);
    document.getElementById('text_year').textContent = year;
}

/**
 * Changes the displayed sport and redraws the charts
 * @param {string} sport - The sport value to display ('all' for every sport)
 */
function change_sport(sport) {
    selectedSport = sport;
    const sportEntry = SPORTS.find(s => s.value === sport);
    document.getElementById('text_sport').textContent = sportEntry ? sportEntry.label : sport;
    updateSportInUrl(sport);
    update_charts_by_year();
}

// Listen for theme changes and redraw charts
document.addEventListener('themeChanged', () => {
    update_charts_by_year();
});

document.addEventListener('DOMContentLoaded', () => {
    selectedSport = getSportFromUrl();
    const sportEntry = SPORTS.find(s => s.value === selectedSport);
    document.getElementById('text_sport').textContent = sportEntry ? sportEntry.label : selectedSport;
    updateSportInUrl(selectedSport);
    loadAvailableSports('sport-dropdown-menu', 'change_sport');

    populateYearDropdown();

    if (!STATISTICS_YEARS.includes(currentYear)) {
        currentYear = STATISTICS_YEARS[0];
    }
    statistics_main(currentYear);
});
