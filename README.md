# York Devils Game Tracker 2.0

Offline-first Progressive Web Application rewrite of the York Devils Game Tracker.

## Current release

`2.0.0-alpha4` focuses on a compact, no-scroll live game interface:

- Fixed landscape live-tracker viewport
- Compact header with logo, matchup, period, clock, score, and game controls
- Goal, Penalty, Faceoff, Goalie, Note, Undo, and End Period controls in the header
- Persistent game-note dialog
- Removed bottom command/status bars and defended-end labels
- Tap-on-rink shot recording and Grade A classification retained
- Automatic build/version metadata
- Unified release verification with `npm run verify`

See [Alpha 4 notes](docs/alpha-4.md).

## Development on Windows

Requirements: Node.js 22 or newer and npm.

```powershell
npm install
npm run dev
```

Open the local URL shown by Vite. Test touch controls directly on the touchscreen laptop and use browser developer tools for responsive/offline simulation.

## Verification

Run the same checks used by GitHub Actions:

```powershell
npm run verify
```

This runs linting, TypeScript checking, unit/component tests, and the production build.

## GitHub Pages deployment

The application source stays in the private repository. The `Build and publish PWA` workflow:

1. Installs dependencies and runs `npm run verify`.
2. Builds the PWA with the production base path `/gt-dep/`.
3. Checks out the public `gt-dep` repository using the `GT_DEP_TOKEN` Actions secret.
4. Replaces the public repository contents with the generated `dist/` files.
5. Commits and pushes the deployment to `gt-dep/main`.

Configure the public `gt-dep` repository under **Settings → Pages** to deploy from the `main` branch and `/ (root)`. The published address will normally be `https://<account>.github.io/gt-dep/`.

The fine-grained token stored as `GT_DEP_TOKEN` needs access only to `gt-dep`, with **Contents: Read and write** and the required **Metadata: Read-only** permission.

## Automatic version information

The displayed version comes from `package.json`. During GitHub Actions builds, Vite also injects the workflow build number, seven-character commit SHA, and UTC build time. Local development builds show `local` and `development` where GitHub metadata is unavailable.

Tests use the shared `buildInfo.version` value instead of hard-coded release strings.

## Architecture

See [Version 2 Architecture Guide](docs/version-2-architecture.md).

## Offline and recovery rules

- Internet access is not required during games.
- Every game command persists locally before reporting success.
- Ending a period creates a snapshot automatically without prompting.
- Saving game edits creates a snapshot of the prior game state.
- The newest eight unprotected snapshots are retained globally.
- Protected snapshots are retained until explicitly unprotected or deleted.
- Completed games are never deleted automatically.
