# Dynamic Navigation System Guide

## Overview

The navigation menu is now dynamically generated from `json-files/pages.json`, eliminating the need to manually update navigation links in every HTML file when adding new pages.

## How It Works

### 1. Data Source: pages.json

All navigation pages are defined in a single JSON file:

```json
{
  "pages": [
    {
      "page_name": "Home",
      "page_link": "index.html"
    },
    {
      "page_name": "Park Run",
      "page_link": "park.html"
    }
  ]
}
```

### 2. JavaScript Functions (in main.js)

#### `getCurrentPage()`
- Extracts the current page filename from the browser URL
- Used to determine which navigation link should be marked as active
- Returns `'index.html'` as default if no specific page is found

```javascript
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    return page || 'index.html';
}
```

#### `createNavLink(page, isActive)`
- Creates HTML for a single navigation link
- Automatically adds `active` class and `aria-current` attribute to the current page
- Uses Bootstrap 5 classes for styling

```javascript
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
```

#### `initializeNavbar()`
- Fetches pages data from `json-files/pages.json`
- Generates navigation links using `.map()`
- Inserts generated HTML into the navbar container
- Includes error handling with fallback to static navbar

```javascript
async function initializeNavbar() {
    try {
        const pagesData = await fetch_json_file('json-files/pages.json');
        const currentPage = getCurrentPage();
        const navLinks = pagesData.pages
            .map(page => createNavLink(page, page.page_link === currentPage))
            .join('');
        const navContainer = document.getElementById('dynamic-nav-links');
        if (navContainer) {
            navContainer.innerHTML = navLinks;
        }
    } catch (error) {
        console.error('Error initializing navbar:', error);
    }
}
```

### 3. HTML Structure

Each page has a placeholder container for navigation links:

```html
<ul class="navbar-nav" id="dynamic-nav-links">
    <!-- Navigation links will be inserted here by initializeNavbar() -->
</ul>
```

### 4. Automatic Initialization

The navbar is automatically initialized when the DOM is ready:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    initializeNavbar();
});
```

## Adding a New Page

### Step-by-Step Guide

**1. Update pages.json**

Add your new page to the `pages` array:

```json
{
  "pages": [
    {
      "page_name": "Home",
      "page_link": "index.html"
    },
    {
      "page_name": "Park Run",
      "page_link": "park.html"
    },
    {
      "page_name": "Statistics",
      "page_link": "statistics.html"
    }
  ]
}
```

**2. Create Your HTML File**

Use `index.html` or `park.html` as a template. The important parts:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- ... meta tags, Bootstrap CSS, Bootstrap Icons ... -->
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/statistics.css">
</head>
<body>

<nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="index.html">Calendar App</a>
        <button class="navbar-toggler" ...>
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <!-- Dynamic navbar container -->
            <ul class="navbar-nav" id="dynamic-nav-links">
                <!-- Navigation will be auto-generated -->
            </ul>

            <!-- Theme switcher (copy from existing pages) -->
            <ul class="navbar-nav ms-auto">
                <!-- ... theme switcher code ... -->
            </ul>
        </div>
    </div>
</nav>

<!-- Your page content -->
<div class="container mt-5">
    <h1>Your Page Title</h1>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" ...></script>
<!-- Main JS - includes navbar initialization -->
<script src="scripts/main.js"></script>
<!-- Page-specific JS -->
<script src="scripts/statistics.js"></script>
</body>
</html>
```

**3. Create Page-Specific Files**

Create your CSS and JavaScript files:
- `styles/statistics.css` - Page-specific styles
- `scripts/statistics.js` - Page-specific functionality

**4. Test**

Open any page in your browser. The new navigation link should appear automatically!

## Benefits

### For Developers

1. **Single Source of Truth**: All navigation defined in one JSON file
2. **DRY Principle**: No repeated navigation code across HTML files
3. **Less Error-Prone**: No risk of forgetting to update a page's navigation
4. **Easier Refactoring**: Change navigation structure in one place
5. **Scalable**: Add dozens of pages without touching existing HTML

### For Maintenance

1. **Quick Updates**: Change page names or order by editing JSON only
2. **Consistent Navigation**: All pages automatically have identical menus
3. **Automatic Active State**: Current page always correctly highlighted
4. **Future-Proof**: Easy to extend (e.g., add dropdown menus, icons, etc.)

## Active State Behavior

The system automatically highlights the current page:

- **On index.html**: "Home" link is highlighted
- **On park.html**: "Park Run" link is highlighted
- **On statistics.html**: "Statistics" link is highlighted

No manual configuration needed!

## Error Handling

If `pages.json` fails to load:
- Error is logged to console
- Navbar container remains empty (graceful degradation)
- Page still functions normally
- Can add static fallback links if needed

## Advanced Customization

### Adding Icons to Navigation

Modify `createNavLink()` in `main.js`:

```javascript
function createNavLink(page, isActive) {
    const activeClass = isActive ? ' active' : '';
    const ariaCurrent = isActive ? ' aria-current="page"' : '';
    const icon = page.icon ? `<i class="bi bi-${page.icon} me-2"></i>` : '';

    return `
        <li class="nav-item">
            <a class="nav-link${activeClass}"${ariaCurrent} href="${page.page_link}">
                ${icon}${page.page_name}
            </a>
        </li>
    `;
}
```

Then add icons in `pages.json`:

```json
{
  "pages": [
    {
      "page_name": "Home",
      "page_link": "index.html",
      "icon": "house-fill"
    },
    {
      "page_name": "Park Run",
      "page_link": "park.html",
      "icon": "tree-fill"
    }
  ]
}
```

### Adding Dropdown Menus

Extend `pages.json` structure:

```json
{
  "pages": [
    {
      "page_name": "Statistics",
      "page_link": "#",
      "dropdown": [
        { "page_name": "2025", "page_link": "statistics-2025.html" },
        { "page_name": "2024", "page_link": "statistics-2024.html" }
      ]
    }
  ]
}
```

Update `createNavLink()` to handle dropdown structure.

## Best Practices

1. **Always use relative paths** in `page_link`
2. **Keep page_name short** for mobile responsiveness
3. **Order pages logically** in the JSON array (most important first)
4. **Test on all pages** after adding new navigation items
5. **Maintain alphabetical order** for easier management (optional)

## Troubleshooting

### Navigation not appearing?

1. Check browser console for errors
2. Verify `json-files/pages.json` is valid JSON (use JSON validator)
3. Ensure `id="dynamic-nav-links"` exists in HTML
4. Confirm `scripts/main.js` is loaded before page-specific scripts
5. Check network tab to ensure JSON file is loading

### Active state not working?

1. Verify `page_link` in JSON matches actual filename exactly
2. Check browser URL to see what `getCurrentPage()` returns
3. Ensure you're accessing page with correct filename (e.g., not just `/`)

### JSON not loading?

1. Check file path is correct: `json-files/pages.json`
2. Ensure server/browser allows fetching JSON files
3. Try opening JSON file directly in browser to verify it's accessible
4. Check for CORS issues if running from `file://` protocol

## Technical Notes

- Functions are in `main.js` because they're used across all pages
- Uses modern ES6+ features (async/await, template literals, arrow functions)
- Follows functional programming principles (map, pure functions)
- Includes comprehensive JSDoc comments
- Error handling ensures graceful degradation
- Accessible with proper ARIA attributes

## Future Enhancements

Possible improvements:
- Add active state animations
- Implement breadcrumb navigation
- Add keyboard navigation shortcuts
- Support for nested/hierarchical menus
- Mobile-optimized navigation
- Search functionality in navbar

---

**Note**: This system is implemented using functions in `main.js` (not `index.js`) because it needs to work across all pages. `main.js` is the general JavaScript file loaded on every page, while `index.js` is specific to the home page only.
