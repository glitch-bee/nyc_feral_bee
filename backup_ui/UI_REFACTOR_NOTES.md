# CityHive UI Refactoring Notes & Inventory

This document serves as a guide for refactoring the CityHive application's CSS and related JavaScript. It includes an inventory of all UI components, a breakdown of existing files, key architectural notes, and a recommended plan of action for a successful UI overhaul.

## 1. Guiding Principles & Project Goals (from Docs)

A review of `project_notes.md`, `README.md`, and `CONTRIBUTING.md` reveals a clear vision for the application that must be respected during any refactor:

-   **Production-Ready & Mobile-First:** The application is considered a complete, functional product. All UI changes must maintain this high standard and be optimized for mobile and touch-screen field use.
-   **Clear Separation of Concerns:** The JavaScript is intentionally modular (`map.js` for map, `supabase.js` for data, etc.). The CSS architecture **must be refactored to mirror this separation**.
-   **Branding is Specific:** The display name is "City Hive" (not CityHive2) and the partner organization is "New York Bee Club".
-   **Community & Collaboration:** Features like comments, status updates, and user ownership are central to the app's purpose. The UI must make these features intuitive.

## 2. Lessons Learned & Key Challenges

Our previous attempt to integrate a neumorphic design highlighted several core issues with the current CSS architecture:

-   **Style Conflicts:** Multiple stylesheets define styles for the same elements (e.g., navigation styles exist in both `style.css` and `pages.css`), leading to unpredictable rendering and difficulty in making changes.
-   **Lack of a Single Source of Truth:** There is no centralized design system or variable sheet. Colors, fonts, and spacing are defined in multiple places, making global style changes tedious and error-prone. The persistent green navigation bar was a key symptom of this.
-   **Overlapping Responsibilities:** `style.css` is a "catch-all" file containing everything from global resets to component styles for the form, popups, and welcome modal. This directly contradicts the project's stated goal of "clean separation of concerns."
-   **Inconsistent Methodologies:** The project uses a mix of standard CSS, BEM-like naming, and hardcoded values without a clear, enforced system.

## 3. Architectural & Functional Insights

Beyond CSS, the JavaScript and file structure reveal important logic that must be preserved during a refactor.

-   **Duplicated Navigation Styles are Intentional (but flawed):** As noted in `pages.css`, the navigation styles were deliberately duplicated to allow the static `about.html` and `resources.html` pages to render correctly without loading the entire main app's CSS. The *correct* fix is to have these pages load a single, shared `ui-theme.css` and remove the duplicated rules from `pages.css`.

-   **The Marker Form is Two Components in One:**
    -   **Desktop:** A fixed-position panel on the right side of the screen.
    -   **Mobile:** A slide-up "drawer" from the bottom.
    -   `markerform.js` contains the logic for this switch, including auto-expanding the drawer when the user selects a location on the map (`handleMapClick`) or uses "Locate Me" (`locateUser`). This responsive behavior is critical functionality.

-   **Map Popups vs. Mobile Info Panel:**
    -   The app uses two different methods for displaying marker details.
    -   **`createPopupContent()`** in `map.js` generates the HTML for the rich popups seen on desktop.
    -   **`showMobileMarkerInfo()`** in `map.js` re-uses that same HTML but injects it into a separate, full-screen overlay for a better mobile experience. A refactor must account for styling both the standard `maplibre-popup` and the custom `#mobile-marker-info` container.

-   **Global Event Handlers:** `map.js` attaches several functions directly to the `window` object (e.g., `window.deleteMarker`). This is done so that the dynamically created HTML for popups can use `onclick="window.deleteMarker(...)"`. While not ideal, it's a key structural point to be aware of. A future refactor might replace these with event listeners attached when the popup is created.

## 4. Recommended Refactoring Plan

This plan is designed to align the CSS with the project's existing modular philosophy.

1.  **Establish a Design System (`ui-theme.css`):**
    *   Create a new, single CSS file, `src/ui-theme.css`, that will become the foundation of the entire UI.
    *   **CSS Variables:** Populate this file with a comprehensive set of CSS Custom Properties for all colors, fonts, spacing, etc. This will be the UI's central control panel.
    *   **Base & Reset:** Include a CSS reset and base styles for `html`, `body`, etc.

2.  **Load the New Theme Everywhere:**
    *   In `index.html`, `about.html`, and `resources.html`, add `<link rel="stylesheet" href="/src/ui-theme.css">`.

3.  **Refactor Component by Component (Isolate, Conquer, Delete):**

    **IMPORTANT NOTE:** This step involves deleting **CSS rules *within* files**, not deleting the `.css` files themselves. All existing `.html`, `.css`, and `.js` files will be kept; only their *content* will be edited and moved.

    *   Tackle one UI component at a time, following the modular structure of the JavaScript.
    *   **Priority 1: Navigation.** Create a `/* --- Navigation --- */` section in `ui-theme.css` and write the new styles there. Then, delete the navigation rules from **both** `style.css` and `pages.css`.
    *   **Priority 2: Marker Form.** Create a `/* --- Marker Form --- */` section in `ui-theme.css`. Add styles for both the desktop panel and the mobile drawer. Delete the corresponding rules from `style.css`.
    *   **Continue for all components:** Map Popups, Auth Modal, Welcome Modal, etc., giving each its own clear section in the theme file and removing the old code from the legacy files.

4.  **Update JavaScript & HTML:**
    *   As components are refactored, update the corresponding JS files (`navigation.js`, `markerform.js`) to use cleaner, more consistent class names that align with the new theme file.

## 5. CSS & UI Component Inventory

-   **Navigation Bar:**
    -   **JS:** `src/navigation.js`
    -   **CSS:** Duplicated in `src/style.css` and `src/pages.css`. **This is the #1 priority to fix.**

-   **Marker Form (Desktop Panel & Mobile Drawer):**
    -   **JS:** `src/markerform.js`
    -   **CSS:** `src/style.css`

-   **Map Marker Popups & Mobile Info Panel:**
    -   **JS:** `src/map.js`
    -   **CSS:** `src/style.css`

-   **Authentication Modal:**
    -   **JS:** `src/auth.js`
    -   **CSS:** `src/auth.css`

-   **Welcome Modal:**
    -   **JS:** `src/welcome.js`
    -   **CSS:** `src/style.css`

-   **Static Page Content (About/Resources):**
    -   **HTML:** `about.html`, `resources.html`
    -   **CSS:** `src/pages.css`