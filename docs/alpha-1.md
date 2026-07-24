# Version 2.0.0 Alpha 1

Alpha 1 establishes the offline application foundation. It intentionally does not implement game setup or live rink tracking.

## Included

- Branded React/TypeScript application shell
- Touch-responsive home screen
- PWA manifest, service worker, and landscape orientation preference
- GitHub Pages base-path handling and deployment workflow
- Versioned game schema validated with Zod
- UUID identifiers and normalized coordinate schema
- Dexie stores for games, recovery snapshots, and settings
- Automatic period-end snapshots
- Pre-edit snapshot support
- Eight-snapshot global retention for unprotected snapshots
- Protected snapshots excluded from automatic pruning
- JSON game serialization and validation
- Unit/component tests for schema, home page, and retention

## Next milestone

Alpha 2 will add new-game setup, saved-game lists, continue-game behavior, initial goalie configuration, and durable active-game creation.
