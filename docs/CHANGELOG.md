# Changelog — Recent Fixes

Generated: 2026-04-01

## 2026-04-01 — Frontend runtime & parse fixes

- Fix: `Table.jsx` — guard against non-array data
  - Files: `civiceye-project/src/components/table/Table.jsx`
  - Symptom: `Uncaught TypeError: data.map is not a function` when `data` was not an array.
  - Cause: calling `.map` without verifying response shape.
  - Resolution: added `Array.isArray(data) && data.length > 0` guard and rendered an empty/fallback row when appropriate.

- Fix: `AdminAreas.jsx` — malformed JSX / ternary parser error
  - Files: `civiceye-project/src/pages/admin/AdminAreas.jsx`
  - Symptom: Babel parse error `Unexpected token, expected '}'` during build.
  - Cause: nested/imbalanced ternary and parentheses inside JSX causing parser failure.
  - Resolution: rewrote conditional rendering to a single coherent `{ loading ? ... : Array.isArray(areas) ? ... : ... }` block and added defensive `Array.isArray` checks before `.map`.

- Fix: `LocationInput.jsx` — TDZ / duplicate declaration for `renderMap`
  - Files: `civiceye-project/src/components/common/LocationInput.jsx`
  - Symptom: `ReferenceError: Cannot access 'renderMap' before initialization` and `Identifier 'renderMap' has already been declared`.
  - Cause: `initializeMap` referenced a `const` arrow `renderMap` declared later; there was a duplicate `renderMap` declaration.
  - Resolution: moved single `renderMap` declaration above `initializeMap`, removed duplicate declaration, ensured Leaflet assets are loaded before calling `renderMap`.

## Notes
- These fixes were focused, minimal, and targeted at runtime/build errors; no API or data-model changes were made.
- Suggested next steps: add a lightweight `ErrorBoundary` component in the frontend to catch render-time errors and instrument Sentry/console reporting for production.
