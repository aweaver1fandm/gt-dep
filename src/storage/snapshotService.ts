import type { Game } from '../domain/game';
import type { RecoverySnapshot, SnapshotReason } from '../domain/snapshot';
import { GameTrackerDatabase, db } from './database';

export const DEFAULT_SNAPSHOT_RETENTION = 8;

export function buildRecoverySnapshot(
  game: Game,
  reason: SnapshotReason,
  options: { periodLabel?: string; protected?: boolean } = {}
): RecoverySnapshot {
  return {
    id: crypto.randomUUID(),
    gameId: game.id,
    createdAt: new Date().toISOString(),
    reason,
    periodLabel: options.periodLabel,
    protected: options.protected ?? false,
    gameData: structuredClone(game)
  };
}

export async function pruneSnapshots(
  database: GameTrackerDatabase = db,
  retention = DEFAULT_SNAPSHOT_RETENTION
): Promise<number> {
  const allSnapshots = await database.snapshots.orderBy('createdAt').toArray();
  const unprotected = allSnapshots.filter((snapshot) => !snapshot.protected);
  const removeCount = Math.max(0, unprotected.length - retention);
  if (removeCount === 0) return 0;

  await database.snapshots.bulkDelete(unprotected.slice(0, removeCount).map((item) => item.id));
  return removeCount;
}

export async function addRecoverySnapshot(
  game: Game,
  reason: SnapshotReason,
  options: {
    periodLabel?: string;
    protected?: boolean;
    retention?: number;
    database?: GameTrackerDatabase;
  } = {}
): Promise<RecoverySnapshot> {
  const database = options.database ?? db;
  const snapshot = buildRecoverySnapshot(game, reason, options);
  await database.snapshots.add(snapshot);
  await pruneSnapshots(database, options.retention ?? DEFAULT_SNAPSHOT_RETENTION);
  return snapshot;
}

export async function createRecoverySnapshot(
  game: Game,
  reason: SnapshotReason,
  options: {
    periodLabel?: string;
    protected?: boolean;
    retention?: number;
    database?: GameTrackerDatabase;
  } = {}
): Promise<RecoverySnapshot> {
  const database = options.database ?? db;
  return database.transaction('rw', database.snapshots, () =>
    addRecoverySnapshot(game, reason, { ...options, database })
  );
}
