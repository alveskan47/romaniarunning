// Statistics page JavaScript - Functions for loading and displaying statistics charts

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
 * Main function to initialize statistics page with data for a specific year
 * @param {number} year - The year to display statistics for
 */
function statistics_main(year) {
    (async () => {
        try {
            const jsonData = await fetch_json_file('json-files/output-all-statistics.json');
            update_charts_by_year(jsonData, year);
        } catch (error) {
            console.error('Error in fetching or using JSON:', error);
        }
    })();
}

// Store current year globally to allow theme-based redraws
let currentYear = new Date().getFullYear();
let currentJsonData = null;

/**
 * Updates all charts based on the selected year
 * @param {Object} jsonData - The complete statistics JSON data
 * @param {number} year - The year to filter data by
 */
function update_charts_by_year(jsonData, year) {
    // Store for theme change redraws
    currentYear = year;
    currentJsonData = jsonData;

    // Update the displayed year in the dropdown
    document.getElementById('text_year').textContent = year;

    let total_competitions;
    let competitions_by_month;
    let competitions_by_type;
    let competitions_by_county;
    let competitions_by_towns;

    // Extract total competitions for the year
    if (jsonData["statistics"]["total_competitions"][year]) {
        total_competitions = jsonData["statistics"]["total_competitions"][year];
    } else {
        total_competitions = 0;
    }

    // Extract competitions by month for the year
    if (jsonData["statistics"]["competitions_by_month"][year]) {
        competitions_by_month = jsonData["statistics"]["competitions_by_month"][year];
    } else {
        competitions_by_month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    // Extract competitions by type for the year
    if (jsonData["statistics"]["competitions_by_type"][year]) {
        competitions_by_type = jsonData["statistics"]["competitions_by_type"][year];
    } else {
        competitions_by_type = {
            "trail": 0,
            "road": 0,
            "other": 0
        };
    }

    // Extract competitions by county for the year
    if (jsonData["statistics"]["competitions_by_county"][year]) {
        competitions_by_county = [
            ['ro-ab', jsonData["statistics"]["competitions_by_county"][year]["AB"]],
            ['ro-ar', jsonData["statistics"]["competitions_by_county"][year]["AR"]],
            ['ro-ag', jsonData["statistics"]["competitions_by_county"][year]["AG"]],
            ['ro-bi', jsonData["statistics"]["competitions_by_county"][year]["B"]],
            ['ro-bc', jsonData["statistics"]["competitions_by_county"][year]["BC"]],
            ['ro-bh', jsonData["statistics"]["competitions_by_county"][year]["BH"]],
            ['ro-bn', jsonData["statistics"]["competitions_by_county"][year]["BN"]],
            ['ro-bt', jsonData["statistics"]["competitions_by_county"][year]["BT"]],
            ['ro-br', jsonData["statistics"]["competitions_by_county"][year]["BR"]],
            ['ro-bv', jsonData["statistics"]["competitions_by_county"][year]["BV"]],
            ['ro-bz', jsonData["statistics"]["competitions_by_county"][year]["BZ"]],
            ['ro-cl', jsonData["statistics"]["competitions_by_county"][year]["CL"]],
            ['ro-cs', jsonData["statistics"]["competitions_by_county"][year]["CS"]],
            ['ro-cj', jsonData["statistics"]["competitions_by_county"][year]["CJ"]],
            ['ro-ct', jsonData["statistics"]["competitions_by_county"][year]["CT"]],
            ['ro-cv', jsonData["statistics"]["competitions_by_county"][year]["CV"]],
            ['ro-db', jsonData["statistics"]["competitions_by_county"][year]["DB"]],
            ['ro-dj', jsonData["statistics"]["competitions_by_county"][year]["DJ"]],
            ['ro-gl', jsonData["statistics"]["competitions_by_county"][year]["GL"]],
            ['ro-gr', jsonData["statistics"]["competitions_by_county"][year]["GR"]],
            ['ro-gj', jsonData["statistics"]["competitions_by_county"][year]["GJ"]],
            ['ro-hr', jsonData["statistics"]["competitions_by_county"][year]["HR"]],
            ['ro-hd', jsonData["statistics"]["competitions_by_county"][year]["HD"]],
            ['ro-il', jsonData["statistics"]["competitions_by_county"][year]["IL"]],
            ['ro-is', jsonData["statistics"]["competitions_by_county"][year]["IS"]],
            ['ro-if', jsonData["statistics"]["competitions_by_county"][year]["IF"]],
            ['ro-mm', jsonData["statistics"]["competitions_by_county"][year]["MM"]],
            ['ro-mh', jsonData["statistics"]["competitions_by_county"][year]["MH"]],
            ['ro-ms', jsonData["statistics"]["competitions_by_county"][year]["MS"]],
            ['ro-nt', jsonData["statistics"]["competitions_by_county"][year]["NT"]],
            ['ro-ot', jsonData["statistics"]["competitions_by_county"][year]["OT"]],
            ['ro-ph', jsonData["statistics"]["competitions_by_county"][year]["PH"]],
            ['ro-sj', jsonData["statistics"]["competitions_by_county"][year]["SJ"]],
            ['ro-sm', jsonData["statistics"]["competitions_by_county"][year]["SM"]],
            ['ro-sb', jsonData["statistics"]["competitions_by_county"][year]["SB"]],
            ['ro-sv', jsonData["statistics"]["competitions_by_county"][year]["SV"]],
            ['ro-tr', jsonData["statistics"]["competitions_by_county"][year]["TR"]],
            ['ro-tm', jsonData["statistics"]["competitions_by_county"][year]["TM"]],
            ['ro-tl', jsonData["statistics"]["competitions_by_county"][year]["TL"]],
            ['ro-vl', jsonData["statistics"]["competitions_by_county"][year]["VL"]],
            ['ro-vs', jsonData["statistics"]["competitions_by_county"][year]["VS"]],
            ['ro-vn', jsonData["statistics"]["competitions_by_county"][year]["VN"]]
        ];
    } else {
        competitions_by_county = [
            ['ro-ab', 0], ['ro-ar', 0], ['ro-ag', 0], ['ro-bi', 0],
            ['ro-bc', 0], ['ro-bh', 0], ['ro-bn', 0], ['ro-bt', 0],
            ['ro-br', 0], ['ro-bv', 0], ['ro-bz', 0], ['ro-cl', 0],
            ['ro-cs', 0], ['ro-cj', 0], ['ro-ct', 0], ['ro-cv', 0],
            ['ro-db', 0], ['ro-dj', 0], ['ro-gl', 0], ['ro-gr', 0],
            ['ro-gj', 0], ['ro-hr', 0], ['ro-hd', 0], ['ro-il', 0],
            ['ro-is', 0], ['ro-if', 0], ['ro-mm', 0], ['ro-mh', 0],
            ['ro-ms', 0], ['ro-nt', 0], ['ro-ot', 0], ['ro-ph', 0],
            ['ro-sj', 0], ['ro-sm', 0], ['ro-sb', 0], ['ro-sv', 0],
            ['ro-tr', 0], ['ro-tm', 0], ['ro-tl', 0], ['ro-vl', 0],
            ['ro-vs', 0], ['ro-vn', 0]
        ];
    }

    // Extract competitions by towns for the year
    if (jsonData["statistics"]["competitions_by_towns"][year]) {
        competitions_by_towns = jsonData["statistics"]["competitions_by_towns"][year];
    } else {
        competitions_by_towns = {};
    }

    // Draw all charts
    draw_highcharts_total(total_competitions);
    draw_highcharts_months(competitions_by_month);
    draw_highcharts_type(competitions_by_type);
    draw_highcharts_county(competitions_by_county);
    draw_highcharts_towns(competitions_by_towns);
}

/**
 * Draws the total competitions gauge chart
 * @param {number} total_competitions - Total number of competitions
 */
function draw_highcharts_total(total_competitions) {
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
            max: 400,
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
                to: 133,
                color: '#DF5353', // red
                thickness: 20
            }, {
                from: 133,
                to: 266,
                color: '#DDDF0D', // yellow
                thickness: 20
            }, {
                from: 266,
                to: 400,
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
            'https://code.highcharts.com/mapdata/countries/ro/ro-all.topo.json'
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

// Listen for theme changes and redraw charts
document.addEventListener('themeChanged', () => {
    if (currentJsonData && currentYear) {
        update_charts_by_year(currentJsonData, currentYear);
    }
});
