import { z } from 'zod';
import { gameSchema } from './game';

export const snapshotReasonSchema = z.enum([
  'END_PERIOD',
  'BEFORE_END_GAME',
  'BEFORE_GAME_EDIT',
  'BEFORE_IMPORT',
  'BEFORE_MIGRATION'
]);

export const recoverySnapshotSchema = z.object({
  id: z.uuid(),
  gameId: z.uuid(),
  createdAt: z.iso.datetime(),
  reason: snapshotReasonSchema,
  periodLabel: z.string().optional(),
  protected: z.boolean(),
  gameData: gameSchema
});

export type SnapshotReason = z.infer<typeof snapshotReasonSchema>;
export type RecoverySnapshot = z.infer<typeof recoverySnapshotSchema>;
