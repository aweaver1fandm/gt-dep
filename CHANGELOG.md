# Changelog

## 2.0.0-alpha4

- Redesigned the live tracker to fit within a fixed landscape viewport without scrolling.
- Moved live game commands into the compact header.
- Added persistent game notes.
- Removed the bottom command/status bars and defended-end labels.
- Removed hard-coded version assertions from Home screen tests.
- Added a unified `npm run verify` release check.

## 2.0.0-alpha3

- Added the first live game tracker screen.
- Added an interactive SVG rink.
- Ported the exact Version 1 Grade A polygon and hit-testing logic.
- Added tap-to-record shots, goal conversion, undo, and end-period persistence.
- Added period shot, Grade A, and goal summaries.
- Hid the redundant visible goalie radio circles while preserving accessible inputs.

## 2.0.0-alpha2

- Added the approved touch-first Game Setup screen.
- Added opponent, game date, regulation period length, and starting goalie entry.
- Added Anthony, Mason, and conditional Other goalie choices.
- Added inline form validation and save-error reporting.
- Added immediate IndexedDB persistence for newly started games.
- Enabled New Game and Continue Game navigation on the home screen.
- Added a temporary saved-game confirmation view pending the Alpha 3 live tracker.
- Added component coverage for validation and game creation.

## 2.0.0-alpha.1a

- Changed deployment to publish compiled `dist/` files from the private source repository into the public `gt-dep` repository.
- Added the `/gt-dep/` production base path required by the GitHub Pages project site.
- Added automatic version, build number, commit SHA, and build-time metadata.
- Added an About section to the home screen.
- Added lint and type-check gates to the production deployment workflow.

## 2.0.0-alpha.1

- Created the React, TypeScript, and Vite PWA foundation.
- Added GitHub Pages deployment and test workflows.
- Added York Devils branding and touch-responsive home screen.
- Added versioned game schemas and normalized rink coordinates.
- Added Dexie/IndexedDB storage.
- Added recovery snapshots, protected snapshots, and global retention cleanup.
- Added automatic period-end and pre-edit snapshot operations.
- Added validated JSON import/export foundations.
- Added initial unit and component tests.
