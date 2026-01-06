# Dynamic Calendar Application

A modern, responsive web application built with Bootstrap 5.3.3 for displaying running events and park activities in Bucharest.

## Project Structure

```
dynamic-calendar/
├── index.html              # Home page
├── park.html              # Bucharest Park Run page
├── scripts/               # JavaScript files
│   ├── main.js           # Global utilities (theme switcher, fetch functions)
│   ├── index.js          # Home page specific code
│   └── park.js           # Park page specific code
├── styles/                # CSS files
│   ├── main.css          # Global styles
│   ├── index.css         # Home page specific styles
│   └── park.css          # Park page specific styles
└── json-files/            # Data files
    ├── parks.json        # Park running activities data
    ├── statistics.json   # Competition statistics
    ├── pages.json        # Navigation pages data
    └── README.md         # JSON data documentation
```

## Features

### Dynamic Navigation
- Navigation menu generated dynamically from `pages.json`
- Automatically highlights the active page
- Easy to add new pages by updating JSON file
- No need to manually update navigation in multiple HTML files

### Theme Switcher
- Light, Dark, and Auto modes
- Persistent theme selection using localStorage
- Automatically follows system preferences in Auto mode
- Theme preference maintained across page navigation

### Responsive Design
- Mobile-first approach using Bootstrap 5.3.3
- Collapsible navigation for mobile devices
- Responsive containers and layouts

### Dynamic Content Loading
- JSON-based data storage
- Asynchronous data fetching
- Dynamic DOM manipulation for content display

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **JavaScript (ES6+)**: Modern JavaScript features including:
  - Async/await for asynchronous operations
  - Arrow functions
  - Template literals
  - Destructuring
  - Modern DOM manipulation
- **Bootstrap 5.3.3**: UI framework
- **Bootstrap Icons 1.11.3**: Icon library

## Code Structure

### JavaScript Architecture

#### main.js (Global Utilities)
- `fetch_json_file(path)`: Fetches and parses JSON files
- **Dynamic Navbar Functions**:
  - `getCurrentPage()`: Gets the current page filename from URL
  - `createNavLink(page, isActive)`: Creates a navigation link element
  - `initializeNavbar()`: Generates navigation menu from pages.json
- **Theme Switcher**: Functionality with localStorage persistence
- Automatic theme application on page load

#### park.js (Park Page)
- `createParkListItem(park)`: Generates HTML for a single park entry
- `update_parks_table(jsonData)`: Renders the complete parks list
- `parks_main()`: Initializes the park page

### CSS Architecture

#### main.css (Global Styles)
- Theme switcher button styles
- Utility classes used across all pages

#### Page-specific CSS
- `index.css`: Home page specific styles
- `park.css`: Park page specific styles

## Best Practices Implemented

### Code Quality
- **JSDoc comments**: All functions documented with parameter types and descriptions
- **Descriptive variable names**: Clear, self-documenting code
- **Single Responsibility Principle**: Functions do one thing well
- **DRY (Don't Repeat Yourself)**: Reusable utility functions

### JavaScript
- **Modern ES6+ syntax**: Arrow functions, template literals, const/let
- **Functional programming**: Use of `.map()` for data transformation
- **Error handling**: Try-catch blocks for async operations
- **Modular code**: Separation of concerns with IIFE for theme switcher

### HTML
- **Semantic markup**: Proper use of HTML5 elements
- **Accessibility**: ARIA labels and roles where needed
- **Comments**: Clear section markers for navigation

### CSS
- **Organized structure**: Logical grouping of related styles
- **Comments**: Detailed explanations for each style rule
- **Maintainability**: Separated global and page-specific styles

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for CDN resources)

### Running the Application

1. Open `index.html` in a web browser
2. Navigate between pages using the navbar
3. Toggle theme using the theme switcher dropdown

### Development

#### Adding a New Page

1. **Add page entry to pages.json**:
   ```json
   {
     "pages": [
       {
         "page_name": "Your Page Name",
         "page_link": "your-page.html"
       }
     ]
   }
   ```
   Note: The navigation menu will be automatically updated on all pages!

2. **Create HTML file** using index.html or park.html as template:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <!-- Copy structure from existing pages -->
   <!-- The navbar will be populated automatically from pages.json -->
   ```

3. **Create page-specific CSS**:
   ```css
   /* styles/your-page.css */
   ```

4. **Create page-specific JavaScript**:
   ```javascript
   // scripts/your-page.js
   ```

5. **Link CSS and JS files** in your HTML file

#### Adding New Data

See `json-files/README.md` for data structure documentation.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- **Lightweight**: Minimal custom code, leveraging Bootstrap
- **CDN delivery**: Fast loading of frameworks
- **Async loading**: Non-blocking JavaScript execution
- **Efficient DOM manipulation**: Using modern methods

## Future Enhancements

- Statistics page using `statistics.json`
- Dynamic navigation generation from `pages.json`
- Search functionality for parks
- Filter and sort options
- Additional data visualizations

## Contributing

When contributing to this project:
1. Follow the established code structure
2. Add JSDoc comments to all functions
3. Test across multiple browsers
4. Validate HTML and CSS
5. Update documentation as needed

## License

This project is part of the Calendar Competitional Romania project.
