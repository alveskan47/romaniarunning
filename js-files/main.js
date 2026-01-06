// General JavaScript file for all pages

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
            <a class="nav-link${activeClass}"${ariaCurrent} href="${page.page_link}">
                ${page.page_name}
            </a>
        </li>
    `;
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
                <span class="theme-icon-active">
                    <i class="bi bi-circle-half"></i>
                </span>
                <span class="d-lg-none ms-2" id="bd-theme-text">Toggle theme</span>
            </button>

            <!-- Theme selection dropdown menu -->
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="bd-theme-text">
                <li>
                    <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="light">
                        <i class="bi bi-sun-fill me-2"></i>
                        Light
                    </button>
                </li>
                <li>
                    <button type="button" class="dropdown-item d-flex align-items-center" data-bs-theme-value="dark">
                        <i class="bi bi-moon-stars-fill me-2"></i>
                        Dark
                    </button>
                </li>
                <li>
                    <button type="button" class="dropdown-item d-flex align-items-center active" data-bs-theme-value="auto">
                        <i class="bi bi-circle-half me-2"></i>
                        Auto
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

        // Generate navigation links
        const navLinks = pagesData.pages
            .map(page => createNavLink(page, page.page_link === currentPage))
            .join('');

        // Insert navigation links into the navbar
        const navContainer = document.getElementById('dynamic-nav-links');
        if (navContainer) {
            navContainer.innerHTML = navLinks;
        }

        // Insert theme switcher into the navbar
        const themeContainer = document.getElementById('dynamic-theme-switcher');
        if (themeContainer) {
            themeContainer.innerHTML = createThemeSwitcher();
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
