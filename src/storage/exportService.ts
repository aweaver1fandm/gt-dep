import { gameSchema, type Game } from '../domain/game';

export function serializeGame(game: Game): string {
  return JSON.stringify(gameSchema.parse(game), null, 2);
}

export function parseGameExport(contents: string): Game {
  return gameSchema.parse(JSON.parse(contents) as unknown);
}

export function downloadGame(game: Game): void {
  const blob = new Blob([serializeGame(game)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `game-${game.gameDate}-${game.opponent.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
