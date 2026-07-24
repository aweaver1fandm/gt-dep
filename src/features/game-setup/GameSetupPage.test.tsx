import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '../../app/store';
import { db } from '../../storage/database';
import { GameSetupPage } from './GameSetupPage';

describe('GameSetupPage', () => {
  beforeEach(async () => {
    await db.games.clear();
    useAppStore.setState({ view: 'setup', activeGameId: null });
  });

  it('validates required opponent information', async () => {
    render(<GameSetupPage />);
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
    expect(await screen.findByText('Enter the opponent team name.')).toBeInTheDocument();
  });

  it('creates and stores a new game', async () => {
    render(<GameSetupPage />);
    fireEvent.change(screen.getByLabelText(/Opponent Team/i), { target: { value: 'Hershey Bears' } });
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    await waitFor(async () => expect(await db.games.count()).toBe(1));
    const saved = await db.games.toCollection().first();
    expect(saved?.opponent).toBe('Hershey Bears');
    expect(saved?.initialGoalie).toBe('Anthony');
    expect(saved?.periodLengthSeconds).toBe(1020);
    expect(useAppStore.getState().view).toBe('live');
  });
});
