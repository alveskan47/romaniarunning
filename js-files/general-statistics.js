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

let generalJsonData = null;

function general_statistics_main() {
    (async () => {
        try {
            generalJsonData = await fetch_json_file('json-files/output-all-statistics.json');
            draw_competitions_by_year(generalJsonData);
        } catch (error) {
            console.error('Error in fetching or using JSON:', error);
        }
    })();
}

function draw_competitions_by_year(jsonData) {
    const colors = getThemeColorsGeneral();
    const totalObj = jsonData['statistics']['total_competitions'];

    const years = Object.keys(totalObj).map(Number).sort((a, b) => a - b);
    const values = years.map(y => totalObj[y]);

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

document.addEventListener('themeChanged', () => {
    if (generalJsonData) {
        draw_competitions_by_year(generalJsonData);
    }
});
