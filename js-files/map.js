let currentMapYear = new Date().getFullYear();
let currentMapData = null;
let mapChartInstance = null;
let roTopology = null;

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

function change_year(year) {
    currentMapYear = year;
    document.getElementById('text_year').textContent = year;
    loadMapForYear(year);
}

async function loadAvailableYears() {
    try {
        const data = await fetch_json_file('json-files/output-all-competitions-list.json');
        const years = data.years || [];
        const dropdownMenu = document.getElementById('year-dropdown-menu');
        if (!dropdownMenu) return;

        dropdownMenu.innerHTML = '';
        years.forEach(year => {
            const li = document.createElement('li');
            li.innerHTML = `<a class="dropdown-item" href="javascript:void(0);" onclick="change_year(${year})">${year}</a>`;
            dropdownMenu.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading available years:', error);
    }
}

async function getTopology() {
    if (!roTopology) {
        roTopology = await fetch('json-files/ro-all.topo.json').then(r => r.json());
    }
    return roTopology;
}

function groupByCoordinates(competitions) {
    const groups = {};
    for (const e of competitions) {
        const key = `${e.lat},${e.lon}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(e);
    }

    return Object.values(groups).map(group => {
        const first = group[0];
        if (group.length === 1) {
            return {
                name: first.name,
                lat: first.lat,
                lon: first.lon,
                events: group
            };
        }
        return {
            name: first.location,
            lat: first.lat,
            lon: first.lon,
            events: group
        };
    });
}

async function loadMapForYear(year) {
    try {
        const events = await fetch_json_file(`json-files/output-events-${year}.json`);
        const geoEvents = events.filter(e => e.lat != null && e.lon != null);
        currentMapData = groupByCoordinates(geoEvents);
        await drawMap(currentMapData, geoEvents.length);
    } catch (error) {
        console.error('Error loading map data:', error);
    }
}

async function drawMap(points, totalCount) {
    const colors = getThemeColors();
    const topology = await getTopology();

    if (mapChartInstance) {
        mapChartInstance.destroy();
        mapChartInstance = null;
    }

    mapChartInstance = Highcharts.mapChart('map-container', {
        chart: {
            map: topology,
            backgroundColor: colors.backgroundColor
        },
        title: {
            text: 'Competitions on the map',
            style: { color: colors.textColor }
        },
        subtitle: {
            text: `${totalCount} competition${totalCount !== 1 ? 's' : ''} with location data`,
            style: { color: colors.textColor }
        },
        mapNavigation: {
            enabled: true,
            buttonOptions: { verticalAlign: 'bottom' }
        },
        tooltip: {
            useHTML: true,
            stickOnContact: true,
            formatter: function () {
                const p = this.point;
                if (p.clusterPointsAmount) {
                    return `<b>${p.clusterPointsAmount} competitions</b>`;
                }

                const events = p.events || [];

                if (events.length > 1) {
                    let html = `<b>${p.name}</b>`;
                    events.forEach(e => {
                        const nameHtml = e.link
                            ? `<a href="${e.link}" target="_blank" rel="noopener">${e.name}</a>`
                            : e.name;
                        const dists = (e.distances || []).join(', ');
                        html += `<hr style="margin:4px 0">`;
                        html += `<b>${nameHtml}</b><br>${e.display_date}<br>`;
                        if (e.location_details) html += `${e.location_details}<br>`;
                        html += `Type: ${e.type}`;
                        if (dists) html += `<br>${dists}`;
                    });
                    return html;
                }

                const e = events[0] || p;
                const dists = (e.distances || []).join(', ');
                const nameHtml = e.link
                    ? `<b><a href="${e.link}" target="_blank" rel="noopener">${e.name}</a></b>`
                    : `<b>${e.name}</b>`;
                return `${nameHtml}<br>` +
                    `${e.display_date}<br>` +
                    `${e.location} · ${e.county}<br>` +
                    (e.location_details ? `${e.location_details}<br>` : '') +
                    `Type: ${e.type}` +
                    (dists ? `<br>${dists}` : '');
            },
            backgroundColor: colors.tooltipBackground,
            borderColor: colors.tooltipBorder,
            style: { color: colors.textColor }
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'Romania',
            enableMouseTracking: false,
            showInLegend: false,
            nullColor: colors.nullColor,
            borderColor: colors.gridColor,
            borderWidth: 0.5
        }, {
            type: 'mappoint',
            name: 'Competitions',
            color: '#2caffe',
            marker: {
                symbol: 'mapmarker',
                radius: 8
            },
            dataLabels: {
                enabled: true,
                verticalAlign: 'bottom',
                y: -16,
                style: {
                    color: colors.textColor,
                    textOutline: '2px contrast'
                }
            },
            cluster: {
                enabled: true,
                allowOverlap: false,
                animation: { duration: 450 },
                layoutAlgorithm: {
                    type: 'grid',
                    gridSize: 70
                },
                dataLabels: {
                    verticalAlign: 'middle',
                    y: 0
                },
                zones: [
                    { from: 1, to: 4, marker: { radius: 13 } },
                    { from: 5, to: 9, marker: { radius: 15 } },
                    { from: 10, to: Infinity, marker: { radius: 18 } }
                ]
            },
            data: points
        }]
    });
}

document.addEventListener('themeChanged', () => {
    if (currentMapData) {
        drawMap(currentMapData);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('text_year').textContent = currentMapYear;
    loadAvailableYears();
    loadMapForYear(currentMapYear);
});