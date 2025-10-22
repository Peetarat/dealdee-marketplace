## Session: 2025-10-22

### Completed Tasks

1.  **Fixed Critical Startup Failures & Corrupted i18n Files:**
    *   **Problem:** The application was crashing on startup due to a misplaced `page.tsx` file in the `/messages` directory and multiple corrupted i18n JSON files.
    *   **Solution:**
        *   Deleted the invalid `/messages/page.tsx`.
        *   Systematically identified and fixed JSON syntax errors (duplicate keys, stray characters) in `en.json`, `hi.json`, `ja.json`, and `th.json`.
        *   Re-created missing `Cart` and `Products` sections in `ko.json` and `zh.json`.

2.  **Refactored Product Page Headers:**
    *   **Action:** Standardized and improved the UI for section headers on the main product page.
    *   **Details:**
        *   Made "Promoted Items" and "All Latest Items" titles the same size (`h4`).
        *   Added responsive font sizes to headers and "View All" buttons to ensure they look good on mobile.
        *   Changed button text casing from `UPPERCASE` to `Title Case` (e.g., "View All") for a cleaner, more modern aesthetic by setting `textTransform: 'none'`.

3.  **Major Profile Menu Refactoring (Mobile & Desktop):**
    *   **Problem:** A long, flat list of menu items in the profile section was bad for UX, especially on mobile.
    *   **Solution (Mobile):** Replaced the long list in the mobile drawer with a grouped, collapsible **Accordion** menu for "Account Management" and "My Activity".
    *   **Solution (Desktop):** Replaced the flat dropdown menu with a grouped layout using non-clickable headers to provide a clear visual hierarchy.
    *   **UI Polish:** Added unique, descriptive icons for all menu groups and sub-items, and ensured they are theme-aware (correct colors in Light/Dark mode).

4.  **Complete Overhaul of "Add Product" Page:**
    *   **Action:** Transformed the basic form into a professional, multi-section UI for creating new products.
    *   **UI Features:**
        *   Created distinct `Paper` sections for Media, Details, and Pricing/Location.
        *   Implemented a `react-dropzone` component for drag-and-drop uploads for both a single Cover Media and multiple Additional Media files, including file previews.
        *   Added all necessary form fields, including `Condition` (as a Radio Group) and `Location`.
        *   Implemented a cascading/two-step category selector for a better UX.
        *   Added file upload limits (10 images, 1 video) to the dropzone logic.
    *   **Backend Logic:**
        *   Implemented the complete `handleSubmit` function.
        *   The logic uploads all files to Firebase Storage and, upon success, creates a new product document in Firestore with `isPublished: false` (saving as a draft).

5.  **Git Repository Cleanup:**
    *   **Problem:** `git push` was failing due to large cache files in the `.next` directory exceeding GitHub's file size limit.
    *   **Solution:**
        *   Added the `.next/` directory to the `.gitignore` file.
        *   Used `git rm -r --cached .next` to remove the tracked cache files from the Git index.
        *   Committed the fix, allowing the user to successfully push all our work to GitHub.

### Outstanding Issues & Next Steps

*   **CRITICAL DEPLOYMENT BLOCKER:**
    *   **Problem:** All `firebase deploy` attempts are failing due to a combination of errors that point to a fundamental issue with the Google Cloud project environment, not the code itself.
        *   `secret overlap` error (persists despite code fixes, indicating a severe caching issue).
        *   `Quota exceeded` error (persists despite the user being on a paid plan and having 0% usage, indicating a misleading error message).
        *   `Service Identity` generation errors (indicates a project-level permission/configuration problem).
    *   **Diagnosis:** The root cause is an intractable environment issue (caching, permissions, or billing state) that is beyond the control of the Gemini CLI and its tools.
    *   **FINAL RECOMMENDATION:** The user must **contact Google Cloud Support** to have them investigate the project's configuration from their end. An alternative, more drastic solution is to create a fresh Firebase project and migrate the code.

*   **Future Development Plan (Post-Deployment Fix):**
    *   **Create "My Products" Page:** To view created drafts and add a "Publish" button.
    *   **Create "Other" Category:** The `admin_addCategory` Cloud Function is deployed and ready. It needs to be called (e.g., from a temporary button) to create the category in Firestore.
    *   **Implement "Quick Wins" for Add Product Page:**
        *   [ ] Add a "Tags/Keywords" chip input field.
        *   [ ] Add a separate "Save Draft" button with simpler logic.

---

## Session: 2025-10-21 (Evening)

### Completed Tasks

1.  **Implemented Professional Navigation System:**
    *   **Action:** Overhauled the application's navigation logic in `AppLayout.tsx` to follow modern, "world-class" UX patterns for both mobile and desktop.
    *   **Details:**
        *   **Contextual Back Button:** Implemented a "Back" button in the top app bar for mobile views. This button only appears on "deep" pages (like "My Products"), allowing users to easily navigate back up the hierarchy. It does not appear on top-level "hub" pages (like the main Profile page, Home, Chat, etc.).
        *   **Intelligent App Bars:** Refined the visibility logic for both the top and bottom navigation bars. The bottom bar is now hidden on the landing page, and the top bar's layout adapts intelligently based on whether it's a top-level page or a deep page.
        *   **Corrected "Home" Navigation:** The "Home" icon in the bottom navigation bar now correctly links to the main product feed (`/products/latest`) instead of the landing page, and its active state is highlighted correctly.
        *   **Future-Proof Design:** The logic is designed to be easily maintainable and automatically handle new pages based on their path.

---

## Session: 2025-10-21 (Afternoon)

### Completed Tasks

1.  **Resolved Critical Rendering Bugs:**
    *   **Problem:** The main product page (`/products/latest`) was crashing due to multiple `ReferenceError` issues.
    *   **Investigation:** By adding detailed error logging, we identified the root causes.
    *   **Solution:**
        *   Fixed `ReferenceError: limit is not defined` by importing the `limit` function from `firebase/firestore`.
        *   Fixed `ReferenceError: Divider is not defined` by importing the `Divider` component (and other missing MUI components like `Tooltip`, `Chip`, etc.) from `@mui/material`.

2.  **Fixed and Styled Section Divider:**
    *   **Problem:** A `Divider` between the "Promoted" and "General" product sections was not visible, and the user had specific design requests.
    *   **Investigation:** Determined the `Divider` was rendering but was invisible against the background.
    *   **Solution:**
        *   Styled the `Divider` to be a thick, prominent bar.
        *   Implemented a theme-aware `linear-gradient` background, making it look good in both Light and Dark modes.
        *   Made the `Divider` full-width (edge-to-edge) by restructuring the page's container layout, while keeping the main content centered.

3.  **Fixed Dark Mode UI Bug in Mobile Drawer:**
    *   **Problem:** In dark mode, icons and text in the slide-out mobile navigation menu were black and thus invisible.
    *   **Investigation:** The components were not inheriting the theme's text color.
    *   **Solution:** Applied `sx={{ color: 'inherit' }}` to all `ListItemIcon` components within the drawer to force them to adopt the correct theme color.

### Architectural Notes

*   **Divider Style:** The user wants to adopt the new full-width, theme-aware gradient divider as the standard for separating sections across the application.

---

## Session: 2025-10-21

### Summary & Key Outcomes

*   **Resolved Project Configuration:** Clarified and fixed the local environment to correctly connect to the `dealdee-bf882` Firebase project, which is linked to the `dealdee-version2` GCP project for billing and quotas.
*   **Fixed Deployment Failures:** Systematically debugged and resolved a series of deployment blockers by:
    *   Enabling required Google Cloud APIs (`Cloud Resource Manager`, `Cloud Build`, `Artifact Registry`, `Cloud Billing`).
    *   Creating a necessary `App Engine` instance in the correct region.
    *   Setting required function secrets (`SECRET_ALGOLIA_ID`, `SECRET_ALGOLIA_ADMIN_KEY`).
*   **Optimized Function Region:** Changed the region for all Cloud Functions from `us-central1` to `asia-southeast1` to improve performance for users in Thailand.
*   **Successful Deployment:** Successfully deployed all Cloud Functions to the `dealdee-bf882` project.

### Next Steps / TODO

*   [ ] **Update Dependencies:** The `firebase-functions` package is outdated. Run `npm install --save firebase-functions@latest` in the `functions` directory.
*   [ ] **Align Node.js Version:** The deployment process warned about a Node.js version mismatch (`required: 20`, `current: v22`). Consider updating the `engines` field in `functions/package.json` to match your environment or align your environment with the requirement.
*   [ ] **Monitor Billing:** Keep an eye on the Google Cloud Billing console for the `dealdee-version2` project to ensure the Pay-as-you-go plan is working as expected and to understand usage costs.
*   [ ] **Clean Up Build Images:** The deployment warned about unhandled errors in cleaning up build images. To prevent small potential costs, investigate and manually delete old images at:
    *   `https://console.cloud.google.com/gcr/images/dealdee-bf882/us/gcf`
    *   `https://console.cloud.google.com/gcr/images/dealdee-bf882/undefined/gcf`

---

## Session: 2025-10-20 (Afternoon)

### Completed Tasks

8.  **Complete Product Card Redesign:**
    *   **Action:** Overhauled the `ProductCard` component with a new, modern, icon-driven design.
    *   **Details:**
        *   Implemented a 1:1 aspect ratio for images.
        *   Added UI elements for new data: stock, condition (New/Used tags), location, share count, and like count.
        *   Designed and implemented a multi-level "Verified Badge" system for user avatars, with unique colors and icons for Starter, Pro, Business, Enterprise, and Admin tiers.
        *   Added a "heartbeat" animation to the Like button and a placeholder for sound effects.

9.  **Refactor Marketplace Page Layout:**
    *   **Action:** Restructured the main product page (`/products/latest`) to separate "Promoted" and "General" items.
    *   **Implementation:**
        *   Modified data fetching to use two separate queries for promoted and general products, limited to 42 items each.
        *   Created new Firestore indexes to support these queries.
        *   Added a distinct section with headers ("Promoted Items", "Latest Items") and a custom styled divider.

10. **Implement Special Styling for Promoted Cards:**
    *   **Action:** Made promoted items visually distinct.
    *   **Details:**
        *   Added a "PROMOTED" header bar with a fire icon.
        *   Implemented a pulsing, red "glowing border" effect using `box-shadow` animation.
        *   Changed the "Add to Cart" button and price text to red on promoted cards.

11. **Major Mobile UI/UX Overhaul:**
    *   **Action:** Redesigned the entire mobile navigation experience in `AppLayout.tsx`.
    *   **Top Bar:** Added a hamburger menu icon that opens a `Drawer` for all actions previously hidden on mobile.
    *   **Bottom Bar:** For logged-in users, redesigned the bottom navigation bar into a `BottomAppBar` with a "docked" Floating Action Button (FAB) for the "Sell" action, creating a modern and professional look.
    *   **Bug Fixes:** Resolved numerous bugs related to the new Drawer, including it closing on click, not closing on resize, missing buttons, and untranslated labels.

---

# Project TODO & Log

This file tracks the development progress, architectural decisions, and solutions to problems encountered.

## Session: 2025-10-20

### Completed Tasks

1.  **Profile Dropdown Menu:**
    *   **Action:** Created a new user profile dropdown menu in the main header.
    *   **Files Modified:** `/src/app/components/AppLayout.tsx`.
    *   **Implementation:** Replaced the old MUI `<Menu>` component with a new, consolidated one. Removed old state and handlers for a deprecated seller sub-menu. Created a new placeholder page at `/src/app/account/profile/page.tsx`.

2.  **Fixed Post-Login Redirect:**
    *   **Problem:** Users were redirected to `/products` which was not the desired page. There was confusion about which product page was the correct one.
    *   **Investigation:** Discovered that the target page (`/products/latest`) existed at `src/app/products/latest/page.tsx`, but my initial file search was flawed because `latest` is a directory, not a file.
    *   **Solution:** Changed the `router.push()` destination in `/src/app/login/page.tsx` and `/src/app/signup/page.tsx` to `'/products/latest'`.

3.  **Category Data Migration & Refactoring:**
    *   **Action:** Migrated static category data to Firestore and refactored components to use the new data source.
    *   **Part 1: Migration Script:**
        *   Created a one-time script at `scripts/migrate-categories.ts` to upload data to the `categories` collection.
        *   **Problem 1 (Data Transformation):** The `icon` property was a React component. Solved by storing the icon's `displayName` as a string in Firestore.
        *   **Problem 2 (Permissions):** The script was blocked by Firestore security rules. Solved by using the `firebase-admin` SDK with a service account key to grant admin privileges.
        *   **Problem 3 (Dependencies):** Encountered missing modules (`@opentelemetry/api`). Solved by direct installation.
    *   **Part 2: Component Refactoring:**
        *   **Architecture:** Refactored the code so that the page (`/products/latest`) is responsible for fetching categories and passing the data down to child components.
        *   **IconMap:** Created `src/app/components/IconMap.tsx` to map icon names (strings) from Firestore back to renderable MUI components.
        *   **Components Modified:**
            *   `src/app/products/latest/page.tsx`: Now fetches categories from Firestore and passes them as props.
            *   `src/app/components/CategoryBar.tsx`: Now a presentational component that receives categories via props.

4.  **Consolidate Product Pages:**
    *   **Action:** Simplified the codebase by removing the redundant, Algolia-based `/products` page.
    *   **Files Deleted:** `/src/app/products/page.tsx` and the `/src/app/products/promoted/` directory.
    *   **New Main Page:** `/products/latest` is now the primary product display page.
    *   **Link Verification:** Confirmed that links on the landing page correctly point to `/products/latest`.

5.  **Bugfix: Category Loading Failed:**
    *   **Problem:** The `/products/latest` page showed a "Failed to load categories" error after refactoring.
    *   **Investigation:** The error was caused by Firestore security rules. The client-side application did not have permission to read the `categories` collection.
    *   **Solution:** Updated `firestore.rules` to allow public read access for the `categories` collection (`allow read: if true;`).

6.  **Bugfix: "Not Found" Error on `/products/latest` Page:**
    *   **Problem:** The `/products/latest` page was consistently returning a 404 "Not Found" error, even though the development server process was running.
    *   **Investigation 1 (Build Failure):** Running `npm run build` revealed the true error: `Module not found: Can't resolve '...'`. This confirmed a module resolution failure was preventing the page from being built.
    *   **Root Cause:** Discovered that the import path for `LanguageProvider` was incorrect. For the Next.js App Router, relative imports (`../`) are unreliable. The correct method is to use the absolute path alias `(@/*)` defined in `tsconfig.json`.
_    *   **Solution:** Corrected the import in `src/app/products/latest/page.tsx` to use the absolute path: `import { useLanguage } from '@/app/components/LanguageProvider';`.

7.  **Troubleshooting: Port Conflict with Cloud Shell:**
    *   **Problem:** After fixing the build, the app was still inaccessible at the default port 3000 URL.
    *   **Investigation:** Used the `netstat -tulpn` command to inspect active network ports.
    *   **Root Cause:** Found that the Cloud Shell IDE (`codeoss`) was already occupying port `3000`. The Next.js development server had automatically selected the next available port, `3001`.
    *   **Solution:** Identified that the application was correctly running on port `3001`, allowing access via the correct port-forwarded URL.

### Architectural Notes

*   **Internationalization (i18n):**
    *   The project uses a custom i18n system.
    *   **Provider:** `src/app/components/LanguageProvider.tsx` uses React Context to manage the current language.
    *   **Translations:** JSON files for each language are located in `messages/{locale}.json` (e.g., `messages/en.json`).
    *   **Usage:** The `useLanguage()` hook provides the `t()` translation function and the current `locale`. Components use `t('key')` to display translated strings.

---

## Next Steps

*   [ ] Build out the product display on the `/products/latest` page, separating promoted vs. normal items.