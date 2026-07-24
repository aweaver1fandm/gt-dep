# Game Tracker 2.0

Offline-first Progressive Web Application rewrite of the York Devils Game Tracker.

Version 2 is being built in TypeScript for touch-first use on a Windows touchscreen laptop and iPad. The application will be hosted with GitHub Pages and must support complete game tracking without an internet connection.

## Current status

The repository is at the architecture and foundation stage for `2.0.0-alpha1`. The Python/PySide6 Version 1.1.0 application is the behavioral reference implementation.

## Architecture

See [Version 2 Architecture Guide](docs/version-2-architecture.md).

The approved foundation uses:

- React and TypeScript
- Vite
- Zustand
- IndexedDB through Dexie
- Zod validation
- SVG rink rendering
- PWA/Workbox offline support
- Vitest and Playwright
- GitHub Pages deployment

## Core offline requirements

- No internet connection is required during a game.
- Every meaningful game action is saved locally.
- Ending a period automatically creates a recovery snapshot without prompting.
- Saving edits creates a snapshot of the prior game state.
- The newest eight unprotected recovery snapshots are retained globally.
- Completed games are never removed automatically.

## Planned first milestone

`2.0.0-alpha1` will establish the application shell, data schemas, IndexedDB storage, snapshot retention, import/export foundations, offline installation, tests, and GitHub Pages deployment.
