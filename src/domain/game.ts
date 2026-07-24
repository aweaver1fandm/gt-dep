import { z } from 'zod';

export const teamSideSchema = z.enum(['york', 'opponent']);
export const gameStatusSchema = z.enum(['active', 'completed']);
export const periodSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal('OT')]);

export const normalizedPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1)
});

export const shotSchema = z.object({
  id: z.uuid(),
  team: teamSideSchema,
  period: periodSchema,
  clockSecondsRemaining: z.number().int().nonnegative(),
  location: normalizedPointSchema,
  result: z.enum(['shot', 'goal']),
  gradeA: z.boolean(),
  targetZone: z.number().int().min(1).max(9).optional(),
  goalSituation: z.enum(['5v5', 'PP', 'SH', 'ENG']).optional(),
  goalieStintId: z.uuid().optional(),
  createdAt: z.iso.datetime()
});

export const gameSchema = z.object({
  schemaVersion: z.literal('2.0'),
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  gameDate: z.iso.date(),
  opponent: z.string().trim().min(1),
  status: gameStatusSchema,
  currentPeriod: periodSchema,
  periodActive: z.boolean(),
  periodLengthSeconds: z.number().int().positive(),
  yorkDefendsFirst: z.enum(['left', 'right']),
  initialGoalie: z.string().trim().min(1),
  notes: z.string(),
  shots: z.array(shotSchema)
});

export type Game = z.infer<typeof gameSchema>;
export type Shot = z.infer<typeof shotSchema>;
export type NormalizedPoint = z.infer<typeof normalizedPointSchema>;
export type GameStatus = z.infer<typeof gameStatusSchema>;

export function createGame(input: {
  gameDate: string;
  opponent: string;
  yorkDefendsFirst?: 'left' | 'right';
  initialGoalie: string;
  periodLengthSeconds?: number;
}): Game {
  const now = new Date().toISOString();
  return gameSchema.parse({
    schemaVersion: '2.0',
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    gameDate: input.gameDate,
    opponent: input.opponent,
    status: 'active',
    currentPeriod: 1,
    periodActive: true,
    periodLengthSeconds: input.periodLengthSeconds ?? 17 * 60,
    yorkDefendsFirst: input.yorkDefendsFirst ?? 'left',
    initialGoalie: input.initialGoalie,
    notes: '',
    shots: []
  });
}
