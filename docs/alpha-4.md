# Version 2.0.0-alpha4

Alpha 4 focuses on a no-scroll landscape live-tracking layout and release reliability.

## Live tracker changes

- Fixed-height landscape viewport with no bottom command bar or status footer.
- Compact header retains the menu, York Devils logo, matchup, period, clock, and score.
- Goal, Penalty, Faceoff, Goalie, Note, Undo, and End Period controls now live in the header.
- Primary and game-management actions are visually grouped, while responsive sizing prevents wrapping on supported landscape screens.
- Removed date and regulation details from the header.
- Removed game-in-progress, autosave, and defended-end indicators.
- Added an Add Game Note dialog with immediate IndexedDB persistence.
- Retained tap-on-rink as the default shot-recording action.

## Quality improvements

- UI version tests read `buildInfo.version` rather than hard-coding a release string.
- Added `npm run verify` to lint, type-check, test, and build in one command.
- Deployment and test workflows use the same verification command.
