import { gameSchema, type Game } from '../domain/game';
import { db, type GameTrackerDatabase } from './database';
import { addRecoverySnapshot } from './snapshotService';

async function putValidatedGame(game: Game, database: GameTrackerDatabase): Promise<Game> {
  const saved = gameSchema.parse({ ...game, updatedAt: new Date().toISOString() });
  await database.games.put(saved);
  return saved;
}

export async function saveGame(game: Game, database: GameTrackerDatabase = db): Promise<Game> {
  return putValidatedGame(game, database);
}

export async function saveEditedGame(
  original: Game,
  edited: Game,
  database: GameTrackerDatabase = db
): Promise<Game> {
  return database.transaction('rw', database.games, database.snapshots, async () => {
    await addRecoverySnapshot(original, 'BEFORE_GAME_EDIT', { database });
    return putValidatedGame(edited, database);
  });
}

export async function endPeriod(game: Game, database: GameTrackerDatabase = db): Promise<Game> {
  return database.transaction('rw', database.games, database.snapshots, async () => {
    await addRecoverySnapshot(game, 'END_PERIOD', {
      database,
      periodLabel: String(game.currentPeriod)
    });
    return putValidatedGame({ ...game, periodActive: false }, database);
  });
}
