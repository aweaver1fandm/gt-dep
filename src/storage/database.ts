import Dexie, { type EntityTable } from 'dexie';
import type { Game } from '../domain/game';
import type { RecoverySnapshot } from '../domain/snapshot';

export interface AppSetting {
  key: string;
  value: unknown;
}

export class GameTrackerDatabase extends Dexie {
  games!: EntityTable<Game, 'id'>;
  snapshots!: EntityTable<RecoverySnapshot, 'id'>;
  settings!: EntityTable<AppSetting, 'key'>;

  constructor(name = 'YorkDevilsGameTracker') {
    super(name);
    this.version(1).stores({
      games: 'id, status, gameDate, updatedAt',
      snapshots: 'id, gameId, createdAt',
      settings: 'key'
    });
  }
}

export const db = new GameTrackerDatabase();
