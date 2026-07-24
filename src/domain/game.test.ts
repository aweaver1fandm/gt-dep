import { describe, expect, it } from 'vitest';
import { createGame, gameSchema } from './game';

describe('game schema', () => {
  it('creates a valid 17-minute active game with the default rink side', () => {
    const game = createGame({
      gameDate: '2026-07-23',
      opponent: 'Test Opponent',
      initialGoalie: 'Anthony'
    });
    expect(gameSchema.parse(game)).toEqual(game);
    expect(game.periodLengthSeconds).toBe(1020);
    expect(game.status).toBe('active');
    expect(game.yorkDefendsFirst).toBe('left');
  });
});
