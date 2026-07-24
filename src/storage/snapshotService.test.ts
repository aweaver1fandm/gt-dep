import 'fake-indexeddb/auto';

import { afterEach, describe, expect, it } from 'vitest';
import { createGame } from '../domain/game';
import { GameTrackerDatabase } from './database';
import { createRecoverySnapshot } from './snapshotService';

describe('snapshot retention', () => {
  const databases: GameTrackerDatabase[] = [];

  afterEach(async () => {
    const databasesToDelete = databases.splice(0);

    await Promise.all(
      databasesToDelete.map(
        (database) =>
          new Promise<void>((resolve, reject) => {
            const databaseName = database.name;
            database.close();

            const request = indexedDB.deleteDatabase(databaseName);

            request.onsuccess = () => resolve();
            request.onerror = () =>
              reject(
                request.error ??
                  new Error(`Unable to delete ${databaseName}`)
              );
            request.onblocked = () =>
              reject(new Error(`Deletion of ${databaseName} was blocked`));
          })
      )
    );
  });

  it('retains only the newest eight unprotected snapshots globally', async () => {
    const database = new GameTrackerDatabase(`test-${crypto.randomUUID()}`);
    databases.push(database);

    const game = createGame({
      gameDate: '2026-07-23',
      opponent: 'Opponent',
      yorkDefendsFirst: 'right',
      initialGoalie: 'Mason'
    });

    for (let index = 0; index < 10; index += 1) {
      await createRecoverySnapshot(game, 'END_PERIOD', {
        database,
        retention: 8
      });
    }

    expect(await database.snapshots.count()).toBe(8);
  });

  it('does not prune protected snapshots', async () => {
    const database = new GameTrackerDatabase(`test-${crypto.randomUUID()}`);
    databases.push(database);

    const game = createGame({
      gameDate: '2026-07-23',
      opponent: 'Opponent',
      yorkDefendsFirst: 'right',
      initialGoalie: 'Mason'
    });

    await createRecoverySnapshot(game, 'BEFORE_GAME_EDIT', {
      database,
      protected: true,
      retention: 1
    });

    await createRecoverySnapshot(game, 'END_PERIOD', {
      database,
      retention: 1
    });

    await createRecoverySnapshot(game, 'END_PERIOD', {
      database,
      retention: 1
    });

    expect(await database.snapshots.count()).toBe(2);
    expect(
      (await database.snapshots.toArray()).filter(
        (snapshot) => snapshot.protected
      )
    ).toHaveLength(1);
  });
});