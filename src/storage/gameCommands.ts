import type { Game, Shot } from '../domain/game';
import { isGradeA } from '../domain/rink';
import { saveGame } from './gameRepository';

function yorkDefendsLeft(game: Game): boolean {
  const first = game.yorkDefendsFirst === 'left';
  if (game.currentPeriod === 'OT') return !first;
  return game.currentPeriod % 2 === 1 ? first : !first;
}

export async function recordShot(game: Game, x: number, y: number): Promise<Game> {
  const yorkDefendingLeft = yorkDefendsLeft(game);
  const shotOnLeftNet = x < 0.5;
  const team = shotOnLeftNet === yorkDefendingLeft ? 'opponent' : 'york';
  const attackingRight = team === 'york' ? yorkDefendingLeft : !yorkDefendingLeft;
  const now = new Date().toISOString();
  const shot: Shot = {
    id: crypto.randomUUID(),
    team,
    period: game.currentPeriod,
    clockSecondsRemaining: game.periodLengthSeconds,
    location: { x, y },
    result: 'shot',
    gradeA: isGradeA({ x, y }, attackingRight),
    createdAt: now
  };
  return saveGame({ ...game, shots: [...game.shots, shot], updatedAt: now });
}

export async function convertLastShotToGoal(game: Game): Promise<Game> {
  if (!game.shots.length) return game;
  const shots = [...game.shots];
  const last = shots.at(-1)!;
  shots[shots.length - 1] = { ...last, result: 'goal' };
  return saveGame({ ...game, shots });
}

export async function undoLastAction(game: Game): Promise<Game> {
  if (!game.shots.length) return game;
  return saveGame({ ...game, shots: game.shots.slice(0, -1) });
}


export async function addGameNote(game: Game, note: string): Promise<Game> {
  const trimmed = note.trim();
  if (!trimmed) return game;
  const notes = game.notes ? `${game.notes}
${trimmed}` : trimmed;
  return saveGame({ ...game, notes });
}
