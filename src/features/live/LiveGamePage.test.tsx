import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '../../app/store';
import { createGame } from '../../domain/game';
import { db } from '../../storage/database';
import { LiveGamePage } from './LiveGamePage';

describe('LiveGamePage', () => {
  beforeEach(async () => {
    await db.games.clear();
    const game = createGame({
      gameDate: '2026-07-24',
      opponent: 'Hershey Bears',
      initialGoalie: 'Anthony'
    });
    await db.games.put(game);
    useAppStore.setState({ view: 'live', activeGameId: game.id });
  });

  it('renders compact live controls without the old footer controls', async () => {
    render(<LiveGamePage />);
    expect(await screen.findByRole('button', { name: 'Goal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Switch goalie' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Note' })).toBeInTheDocument();
    expect(screen.queryByText('Game in progress')).not.toBeInTheDocument();
    expect(screen.queryByText(/defends this end/i)).not.toBeInTheDocument();
  });

  it('adds and persists a game note', async () => {
    render(<LiveGamePage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Note' }));
    fireEvent.change(screen.getByLabelText('Game note'), { target: { value: 'Strong second-period pressure.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Note' }));

    await waitFor(async () => {
      const saved = await db.games.toCollection().first();
      expect(saved?.notes).toBe('Strong second-period pressure.');
    });
  });
});
