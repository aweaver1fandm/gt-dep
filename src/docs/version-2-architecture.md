# Game Tracker Version 2 Architecture Guide

**Status:** Approved foundation for `2.0.0-alpha1`  
**Target platform:** Offline-first Progressive Web Application (PWA)  
**Primary development platform:** Windows touchscreen laptop  
**Primary field platform:** iPad in landscape orientation  
**Hosting:** GitHub Pages  
**Reference implementation:** Python/PySide6 desktop release 1.1.0

## 1. Purpose

Version 2 is a full web/PWA rewrite of the York Devils Game Tracker. The existing Python application remains the behavioral reference for game rules, calculations, reports, and workflows. Version 2 is not a direct source-code port. It is a new TypeScript implementation that preserves verified behavior while replacing the desktop UI and SQLite persistence with a touch-first browser application and IndexedDB.

The application must remain fully usable during a game with no network connection. Internet access is required only to install the PWA initially, receive later releases, or use optional future synchronization features.

## 2. Architectural principles

1. **Offline is the normal game condition.** All tracking, editing, summaries, backups, and report generation must work locally.
2. **The desktop release is the specification.** Existing behavior is reproduced deliberately and verified with shared fixtures.
3. **Game rules do not live in UI components.** Components call domain commands and render derived state.
4. **Every meaningful change is durable.** A completed command is saved to IndexedDB before the UI reports success.
5. **Primary records and recovery snapshots are separate.** Completed games remain until manually deleted; old snapshots are pruned automatically.
6. **Coordinates are normalized.** Rink positions are stored from `0.0` to `1.0`, independent of display size.
7. **Persistent entities use UUIDs.** IDs remain stable across sorting, editing, export, and import.
8. **Schema changes are explicit and versioned.** Imported and stored data is validated before use.
9. **Touch is the default interaction model.** Mouse and keyboard remain supported, but no core workflow depends on hover or right-click.
10. **GitHub Pages hosts only static application assets.** Version 2 has no required backend.

## 3. Recommended technology stack

- **Language:** TypeScript with strict compiler settings
- **UI:** React
- **Build system:** Vite
- **Routing:** React Router
- **Client state:** Zustand
- **Persistent storage:** IndexedDB through Dexie
- **Runtime validation:** Zod
- **Rink rendering:** SVG
- **PWA support:** `vite-plugin-pwa` and Workbox
- **Unit tests:** Vitest
- **Component tests:** React Testing Library
- **End-to-end tests:** Playwright
- **Formatting and linting:** Prettier and ESLint
- **Package manager:** npm

Libraries should be introduced only when they solve a clear need. Domain calculations should remain plain TypeScript wherever practical.

## 4. Repository structure

```text
shot-tracker2-0/
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── deploy-pages.yml
├── docs/
│   ├── version-2-architecture.md
│   ├── game-rules.md
│   ├── data-schema.md
│   └── migration-notes.md
├── public/
│   ├── icons/
│   └── assets/
├── src/
│   ├── app/
│   ├── components/
│   ├── domain/
│   ├── features/
│   ├── storage/
│   ├── pwa/
│   ├── reports/
│   ├── styles/
│   ├── test/
│   └── main.tsx
├── shared/
│   ├── fixtures/
│   └── schemas/
├── tools/
│   └── migration/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Feature code should be grouped by hockey capability rather than by page alone:

```text
src/features/
├── games/
├── shots/
├── goals/
├── faceoffs/
├── penalties/
├── goalies/
├── editing/
├── summaries/
└── recovery/
```

Each feature may contain components, selectors, commands, tests, and supporting types. Shared rules belong in `src/domain`, not inside a feature component.

## 5. Application layers

### 5.1 Presentation layer

React components render screens, dialogs, bottom sheets, status cards, and the rink. Components may hold short-lived display state such as whether a dialog is open, but they must not directly mutate persistent game objects.

### 5.2 Application command layer

All game-changing operations are exposed as commands, for example:

```ts
recordShot()
convertLastShotToGoal()
recordFaceoff()
assessPenalty()
switchGoalie()
endPeriod()
endGame()
saveGameEdits()
undoLastAction()
```

Each command is responsible for validation, domain updates, persistence, and history recording. The UI calls commands and responds to success or failure.

### 5.3 Domain layer

The domain layer defines entities, enums, validation rules, calculations, and selectors. It contains no React, browser DOM, or IndexedDB code.

Examples include:

- Grade A geometry
- attacking and defending direction
- score and shot totals
- power-play and penalty-kill calculations
- active and queued penalty segments
- goalie time calculations
- scoring summaries
- faceoff totals by zone
- period and overtime rules

### 5.4 Persistence layer

The persistence layer stores and retrieves validated records using Dexie. It owns IndexedDB transactions, indexes, snapshot retention, import/export, and schema migrations.

### 5.5 Reporting layer

The reporting layer converts stored game records into postgame views and downloadable PDFs. Browser-side PDF generation must not require an internet connection.

## 6. Core data model

Version 1 stores related records in SQLite tables. Version 2 retains the same conceptual entities but uses UUIDs, explicit timestamps, and schema versions.

### 6.1 Game

```ts
interface Game {
  id: string;
  schemaVersion: 2;
  createdAt: string;
  updatedAt: string;
  gameDate: string;
  opponentName: string;
  location?: string;
  status: "active" | "completed";
  currentPeriod: 1 | 2 | 3 | 4;
  periodActive: boolean;
  periodLengthSeconds: number;
  yorkDefendsFirst: "left" | "right";
  notes: string;
  initialGoalieName: string;
}
```

Period `4` represents overtime in persisted data. Display code should present it as `OT`.

### 6.2 Shot event

Version 1 uses a shot record whose result is either Shot or Goal. Version 2 keeps that proven model so converting the last shot to a goal remains simple.

```ts
interface ShotEvent {
  id: string;
  gameId: string;
  createdAt: string;
  updatedAt: string;
  period: 1 | 2 | 3 | 4;
  team: "york" | "opponent";
  result: "shot" | "goal";
  x: number;
  y: number;
  isGradeA: boolean;
  yorkDefending: "left" | "right";
  targetZone?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  goalieStintId?: string;
  goalSituation?: "5v5" | "powerPlay" | "shortHanded";
  goalEmptyNet: boolean;
}
```

`x` and `y` must be within `0.0` and `1.0`. Grade A is derived from geometry when a shot is recorded or moved. It is persisted to preserve the historical result and simplify reports, but editing a location recalculates it.

Empty net remains an independent goal designation rather than a mutually exclusive goal situation.

### 6.3 Goalie stint

```ts
interface GoalieStint {
  id: string;
  gameId: string;
  occupantName?: string;
  isEmptyNet: boolean;
  startPeriod: 1 | 2 | 3 | 4;
  startClockSeconds: number;
  endPeriod?: 1 | 2 | 3 | 4;
  endClockSeconds?: number;
}
```

Only one stint may be open at a time. Switching goalies closes the current stint and opens a new one at the same game clock value.

### 6.4 Faceoff event

```ts
interface FaceoffEvent {
  id: string;
  gameId: string;
  createdAt: string;
  period: 1 | 2 | 3 | 4;
  winner: "york" | "opponent";
  zone: "offensive" | "neutral" | "defensive";
}
```

The zone is always recorded from York's perspective, matching the established desktop behavior.

### 6.5 Penalty event and segments

The desktop application separates a penalty assessment from its manpower segments. Version 2 preserves that distinction.

```ts
interface PenaltyEvent {
  id: string;
  gameId: string;
  createdAt: string;
  period: 1 | 2 | 3 | 4;
  team: "york" | "opponent";
  penaltyType:
    | "minor"
    | "doubleMinor"
    | "major"
    | "minorMisconduct"
    | "misconduct";
  assessmentCount: number;
  penaltyMinutes: number;
  coincidental: boolean;
  createsPowerPlay: boolean;
}

interface PenaltySegment {
  id: string;
  penaltyEventId: string;
  gameId: string;
  team: "york" | "opponent";
  sequence: number;
  durationSeconds: number;
  status: "active" | "queued" | "ended";
  startedAtGameClock?: GameClock;
  endedAtGameClock?: GameClock;
}
```

Penalties that count toward totals but do not create a power play are represented by `createsPowerPlay: false`. Coincidental penalties may also avoid a manpower advantage according to the domain rules.

### 6.6 Game clock

```ts
interface GameClock {
  period: 1 | 2 | 3 | 4;
  remainingSeconds: number;
}
```

Seconds must be between zero and the configured period length. UI formatting converts the value to `MM:SS`.

## 7. IndexedDB design

The initial Dexie database should contain these stores:

```text
games
shotEvents
faceoffEvents
penaltyEvents
penaltySegments
goalieStints
actions
snapshots
settings
```

Recommended indexes:

```ts
games: "id, status, gameDate, updatedAt"
shotEvents: "id, gameId, [gameId+period], createdAt"
faceoffEvents: "id, gameId, [gameId+period], createdAt"
penaltyEvents: "id, gameId, [gameId+period], createdAt"
penaltySegments: "id, gameId, penaltyEventId, status"
goalieStints: "id, gameId, startPeriod"
actions: "id, gameId, sequence, createdAt"
snapshots: "id, gameId, createdAt, protected"
settings: "key"
```

Records should be normalized in IndexedDB rather than storing the entire application as one large object. A repository function may assemble a complete `GameBundle` for editing, reporting, export, and snapshot creation.

```ts
interface GameBundle {
  game: Game;
  shots: ShotEvent[];
  faceoffs: FaceoffEvent[];
  penalties: PenaltyEvent[];
  penaltySegments: PenaltySegment[];
  goalieStints: GoalieStint[];
}
```

## 8. Autosave and transaction rules

Every successful persistent command must complete in a single IndexedDB transaction whenever it affects multiple stores.

Examples:

- Converting a shot to a goal updates the shot record and action history together.
- Switching goalies closes one stint and creates the next in one transaction.
- Deleting a penalty removes its segments and updates derived penalty state atomically.
- Ending a period updates the game, creates a snapshot, and records an action atomically.

The UI must not display a successful completion message until the transaction resolves.

## 9. Recovery snapshots

### 9.1 Snapshot triggers

An internal recovery snapshot is created automatically:

- when the user ends a period;
- immediately before the game is finalized;
- immediately before saved edits replace active or completed game data;
- before an import overwrites an existing game;
- before a database migration changes stored game data.

No prompt is shown when an end-period snapshot is created.

Normal live actions are persisted immediately but do not each create a full snapshot.

### 9.2 Snapshot content

```ts
interface RecoverySnapshot {
  id: string;
  gameId: string;
  createdAt: string;
  reason:
    | "endPeriod"
    | "beforeEndGame"
    | "beforeGameEdit"
    | "beforeImport"
    | "beforeMigration";
  period?: 1 | 2 | 3 | 4;
  protected: boolean;
  bundle: GameBundle;
}
```

Snapshots are self-contained and validated before restoration.

### 9.3 Retention policy

- Keep the newest **eight unprotected snapshots globally** by default.
- The setting may later allow 6, 8, 10, 15, or 20.
- Protected snapshots do not count toward the limit.
- Completed games are never removed by snapshot cleanup.
- The snapshot created by the current transaction must never be pruned during that transaction.
- Deleting a game should delete its associated unprotected snapshots after confirmation.

### 9.4 Restoring

The recovery screen should support:

- preview snapshot metadata;
- restore over the associated game;
- restore as a copy with new UUIDs where required;
- protect or unprotect;
- manual deletion.

Restoring over an existing game should first create a `beforeGameEdit` or equivalent safety snapshot.

## 10. Action history and undo

Version 1 has a `game_actions` table. Version 2 formalizes this as command history.

```ts
interface GameAction {
  id: string;
  gameId: string;
  sequence: number;
  createdAt: string;
  type: string;
  entityId?: string;
  payload?: unknown;
  inverse?: unknown;
}
```

The first implementation only needs reliable undo for the most recent supported live action. The schema should allow broader undo/redo later without forcing an event-sourced architecture.

Snapshots and actions serve different purposes:

- actions support immediate correction and audit history;
- snapshots support recovery from larger edits, imports, migrations, or damaged state.

## 11. State management

Zustand should hold the active game bundle, derived status, and transient command state. IndexedDB remains the source of truth.

Suggested stores:

- `useAppStore`: initialization, selected game, navigation, readiness
- `useActiveGameStore`: active `GameBundle`, last command, save status
- `useUiStore`: dialogs, panels, edit mode, notifications

Do not mirror every database record indefinitely in global state. Load the active game into memory, persist commands immediately, and query completed games through repositories.

Derived values should be selectors or pure domain functions, not duplicated fields:

- score
- shots on goal
- Grade A totals
- faceoff totals
- PP% and PK%
- scoring situation totals
- goalie statistics

## 12. Rink and coordinate system

The rink is an SVG with a fixed `viewBox`. Pointer coordinates are transformed into normalized rink coordinates.

```ts
normalizedX = (pointerX - bounds.left) / bounds.width
normalizedY = (pointerY - bounds.top) / bounds.height
```

Values are clamped to `[0, 1]`.

SVG is preferred because each marker remains an independent selectable element. It supports scaling, drag editing, labels, PDF reuse, and accessible interaction better than a single bitmap canvas for this workload.

The established Grade A polygon from `rink.py` must be ported as a pure TypeScript function and tested against the Python fixtures.

## 13. Touch interaction standards

The primary field layout is landscape. Core controls must remain usable on the Windows touchscreen and iPad without hover.

- Minimum primary control target: approximately 44 CSS pixels.
- Frequently used controls must not be adjacent without adequate separation.
- Live tracking uses explicit modes rather than relying on double-click.
- Marker editing uses selection plus a bottom sheet or side panel.
- Dragging is implemented with Pointer Events so touch, pen, and mouse share one path.
- Destructive actions require confirmation or an obvious undo path.
- The application must prevent browser scrolling while the user is intentionally dragging on the rink.

The Windows touchscreen is the main early test device. Real iPad testing remains required before final release for Safari, home-screen installation, keyboard behavior, file sharing, suspension, and storage persistence.

## 14. PWA and offline behavior

The service worker precaches the complete application shell:

- HTML
- JavaScript
- CSS
- icons
- logo
- rink assets
- locally bundled fonts and libraries

Game data is never stored in the service-worker cache. It remains in IndexedDB.

Runtime policy:

```text
Application assets: cache first
Navigation: cached application shell with network update when available
Game data: IndexedDB only
Optional future sync: network when available, never required
```

The application should show local save status but does not need special active-game update blocking. An already open application continues running its loaded code; later launches receive the deployed version according to normal service-worker behavior.

## 15. GitHub Pages deployment

The application is built and deployed as a static site through GitHub Actions. The workflow should:

1. check out the repository;
2. install exact npm dependencies with `npm ci`;
3. run formatting/lint checks;
4. run TypeScript checks;
5. run unit tests;
6. build the PWA;
7. upload the `dist` directory as a Pages artifact;
8. deploy only from the stable branch selected for production.

Vite must use the repository subpath as its production base when deployed as a project site:

```ts
export default defineConfig({
  base: "/shot-tracker2-0/"
});
```

The exact base should be configurable so repository renaming does not require changing application code in multiple places.

## 16. Import and export

### 16.1 Game export

A game export is a JSON document containing a validated `GameBundle` plus export metadata.

```ts
interface GameExport {
  exportVersion: 1;
  exportedAt: string;
  applicationVersion: string;
  bundle: GameBundle;
}
```

### 16.2 Full archive export

The settings/storage screen should later support exporting all games and optionally recovery snapshots. A normal season archive should exclude snapshots unless the user explicitly includes them.

### 16.3 Import behavior

- Validate before writing anything.
- Reject unsupported future schema versions with a clear message.
- Detect ID collisions.
- Offer import as a copy or overwrite when a matching game exists.
- Create a recovery snapshot before overwrite.
- Perform the import in one transaction.

### 16.4 Desktop migration

Version 1 SQLite data will require a separate conversion tool. The converter should read the desktop database and emit Version 2 JSON exports. It is not part of the browser runtime and may remain a Python command-line utility in `tools/migration`.

## 17. Schema validation and migration

Every persisted or imported object is validated with Zod at application boundaries. TypeScript interfaces alone are not runtime validation.

Database schema upgrades use numbered Dexie versions. Data-level schema changes update `schemaVersion` and run explicit migrations.

Migration procedure:

1. assemble and validate the pre-migration game bundle;
2. create a `beforeMigration` snapshot;
3. transform the records;
4. validate the transformed bundle;
5. commit within a transaction;
6. record the application and schema version used.

## 18. Testing strategy

### 18.1 Domain tests

Pure calculations receive the highest coverage. Required areas include:

- Grade A classification
- team inference from rink end
- period end switching
- OT handling
- goal conversion
- target-zone requirements
- empty-net designation
- faceoff totals by period and zone
- penalty segment activation and queuing
- penalties that do not create power plays
- coincidental penalties
- PP% and PK%
- goalie stint timing
- multiple goalies and empty net
- completed-game edits

### 18.2 Cross-language fixtures

Representative games should be exported from or reconstructed against Version 1. The same inputs should produce the same expected totals in Python and TypeScript.

Fixtures belong in `shared/fixtures` and should cover ordinary games and edge cases.

### 18.3 Storage tests

Use an IndexedDB test implementation to verify:

- atomic commands;
- snapshot creation;
- global retention of eight unprotected snapshots;
- protected snapshot preservation;
- edit-before-save snapshots;
- import overwrite snapshots;
- cascade deletion;
- schema migrations.

### 18.4 End-to-end tests

Playwright should test tablet-size viewports, touch/pointer input, offline reloads, game recovery, and navigation. At least one test should:

1. install/load the application online;
2. create and start a game;
3. switch the browser context offline;
4. record game events;
5. end a period;
6. reload the application;
7. confirm the game and snapshot remain available.

## 19. Error handling and recovery

Domain errors should be typed and user-readable. Storage failures must never be silently ignored.

Examples:

- invalid clock value;
- no previous shot available to convert;
- opponent goal missing target zone;
- cannot close a nonexistent goalie stint;
- import validation failure;
- IndexedDB transaction failure;
- insufficient browser storage.

The UI should distinguish validation errors from storage errors. A storage error should keep the current in-memory data visible and offer export where possible.

## 20. Security and privacy

The initial PWA is a local, single-user application with no authentication and no required server. GitHub Pages hosts application code only, not game data.

- Do not include secrets in the repository or frontend build.
- Do not send game data to analytics or third-party services.
- Avoid externally hosted runtime fonts or scripts because games may be offline.
- Use dependency-lock files and automated dependency scanning.
- Treat imported JSON as untrusted input and validate it.

## 21. Initial screens

The first application shell should provide:

```text
Game Tracker

Continue Game
New Game
Completed Games
Recovery
Settings
```

`Continue Game` appears only when an active game exists. The Recovery screen may initially be minimal but should expose the snapshot store during development.

The live game screen will follow in a later alpha after storage and recovery are verified.

## 22. Version 2 release sequence

### 2.0.0-alpha1 — Foundation

- React/TypeScript/Vite project
- PWA installation and offline shell
- GitHub Pages workflow
- domain types and Zod schemas
- Dexie database
- snapshot and retention system
- import/export foundation
- branded home screen
- storage tests

### 2.0.0-alpha2 — Live shot tracking

- game setup
- active game shell
- SVG rink
- shot entry
- goal conversion
- period clock input
- period transitions
- automatic end-period snapshots

### 2.0.0-alpha3 — Complete live game mechanics

- faceoffs
- penalties and power plays
- goalie switching and empty net
- overtime and end-game workflow
- undo support

### 2.0.0-beta1 — Game management and editing

- completed-game list
- active and completed game editors
- pre-save edit snapshots
- recovery restore workflows
- import/export UI

### 2.0.0-beta2 — Analytics and reports

- game summary
- shot charts
- shooting summary
- goaltending summary
- offline PDF generation

### 2.0.0-rc1 — Field readiness

- real iPad testing
- Safari/PWA corrections
- Files/share workflow
- suspension and resume tests
- accessibility and touch cleanup
- migration from Version 1

## 23. Decisions fixed for Alpha 1

The following decisions should not be revisited during the initial implementation unless testing exposes a concrete problem:

- TypeScript, React, Vite, Zustand, Dexie, Zod, SVG
- no required backend
- GitHub Pages hosting
- offline-first operation
- UUID identifiers
- normalized coordinates
- feature-oriented organization
- command-based mutations
- automatic end-period snapshots
- snapshot before saved edits
- eight newest unprotected snapshots globally
- protected snapshots excluded from cleanup
- Version 1.1.0 as the behavioral reference

## 24. Deferred decisions

These items are intentionally deferred:

- optional cloud synchronization;
- season statistics across devices;
- authentication or multiple users;
- native App Store wrapper;
- exact browser PDF library;
- Apple Pencil-specific enhancements;
- remote roster management;
- public sharing of reports.

Deferring them keeps Alpha 1 focused and prevents online-only assumptions from entering the core architecture.

## 25. Definition of success

The architecture is successful when a user can install the GitHub Pages PWA, disconnect from the internet, track and edit a complete game, recover from an accidental edit using local snapshots, reopen the application after a reload, and produce the expected statistics without any server dependency.
