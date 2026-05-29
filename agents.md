# PlayAmigos Home - Agent Knowledge Base

## Project Overview
PlayAmigos is a curated hub of web applications designed for learning, productivity, and engaging experiences. This repository serves as the central landing page (hub) that links out to various individual applications.

## Technical Stack
- **HTML5**: Semantic markup located in `index.html`.
- **CSS3 (Vanilla)**: Professional, light-themed design system located in `index.css`.
- **Vanilla JavaScript**: Logic for fetching data, rendering UI components, and handling search/filtering, located in `app.js`.
- **JSON**: Configuration and data storage (`site.json`, `apps.json`).

## Architecture & Key Files
- `index.html`: The core structure. Includes the header, search bar, filter container, empty app grid container, and the About modal.
- `index.css`: Defines the clean, light-mode design. Uses sophisticated colors (`#f8fafc` background, `#2563eb` accents), smooth micro-interactions, and a card-based grid layout.
- `app.js`: 
  - Dynamically fetches `site.json` for site-wide configuration (tagline, footer text, social links).
  - Dynamically fetches `apps.json` to render the application cards.
  - Handles client-side searching and category filtering based on the loaded app data.
- `apps.json`: The database of applications. To add a new app, append an object here with `id`, `title`, `description`, `logo`, `url`, and `category`.
- `site.json`: Global site variables. Update this file to change the tagline, footer, or blog URLs without modifying the code.

## Design Philosophy & Constraints
- **Professional & Clean**: The aesthetic should remain light, professional, and minimalist. Do not introduce heavy gradients, dark mode (unless specifically requested to build a toggle), or particle effects.
- **Zero Dependencies**: Keep the codebase lean. Avoid introducing external libraries (like React, Tailwind, or jQuery) unless absolutely necessary and requested by the user. Rely on Vanilla HTML/CSS/JS.
- **Responsive**: Ensure all UI changes look great on mobile devices (e.g., maintain the responsive CSS grid).

## Workflow for AI Agents
When tasked with updating this repository:
1. **Adding an App**: Modify `apps.json` and upload the corresponding logo to the `logos/` directory.
2. **Updating Site Copy**: Modify `site.json` or the static HTML inside the `index.html` About modal.
3. **Styling Changes**: Modify `index.css`, respecting the established CSS variables (`--bg-page`, `--text-primary`, `--accent-primary`, etc.).
4. **Logic Changes**: Modify `app.js` and ensure that the `filterApps()` and `renderCards()` functions continue to work flawlessly.
