// General JavaScript file for all pages

/* ========================================
   Localization (translations live in translations.js)
   ======================================== */

/**
 * Determines the page language: "lang" URL parameter, then the last choice saved
 * in localStorage, then the default language
 * @returns {string} A language code listed in LANGUAGES
 */
function resolveLanguage() {
    const isValid = code => LANGUAGES.some(language => language.code === code);

    const fromUrl = (new URLSearchParams(window.location.search).get('lang') || '').toLowerCase();
    if (isValid(fromUrl)) return fromUrl;

    try {
        const stored = localStorage.getItem('lang');
        if (isValid(stored)) return stored;
    } catch (error) {
        // localStorage can be unavailable (private mode); fall through to the default
    }
    return DEFAULT_LANG;
}

const CURRENT_LANG = resolveLanguage();
document.documentElement.lang = CURRENT_LANG;

/**
 * Returns true if a translation exists for the key in the current language or in English
 * @param {string} key - Translation key
 * @returns {boolean}
 */
function hasTranslation(key) {
    return (key in TRANSLATIONS[CURRENT_LANG]) || (key in TRANSLATIONS[DEFAULT_LANG]);
}

/**
 * Looks up a translation (current language, then English, then the key itself)
 * and replaces {placeholders} with the given params
 * @param {string} key - Translation key
 * @param {Object} [params] - Values for {placeholders}
 * @returns {string|Array} The translated text (or a list, for "lists.*" keys)
 */
function t(key, params) {
    let text = TRANSLATIONS[CURRENT_LANG][key];
    if (text === undefined) text = TRANSLATIONS[DEFAULT_LANG][key];
    if (text === undefined) return key;
    if (typeof text !== 'string' || !params) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? params[name] : match));
}

/**
 * Translates a text that depends on a number (e.g. "1 competition" / "5 competitions")
 * using the keys "<key>.one", "<key>.few" and "<key>.other"
 * @param {string} key - Base translation key
 * @param {number} n - The count (available as {n} in the text)
 * @param {Object} [params] - Extra values for {placeholders}
 * @returns {string}
 */
function tPlural(key, n, params) {
    const category = (PLURAL_RULES[CURRENT_LANG] || PLURAL_RULES[DEFAULT_LANG])(n);
    const fullKey = hasTranslation(`${key}.${category}`) ? `${key}.${category}` : `${key}.other`;
    return t(fullKey, { n, ...params });
}

/**
 * Translates a value coming from the data files (competition type, status...),
 * keeping the original value when no translation is defined
 * @param {string} prefix - Key prefix (e.g. "type")
 * @param {string} value - The raw data value
 * @returns {string}
 */
function tData(prefix, value) {
    return hasTranslation(`${prefix}.${value}`) ? t(`${prefix}.${value}`) : value;
}

/**
 * Adds the current language to an internal link so it persists between pages
 * (e.g. "calendar.html" -> "calendar.html?lang=ro")
 * @param {string} href - Relative page link
 * @returns {string}
 */
function withLang(href) {
    if (!href || /^(https?:|mailto:|#|javascript:)/i.test(href)) return href;
    const [path, hash] = href.split('#');
    const withParam = /([?&])lang=[^&]*/.test(path)
        ? path.replace(/([?&])lang=[^&]*/, `$1lang=${CURRENT_LANG}`)
        : path + (path.includes('?') ? '&' : '?') + `lang=${CURRENT_LANG}`;
    return hash === undefined ? withParam : `${withParam}#${hash}`;
}

/**
 * Reflects the current language in the URL ("?lang=ro") without reloading the page
 */
function updateLangInUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', CURRENT_LANG);
    window.history.replaceState({}, '', url);
}

/**
 * Switches language: remembers the choice and reloads the page with "lang=<code>"
 * (every other URL parameter, such as "sport", is kept)
 * @param {string} code - Language code from LANGUAGES
 */
function setLanguage(code) {
    try {
        localStorage.setItem('lang', code);
    } catch (error) {
        // Not remembered locally; the URL parameter still carries the choice
    }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', code);
    window.location.href = url.toString();
}

/**
 * Fills every element marked for translation in the HTML:
 *  - data-i18n="key"                        -> sets the text
 *  - data-i18n-html="key"                   -> sets the HTML (for texts with <br>)
 *  - data-i18n-attr="attr:key;attr2:key2"   -> sets attributes (aria-label, title, content...)
 */
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        element.innerHTML = t(element.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
        element.dataset.i18nAttr.split(';').forEach(pair => {
            const [attribute, key] = pair.split(':');
            if (attribute && key) element.setAttribute(attribute.trim(), t(key.trim()));
        });
    });
}

/**
 * Formats a date like "Thu 01-Jan-2026" in the current language
 * @param {number} year - Full year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day of month
 * @returns {string}
 */
function formatEventDate(year, month, day) {
    const dayName = t('lists.daysShort')[new Date(year, month - 1, day).getDay()];
    return `${dayName} ${String(day).padStart(2, '0')}-${t('lists.monthsShort')[month - 1]}-${year}`;
}

/**
 * Display date of a competition from the data files, in the current language
 * @param {Object} competition - Event object with year, month, day (display_date is the fallback)
 * @returns {string}
 */
function formatCompetitionDate(competition) {
    return competition.year && competition.month && competition.day
        ? formatEventDate(competition.year, competition.month, competition.day)
        : competition.display_date;
}

updateLangInUrl();

/* ========================================
   Shared Sport Selector Functions
   ======================================== */

// Sports available across pages that support multisport filtering, in display order.
// Value 'all' means show every sport (and, where applicable, label each item with its sport).
// The label is translated (key "sport.<value>" in translations.js).
const SPORTS = [
    'running', 'all', 'swimming', 'triathlon', 'cycling', 'aquatlon',
    'duathlon', 'skiing', 'climbing', 'orienteering', 'kayak', 'paddleboarding', 'hyatlon'
].map(value => ({
    value,
    get label() { return t(`sport.${value}`); }
}));

/**
 * Translated display name of a sport value (e.g. "running" -> "Running" / "Alergare")
 * @param {string} sport - The sport value
 * @returns {string} The translated sport name
 */
function formatSportName(sport) {
    return hasTranslation(`sport.${sport}`)
        ? t(`sport.${sport}`)
        : sport.charAt(0).toUpperCase() + sport.slice(1);
}

/**
 * Reads the "sport" query parameter from the URL (e.g. index.html?sport=all)
 * @returns {string} A valid sport value from SPORTS, or the default ('running') if
 * the parameter is missing or not recognized
 */
function getSportFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const sportParam = (params.get('sport') || '').toLowerCase();
    const isValid = SPORTS.some(s => s.value === sportParam);
    return isValid ? sportParam : SPORTS[0].value;
}

/**
 * Updates the "sport" query parameter in the URL to match the current selection,
 * without reloading the page
 * @param {string} sport - The sport value to reflect in the URL
 */
function updateSportInUrl(sport) {
    const url = new URL(window.location.href);
    url.searchParams.set('sport', sport);
    window.history.replaceState({}, '', url);
}

/**
 * Populates a sport dropdown menu with the available sports
 * @param {string} menuId - The id of the <ul> dropdown-menu element to populate
 * @param {string} onSelectFnName - Name of the global function to call (with the sport value) on selection
 */
function loadAvailableSports(menuId, onSelectFnName) {
    const dropdownMenu = document.getElementById(menuId);
    if (!dropdownMenu) return;

    dropdownMenu.innerHTML = '';
    SPORTS.forEach(sportEntry => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="javascript:void(0);" onclick="${onSelectFnName}('${sportEntry.value}')">${sportEntry.label}</a>`;
        dropdownMenu.appendChild(li);
    });
}

/**
 * Fetches and parses a JSON file from the specified path
 * @param {string} file_path - The path to the JSON file to fetch
 * @returns {Promise<Object>} A promise that resolves to the parsed JSON data
 * @throws {Error} Throws an error if the network response is not ok or fetch fails
 */
async function fetch_json_file(file_path) {
    try {
        const response = await fetch(file_path);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
}

/* ========================================
   Dynamic Navbar Functions
   ======================================== */

/**
 * Gets the current page filename from the URL
 * @returns {string} The current page filename (e.g., "index.html", "park.html")
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    // Return index.html as default if no specific page is in URL
    return page || 'index.html';
}

/**
 * Translated label of a navigation entry: uses "nav.<page_key>" from translations.js
 * and falls back to the page_name from pages.json when no key/translation exists
 * @param {Object} page - Page (or sub-page) object from pages.json
 * @returns {string}
 */
function navLabel(page) {
    const key = `nav.${page.page_key}`;
    return page.page_key && hasTranslation(key) ? t(key) : page.page_name;
}

/**
 * Creates a navigation link element for a single page
 * @param {Object} page - The page object from pages.json
 * @param {string} page.page_name - Display name of the page
 * @param {string} page.page_link - URL/filename of the page
 * @param {boolean} isActive - Whether this is the current active page
 * @returns {string} HTML string for the navigation item
 */
function createNavLink(page, isActive) {
    const activeClass = isActive ? ' active' : '';
    const ariaCurrent = isActive ? ' aria-current="page"' : '';

    return `
        <li class="nav-item">
            <a class="nav-link${activeClass}"${ariaCurrent} href="${withLang(page.page_link)}">
                ${navLabel(page)}
            </a>
        </li>
    `;
}

/**
 * Creates a dropdown navigation menu for pages with sub-items
 * @param {Object} page - The page object from pages.json
 * @param {string} page.page_name - Display name of the dropdown
 * @param {Array} page.sub_pages - Array of sub-page objects
 * @param {string} currentPage - The current active page filename
 * @returns {string} HTML string for the dropdown navigation item
 */
function createNavDropdown(page, currentPage) {
    // Check if any sub-page is active
    const hasActivePage = page.sub_pages.some(subPage => subPage.page_link === currentPage);
    const activeClass = hasActivePage ? ' active' : '';

    // Generate dropdown items
    const dropdownItems = page.sub_pages
        .map(subPage => {
            const subActiveClass = subPage.page_link === currentPage ? ' active' : '';
            const subAriaCurrent = subPage.page_link === currentPage ? ' aria-current="page"' : '';
            return `
                <li>
                    <a class="dropdown-item${subActiveClass}"${subAriaCurrent} href="${withLang(subPage.page_link)}">
                        ${navLabel(subPage)}
                    </a>
                </li>
            `;
        })
        .join('');

    return `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle${activeClass}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${navLabel(page)}
            </a>
            <ul class="dropdown-menu">
                ${dropdownItems}
            </ul>
        </li>
    `;
}

/**
 * Creates the language switcher dropdown HTML (same design as the theme switcher,
 * with the flag of each language)
 * @returns {string} HTML string for the language switcher
 */
function createLanguageSwitcher() {
    const current = LANGUAGES.find(language => language.code === CURRENT_LANG);
    const items = LANGUAGES.map(language => `
                <li>
                    <button type="button" class="dropdown-item d-flex align-items-center${language.code === CURRENT_LANG ? ' active' : ''}" data-lang-value="${language.code}"${language.code === CURRENT_LANG ? ' aria-current="true"' : ''}>
                        <span class="flag flag-${language.flag} me-2" aria-hidden="true"></span>
                        ${language.label}
                    </button>
                </li>`).join('');

    return `
        <li class="nav-item dropdown">
            <!-- Language toggle button with the flag of the current language -->
            <button class="btn btn-link nav-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center" id="bd-lang" type="button" aria-expanded="false" data-bs-toggle="dropdown" data-bs-display="static" aria-label="${t('language.toggle')}" title="${t('language.toggle')}">
                <span class="nav-icon"><span class="flag flag-${current.flag}" aria-hidden="true"></span></span>
                <span class="d-lg-none ms-2">${current.label}</span>
            </button>

            <ul class="dropdown-menu dropdown-menu-end">${items}
            </ul>
        </li>
    `;
}

/**
 * Makes the language dropdown items switch the page language
 */
function initializeLanguageSwitcher() {
    document.querySelectorAll('[data-lang-value]').forEach(button => {
        button.addEventListener('click', () => {
            const code = button.getAttribute('data-lang-value');
            if (code !== CURRENT_LANG) setLanguage(code);
        });
    });
}

/**
 * Creates the theme switcher dropdown HTML
 * @returns {string} HTML string for the theme switcher
 */
function createThemeSwitcher() {
    return `
        <li class="nav-item dropdown">
            <!-- Theme toggle button with current theme icon -->
            <button class="btn btn-link nav-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center" id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown" data-bs-display="static">
                <span class="theme-icon-active nav-icon">
                    <i class="bi bi-circle-half"></i>
                </span>
                <span class="d-lg-none ms-2" id="bd-theme-text">${t('theme.toggle')}</span>
            </button>

            <!-- Theme selection dropdown menu -->
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="bd-theme-text">
                <li>
                    <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="light">
                        <i class="bi bi-sun-fill me-2"></i>
                        ${t('theme.light')}
                    </button>
                </li>
                <li>
                    <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="dark">
                        <i class="bi bi-moon-stars-fill me-2"></i>
                        ${t('theme.dark')}
                    </button>
                </li>
                <li>
                    <button type="button" class="dropdown-item d-flex align-items-center active" data-bs-theme-value="auto">
                        <i class="bi bi-circle-half me-2"></i>
                        ${t('theme.auto')}
                    </button>
                </li>
            </ul>
        </li>
    `;
}

/**
 * Generates and displays the navigation menu dynamically from pages.json
 * Sets the active state based on the current page
 */
async function initializeNavbar() {
    try {
        // Fetch pages data
        const pagesData = await fetch_json_file('json-files/pages.json');

        // Get current page to determine active state
        const currentPage = getCurrentPage();

        // Generate navigation links (handle both regular links and dropdowns)
        const navLinks = pagesData.pages
            .map(page => {
                if (page.dropdown && page.sub_pages) {
                    // Create dropdown menu for pages with sub_pages
                    return createNavDropdown(page, currentPage);
                } else {
                    // Create regular navigation link
                    return createNavLink(page, page.page_link === currentPage);
                }
            })
            .join('');

        // Insert navigation links into the navbar
        const navContainer = document.getElementById('dynamic-nav-links');
        if (navContainer) {
            navContainer.innerHTML = navLinks;
        }

        // Insert theme switcher into the navbar
        const themeContainer = document.getElementById('dynamic-theme-switcher');
        if (themeContainer) {
            themeContainer.innerHTML = createLanguageSwitcher() + createThemeSwitcher();
            initializeLanguageSwitcher();
            // Initialize theme switcher after HTML is inserted
            initializeThemeSwitcher();
        }
    } catch (error) {
        console.error('Error initializing navbar:', error);
        // Fallback: Keep static navbar if dynamic loading fails
    }
}

// Initialize navbar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    initializeNavbar();
});

/* ========================================
   Theme Switcher Functions
   ======================================== */

/**
 * Retrieves the stored theme preference from localStorage
 * @returns {string|null} The stored theme value or null if not set
 */
const getStoredTheme = () => localStorage.getItem('theme');

/**
 * Saves the theme preference to localStorage
 * @param {string} theme - The theme value to store (light, dark, or auto)
 */
const setStoredTheme = theme => localStorage.setItem('theme', theme);

/**
 * Determines the preferred theme based on stored preference or system settings
 * @returns {string} The preferred theme (light, dark, or auto)
 */
const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
        return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Applies the selected theme to the document
 * @param {string} theme - The theme to apply (light, dark, or auto)
 */
const setTheme = theme => {
    if (theme === 'auto') {
        document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    } else {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }
};

/**
 * Updates the UI to show which theme is currently active
 * @param {string} theme - The active theme (light, dark, or auto)
 * @param {boolean} focus - Whether to focus the theme switcher button (default: false)
 */
const showActiveTheme = (theme, focus = false) => {
    const themeSwitcher = document.querySelector('#bd-theme');

    if (!themeSwitcher) {
        return;
    }

    const activeThemeIcon = document.querySelector('.theme-icon-active i');
    const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`);

    if (!btnToActive) {
        return;
    }

    // Remove active class from all theme buttons
    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
        element.classList.remove('active');
    });

    // Add active class to the selected theme button
    btnToActive.classList.add('active');

    // Update the icon in the navbar to match the selected theme
    const icon = btnToActive.querySelector('i').className;
    activeThemeIcon.className = icon;

    if (focus) {
        themeSwitcher.focus();
    }
};

/**
 * Initializes the theme switcher by setting up event listeners
 * Called after the theme switcher HTML is dynamically inserted
 */
function initializeThemeSwitcher() {
    showActiveTheme(getPreferredTheme());

    // Add click event listeners to all theme toggle buttons
    document.querySelectorAll('[data-bs-theme-value]')
        .forEach(toggle => {
            toggle.addEventListener('click', () => {
                const theme = toggle.getAttribute('data-bs-theme-value');
                setStoredTheme(theme);
                setTheme(theme);
                showActiveTheme(theme, true);
                // Dispatch event for other components to react to theme change
                document.dispatchEvent(new Event('themeChanged'));
            });
        });
}

// Apply the preferred theme on initial load (before DOM is ready)
setTheme(getPreferredTheme());

// Listen for system theme preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme();
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
        setTheme(getPreferredTheme());
        // Dispatch event for other components to react to theme change
        document.dispatchEvent(new Event('themeChanged'));
    }
});
