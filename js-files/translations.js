/**
 * Translations for all pages.
 *
 * HOW TO EDIT
 *  - Every text shown on the site lives here, one entry per language ("en", "ro").
 *    Change the text on the right of a key to change what is displayed.
 *  - Keys must exist in BOTH languages. A missing Romanian key falls back to English.
 *  - {name} placeholders (e.g. {year}, {n}) are replaced at runtime - keep them in the translation.
 *  - Competition names, locations and counties come from the data files and are NOT translated.
 *  - Plural texts use three keys: "<key>.one", "<key>.few", "<key>.other"
 *    (Romanian needs all three, English only uses "one" and "other").
 *
 * HOW TO ADD A LANGUAGE
 *  1. Add an entry to LANGUAGES below (code, label shown in the selector, flag).
 *  2. Add a matching block to TRANSLATIONS and, if needed, a rule to PLURAL_RULES.
 *  3. Add the flag in css-files/main.css (class "flag-<flag>").
 *
 * Selecting a language adds "lang=<code>" to the URL (e.g. index.html?sport=running&lang=ro);
 * the navigation links keep it so the language persists between pages.
 */

const DEFAULT_LANG = 'en';

// Languages offered in the selector (the first one is shown first)
const LANGUAGES = [
    { code: 'en', label: 'English', flag: 'gb', locale: 'en-GB' },
    { code: 'ro', label: 'Română', flag: 'ro', locale: 'ro-RO' }
];

// Which plural form ("one" | "few" | "other") a number uses in each language
const PLURAL_RULES = {
    en: n => (n === 1 ? 'one' : 'other'),
    ro: n => (n === 1 ? 'one' : (n === 0 || (n % 100 >= 2 && n % 100 <= 19)) ? 'few' : 'other')
};

const TRANSLATIONS = {
    /* ==================================================================
       ENGLISH
       ================================================================== */
    en: {
        /* ---------- Shared ---------- */
        'common.loading': 'Loading...',
        'common.loadingCompetitions': 'Loading competitions...',
        'common.na': 'N/A',
        'common.all': 'All',
        'common.error': 'Error',
        'common.backToTop': 'Back to top',

        'lists.months': ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'],
        'lists.monthsShort': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        // Sunday first (same order as JavaScript's Date.getDay())
        'lists.daysShort': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

        /* ---------- Navbar ---------- */
        'nav.toggle': 'Toggle navigation',
        'nav.competitions': 'Competitions',
        'nav.calendar': 'Calendar',
        'nav.map': 'Map',
        'nav.statistics': 'Statistics',
        'nav.statisticsPerYear': 'Statistics per year',
        'nav.generalStatistics': 'General Statistics',
        'nav.badNews': 'Bad News',
        'nav.extra': 'Extra',
        'nav.archive': 'Archive',
        'nav.parkRun': 'Park Run',
        'nav.contact': 'Contact',

        'theme.toggle': 'Toggle theme',
        'theme.light': 'Light',
        'theme.dark': 'Dark',
        'theme.auto': 'Auto',
        'language.toggle': 'Change language',

        /* ---------- Sports (dropdown labels) ---------- */
        'sport.running': 'Running',
        'sport.all': 'All Sports',
        'sport.swimming': 'Swimming',
        'sport.triathlon': 'Triathlon',
        'sport.cycling': 'Cycling',
        'sport.aquatlon': 'Aquatlon',
        'sport.duathlon': 'Duathlon',
        'sport.skiing': 'Skiing',
        'sport.climbing': 'Climbing',
        'sport.orienteering': 'Orienteering',
        'sport.kayak': 'Kayak',
        'sport.paddleboarding': 'Paddleboarding',
        'sport.hyatlon': 'Hyatlon',

        // Sport as used inside a sentence ("... number of <phrase> competitions ...")
        'sportPhrase.running': 'running',
        'sportPhrase.all': 'all sports',
        'sportPhrase.swimming': 'swimming',
        'sportPhrase.triathlon': 'triathlon',
        'sportPhrase.cycling': 'cycling',
        'sportPhrase.aquatlon': 'aquatlon',
        'sportPhrase.duathlon': 'duathlon',
        'sportPhrase.skiing': 'skiing',
        'sportPhrase.climbing': 'climbing',
        'sportPhrase.orienteering': 'orienteering',
        'sportPhrase.kayak': 'kayak',
        'sportPhrase.paddleboarding': 'paddleboarding',
        'sportPhrase.hyatlon': 'hyatlon',

        /* ---------- Competition types and statuses (values come from the data files) ---------- */
        'type.road': 'road',
        'type.trail': 'trail',
        'type.virtual': 'virtual',
        'type.mixed': 'mixed',
        'type.obstacles': 'obstacles',
        'type.sand': 'sand',
        'type.stairs': 'stairs',
        'type.track': 'track',
        'type.wine cellar': 'wine cellar',
        'type.other': 'other',

        'status.Cancelled': 'Cancelled',
        'status.Not Held': 'Not Held',
        'status.Rescheduled': 'Rescheduled',

        /* ---------- Table columns ---------- */
        'col.id': 'ID',
        'col.sport': 'Sport',
        'col.date': 'Date',
        'col.month': 'Month',
        'col.competition': 'Competition',
        'col.competitionName': 'Competition Name',
        'col.name': 'Competition',
        'col.location': 'Location',
        'col.county': 'County',
        'col.type': 'Type',
        'col.distances': 'Distances',

        /* ---------- Plurals ---------- */
        'count.competitions.one': '{n} competition',
        'count.competitions.few': '{n} competitions',
        'count.competitions.other': '{n} competitions',
        'count.laps.one': '{n} lap',
        'count.laps.few': '{n} laps',
        'count.laps.other': '{n} laps',

        /* ---------- Competitions page (index.html) ---------- */
        'index.title': 'Calendar Competitii Alergare Romania 2025-2026 | Maratoane, Semimaratoane, Trail Running, Ultramaratoane',
        'index.description': 'Complete calendar of running competitions in Romania. Find marathons, half marathons, trail running, ultramarathons and other running events organised across the country. Regularly updated with all running competitions 2025-2026.',
        'index.heading': 'Romania Competitions Calendar',
        'index.lastUpdate': 'Last Update:',
        'index.version': 'Version:',
        'index.selectYearSport': 'Select year and sport:',
        'index.filterToggle': 'Filter competitions',
        'index.filters': 'Filters',
        'index.resetFilters': 'Reset filters',
        'index.search': 'Search',
        'index.filterBy': 'Filter by {column}',
        'index.noMatch': 'No competitions match the filters',
        'index.facebookPage': 'Facebook Page',
        'index.preparingTitle': 'Competitions for {year}',
        'index.preparingText': 'Competition data for {year} is being prepared. Please check back later.',
        'index.loadErrorText': 'Unable to load competitions for {year}. Please try again later.',

        /* ---------- Calendar page ---------- */
        'calendar.title': 'Calendar | Romania Running',
        'calendar.heading': 'Calendar',
        'calendar.prevMonth': 'Previous month',
        'calendar.nextMonth': 'Next month',
        'calendar.week': 'Week',
        'calendar.weekHeading': 'Week {week}',

        /* ---------- Map page ---------- */
        'map.title': 'Map | Romania Running',
        'map.heading': 'Map',
        'map.selectYearMonth': 'Select year and month:',
        'map.allMonths': 'All months',
        'map.resetZoom': 'Reset zoom',
        'map.past': 'Past',
        'map.thisWeek': 'This week',
        'map.upcoming': 'Upcoming',
        'map.today': 'Today: {date}',
        'map.chartTitle': 'Competitions on the map',
        'map.subtitle.one': '{n} competition with location data',
        'map.subtitle.few': '{n} competitions with location data',
        'map.subtitle.other': '{n} competitions with location data',
        'map.sport': 'Sport',
        'map.type': 'Type',
        'map.series': 'Competitions',

        /* ---------- Statistics per year ---------- */
        'statistics.title': 'Statistics per year | Romania Running',
        'statistics.description': 'Complete statistics about running competitions in Romania. Analyse the number of races by month, type, county and town. Data updated for every year.',
        'statistics.heading': 'Statistics per year',
        'statistics.note': 'Note: Virtual competitions and competitions from the Republic of Moldova are not included in these statistics.',
        'statistics.selectYearSport': 'Select year and sport:',
        'statistics.header.total': '1. Total number of {sport} competitions in Romania',
        'statistics.header.month': '2. Number of {sport} competitions in Romania by month',
        'statistics.header.type': '3. Number of running competitions in Romania by type',
        'statistics.header.county': '4. Number of {sport} competitions in Romania by county',
        'statistics.header.towns': '5. Number of {sport} competitions in Romania by towns',
        'statistics.chart.total': 'Total Competitions',
        'statistics.chart.byMonth': 'Competitions by month',
        'statistics.chart.byType': 'Competitions by type',
        'statistics.chart.byCounty': 'Competitions by county',
        'statistics.chart.topTowns': 'Top towns',
        'statistics.chart.byTowns': 'Competitions by towns',
        'statistics.chart.competitions': 'Competitions',
        'statistics.chart.month': 'Month',
        'statistics.chart.total.series': 'Total',
        'statistics.chart.numberOfCompetitions': 'Number of competitions',
        'statistics.chart.towns': 'Towns',
        'statistics.type.trail': 'Trail',
        'statistics.type.road': 'Road',
        'statistics.type.other': 'Other',

        /* ---------- General statistics ---------- */
        'generalStatistics.title': 'General Statistics | Romania Running',
        'generalStatistics.description': 'General statistics about running competitions in Romania.',
        'generalStatistics.heading': 'General Statistics',
        'generalStatistics.selectSport': 'Select sport:',
        'generalStatistics.header.byYear': '1. Number of competitions in Romania by year',
        'generalStatistics.chart.byYear': 'Competitions by year',
        'generalStatistics.chart.competitions': 'Competitions',
        'generalStatistics.chart.year': 'Year',

        /* ---------- Bad news ---------- */
        'badNews.title': 'Cancelled or Rescheduled Competitions | Romania Running',
        'badNews.description': 'List of running competitions in Romania that were cancelled or rescheduled. Check the latest changes in the running events calendar.',
        'badNews.heading': 'Bad News',
        'badNews.originalDate': 'Original Date',
        'badNews.competition': 'Competition',
        'badNews.status': 'Status',

        /* ---------- Archive ---------- */
        'archive.title': 'Archive | Romania Running',
        'archive.description': 'Archive of all running competitions in Romania with historical data.',
        'archive.heading': 'Archive',
        'archive.selectSport': 'Select sport:',
        'archive.competitions': 'Competitions',
        'archive.moldova': 'Competitions from Republic of Moldova',
        'archive.notIncluded': 'Not included in statistics',
        'archive.other': 'Other Competitions',
        'archive.virtualNotIncluded': 'Virtual competitions - Not included in statistics',
        'archive.total': 'Total: {count}',
        'archive.none': 'No competitions found',
        'archive.loadError': 'Error loading competitions data',

        /* ---------- Park Run ---------- */
        'park.title': 'Bucharest Park Run | Romania Running',
        'park.description': 'Running routes through the parks of Bucharest. Discover routes of about 10km in the most beautiful parks of the capital for your running workouts.',
        'park.heading': 'Bucharest Park Run',
        'park.intro': 'Here are listed some parks of Bucharest.<br>For each park, a running activity is linked.<br>Each activity has around 10km.',
        'park.stravaActivity': 'Strava Activity',
        'park.kmPerLap': 'km/lap',

        /* ---------- Contact ---------- */
        'contact.title': 'Contact Romania Running | Running Competitions Calendar',
        'contact.description': 'Contact Romania Running for suggestions, changes or corrections about the calendar of running competitions in Romania.',
        'contact.heading': 'Contact',
        'contact.text': 'If you have suggestions, found changes or mistakes you can contact me at'
    },

    /* ==================================================================
       ROMANIAN
       ================================================================== */
    ro: {
        /* ---------- Shared ---------- */
        'common.loading': 'Se încarcă...',
        'common.loadingCompetitions': 'Se încarcă competițiile...',
        'common.na': 'N/A',
        'common.all': 'Toate',
        'common.error': 'Eroare',
        'common.backToTop': 'Înapoi sus',

        'lists.months': ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
                         'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'],
        'lists.monthsShort': ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun',
                              'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'],
        // Sunday first (same order as JavaScript's Date.getDay())
        'lists.daysShort': ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],

        /* ---------- Navbar ---------- */
        'nav.toggle': 'Comută navigarea',
        'nav.competitions': 'Competiții',
        'nav.calendar': 'Calendar',
        'nav.map': 'Hartă',
        'nav.statistics': 'Statistici',
        'nav.statisticsPerYear': 'Statistici pe an',
        'nav.generalStatistics': 'Statistici generale',
        'nav.badNews': 'Vești proaste',
        'nav.extra': 'Extra',
        'nav.archive': 'Arhivă',
        'nav.parkRun': 'Park Run',
        'nav.contact': 'Contact',

        'theme.toggle': 'Schimbă tema',
        'theme.light': 'Luminoasă',
        'theme.dark': 'Întunecată',
        'theme.auto': 'Automată',
        'language.toggle': 'Schimbă limba',

        /* ---------- Sports (dropdown labels) ---------- */
        'sport.running': 'Alergare',
        'sport.all': 'Toate sporturile',
        'sport.swimming': 'Înot',
        'sport.triathlon': 'Triatlon',
        'sport.cycling': 'Ciclism',
        'sport.aquatlon': 'Aquatlon',
        'sport.duathlon': 'Duatlon',
        'sport.skiing': 'Schi',
        'sport.climbing': 'Escaladă',
        'sport.orienteering': 'Orientare',
        'sport.kayak': 'Caiac',
        'sport.paddleboarding': 'Paddleboarding',
        'sport.hyatlon': 'Hyatlon',

        // Sport as used inside a sentence ("... numărul de competiții <phrase> ...")
        'sportPhrase.running': 'de alergare',
        'sportPhrase.all': 'din toate sporturile',
        'sportPhrase.swimming': 'de înot',
        'sportPhrase.triathlon': 'de triatlon',
        'sportPhrase.cycling': 'de ciclism',
        'sportPhrase.aquatlon': 'de aquatlon',
        'sportPhrase.duathlon': 'de duatlon',
        'sportPhrase.skiing': 'de schi',
        'sportPhrase.climbing': 'de escaladă',
        'sportPhrase.orienteering': 'de orientare',
        'sportPhrase.kayak': 'de caiac',
        'sportPhrase.paddleboarding': 'de paddleboarding',
        'sportPhrase.hyatlon': 'de hyatlon',

        /* ---------- Competition types and statuses (values come from the data files) ---------- */
        'type.road': 'șosea',
        'type.trail': 'trail',
        'type.virtual': 'virtuală',
        'type.mixed': 'mixt',
        'type.obstacles': 'obstacole',
        'type.sand': 'nisip',
        'type.stairs': 'scări',
        'type.track': 'pistă',
        'type.wine cellar': 'cramă',
        'type.other': 'altele',

        'status.Cancelled': 'Anulată',
        'status.Not Held': 'Neorganizată',
        'status.Rescheduled': 'Reprogramată',

        /* ---------- Table columns ---------- */
        'col.id': 'ID',
        'col.sport': 'Sport',
        'col.date': 'Data',
        'col.month': 'Luna',
        'col.competition': 'Competiție',
        'col.competitionName': 'Nume competiție',
        'col.name': 'Competiție',
        'col.location': 'Localitate',
        'col.county': 'Județ',
        'col.type': 'Tip',
        'col.distances': 'Distanțe',

        /* ---------- Plurals ---------- */
        'count.competitions.one': '{n} competiție',
        'count.competitions.few': '{n} competiții',
        'count.competitions.other': '{n} de competiții',
        'count.laps.one': '{n} tur',
        'count.laps.few': '{n} ture',
        'count.laps.other': '{n} de ture',

        /* ---------- Competitions page (index.html) ---------- */
        'index.title': 'Calendar Competiții Alergare România 2025-2026 | Maratoane, Semimaratoane, Trail Running, Ultramaratoane',
        'index.description': 'Calendar complet al competițiilor de alergare din România. Găsește maratoane, semimaratoane, trail running, ultramaratoane și alte evenimente de alergat organizate în toată țara. Actualizat regulat cu toate competițiile de alergare 2025-2026.',
        'index.heading': 'Calendarul competițiilor din România',
        'index.lastUpdate': 'Ultima actualizare:',
        'index.version': 'Versiunea:',
        'index.selectYearSport': 'Alege anul și sportul:',
        'index.filterToggle': 'Filtrează competițiile',
        'index.filters': 'Filtre',
        'index.resetFilters': 'Resetează filtrele',
        'index.search': 'Caută',
        'index.filterBy': 'Filtrează după {column}',
        'index.noMatch': 'Nicio competiție nu corespunde filtrelor',
        'index.facebookPage': 'Pagina de Facebook',
        'index.preparingTitle': 'Competiții în {year}',
        'index.preparingText': 'Datele competițiilor pentru {year} sunt în curs de pregătire. Revino mai târziu.',
        'index.loadErrorText': 'Nu s-au putut încărca competițiile pentru {year}. Încearcă din nou mai târziu.',

        /* ---------- Calendar page ---------- */
        'calendar.title': 'Calendar | Romania Running',
        'calendar.heading': 'Calendar',
        'calendar.prevMonth': 'Luna anterioară',
        'calendar.nextMonth': 'Luna următoare',
        'calendar.week': 'Săpt.',
        'calendar.weekHeading': 'Săptămâna {week}',

        /* ---------- Map page ---------- */
        'map.title': 'Hartă | Romania Running',
        'map.heading': 'Hartă',
        'map.selectYearMonth': 'Alege anul și luna:',
        'map.allMonths': 'Toate lunile',
        'map.resetZoom': 'Resetează zoom',
        'map.past': 'Trecute',
        'map.thisWeek': 'Săptămâna aceasta',
        'map.upcoming': 'Viitoare',
        'map.today': 'Azi: {date}',
        'map.chartTitle': 'Competiții pe hartă',
        'map.subtitle.one': '{n} competiție cu date de localizare',
        'map.subtitle.few': '{n} competiții cu date de localizare',
        'map.subtitle.other': '{n} de competiții cu date de localizare',
        'map.sport': 'Sport',
        'map.type': 'Tip',
        'map.series': 'Competiții',

        /* ---------- Statistics per year ---------- */
        'statistics.title': 'Statistici Competiții Alergare România | Romania Running',
        'statistics.description': 'Statistici complete despre competițiile de alergare din România. Analizează numărul de curse pe lună, tip, județe și orașe. Date actualizate pentru fiecare an.',
        'statistics.heading': 'Statistici pe an',
        'statistics.note': 'Notă: Competițiile virtuale și cele din Republica Moldova nu sunt incluse în aceste statistici.',
        'statistics.selectYearSport': 'Alege anul și sportul:',
        'statistics.header.total': '1. Numărul total de competiții {sport} din România',
        'statistics.header.month': '2. Numărul de competiții {sport} din România pe luni',
        'statistics.header.type': '3. Numărul de competiții de alergare din România pe tipuri',
        'statistics.header.county': '4. Numărul de competiții {sport} din România pe județe',
        'statistics.header.towns': '5. Numărul de competiții {sport} din România pe localități',
        'statistics.chart.total': 'Total competiții',
        'statistics.chart.byMonth': 'Competiții pe luni',
        'statistics.chart.byType': 'Competiții pe tipuri',
        'statistics.chart.byCounty': 'Competiții pe județe',
        'statistics.chart.topTowns': 'Top localități',
        'statistics.chart.byTowns': 'Competiții pe localități',
        'statistics.chart.competitions': 'Competiții',
        'statistics.chart.month': 'Luna',
        'statistics.chart.total.series': 'Total',
        'statistics.chart.numberOfCompetitions': 'Număr de competiții',
        'statistics.chart.towns': 'Localități',
        'statistics.type.trail': 'Trail',
        'statistics.type.road': 'Șosea',
        'statistics.type.other': 'Altele',

        /* ---------- General statistics ---------- */
        'generalStatistics.title': 'Statistici Generale Competiții Alergare România | Romania Running',
        'generalStatistics.description': 'Statistici generale despre competițiile de alergare din România.',
        'generalStatistics.heading': 'Statistici generale',
        'generalStatistics.selectSport': 'Alege sportul:',
        'generalStatistics.header.byYear': '1. Numărul de competiții din România pe ani',
        'generalStatistics.chart.byYear': 'Competiții pe ani',
        'generalStatistics.chart.competitions': 'Competiții',
        'generalStatistics.chart.year': 'An',

        /* ---------- Bad news ---------- */
        'badNews.title': 'Competiții Anulate sau Reprogramate | Romania Running',
        'badNews.description': 'Lista competițiilor de alergare din România care au fost anulate sau reprogramate. Verifică cele mai recente modificări din calendarul evenimentelor de running.',
        'badNews.heading': 'Vești proaste',
        'badNews.originalDate': 'Data inițială',
        'badNews.competition': 'Competiție',
        'badNews.status': 'Stare',

        /* ---------- Archive ---------- */
        'archive.title': 'Arhivă | Romania Running',
        'archive.description': 'Arhiva tuturor competițiilor de alergare din România, cu date istorice.',
        'archive.heading': 'Arhivă',
        'archive.selectSport': 'Alege sportul:',
        'archive.competitions': 'Competiții',
        'archive.moldova': 'Competiții din Republica Moldova',
        'archive.notIncluded': 'Nu sunt incluse în statistici',
        'archive.other': 'Alte competiții',
        'archive.virtualNotIncluded': 'Competiții virtuale - Nu sunt incluse în statistici',
        'archive.total': 'Total: {count}',
        'archive.none': 'Nu s-au găsit competiții',
        'archive.loadError': 'Eroare la încărcarea datelor competițiilor',

        /* ---------- Park Run ---------- */
        'park.title': 'Trasee Alergare Parcuri București | Romania Running',
        'park.description': 'Trasee de alergare prin parcurile din București. Descoperă rute de aproximativ 10 km în cele mai frumoase parcuri ale capitalei pentru antrenamente de alergare.',
        'park.heading': 'Park Run București',
        'park.intro': 'Aici sunt listate câteva parcuri din București.<br>Pentru fiecare parc este atașată o activitate de alergare.<br>Fiecare activitate are în jur de 10 km.',
        'park.stravaActivity': 'Activitate Strava',
        'park.kmPerLap': 'km/tur',

        /* ---------- Contact ---------- */
        'contact.title': 'Contact Romania Running | Calendar Competiții Alergare',
        'contact.description': 'Contactează Romania Running pentru sugestii, modificări sau corecturi despre calendarul competițiilor de alergare din România.',
        'contact.heading': 'Contact',
        'contact.text': 'Dacă ai sugestii sau ai găsit modificări ori greșeli, mă poți contacta la'
    }
};
