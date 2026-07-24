import { useEffect, useMemo, useState } from 'react';
import type { Game } from '../../domain/game';
import { useAppStore } from '../../app/store';
import { db } from '../../storage/database';
import {
  addGameNote,
  convertLastShotToGoal,
  recordShot,
  undoLastAction
} from '../../storage/gameCommands';
import { endPeriod } from '../../storage/gameRepository';
import { RinkSvg } from './RinkSvg';

function formatClock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function LiveGamePage() {
  const activeGameId = useAppStore((state) => state.activeGameId);
  const showHome = useAppStore((state) => state.showHome);
  const [game, setGame] = useState<Game | null>(null);
  const [busy, setBusy] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    if (!activeGameId) return;
    void db.games.get(activeGameId).then((loaded) => setGame(loaded ?? null));
  }, [activeGameId]);

  const stats = useMemo(() => {
    if (!game) return null;
    const current = game.shots.filter((shot) => shot.period === game.currentPeriod);
    const forTeam = (team: 'york' | 'opponent') => ({
      shots: current.filter((shot) => shot.team === team).length,
      gradeA: current.filter((shot) => shot.team === team && shot.gradeA).length,
      goals: current.filter((shot) => shot.team === team && shot.result === 'goal').length
    });
    return { york: forTeam('york'), opponent: forTeam('opponent') };
  }, [game]);

  async function update(action: (current: Game) => Promise<Game>) {
    if (!game || busy) return;
    setBusy(true);
    try {
      setGame(await action(game));
    } finally {
      setBusy(false);
    }
  }

  async function saveNote() {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    await update((current) => addGameNote(current, trimmed));
    setNoteDraft('');
    setNoteOpen(false);
  }

  if (!game || !stats) {
    return <main className="live-loading">Loading game…</main>;
  }

  const yorkScore = game.shots.filter((shot) => shot.team === 'york' && shot.result === 'goal').length;
  const opponentScore = game.shots.filter((shot) => shot.team === 'opponent' && shot.result === 'goal').length;

  return (
    <main className="live-shell">
      <header className="live-header">
        <div className="live-brand-group">
          <button className="menu-button" type="button" onClick={showHome} aria-label="Return home">☰</button>
          <img src={`${import.meta.env.BASE_URL}assets/york-devils-logo.png`} alt="" />
          <div className="live-matchup">
            <strong>York Devils</strong>
            <span>vs</span>
            <strong className="opponent-name">{game.opponent}</strong>
          </div>
        </div>

        <div className="live-scoreboard" aria-label="Game score and clock">
          <div><small>Period</small><strong>{String(game.currentPeriod).toUpperCase()}</strong></div>
          <div className="clock"><small>Remaining</small><strong>{formatClock(game.periodLengthSeconds)}</strong></div>
          <div className="compact-score york"><small>York</small><strong>{yorkScore}</strong></div>
          <span className="score-divider">:</span>
          <div className="compact-score opponent"><small>{game.opponent}</small><strong>{opponentScore}</strong></div>
        </div>

        <nav className="header-actions" aria-label="Game commands">
          <div className="action-group primary-actions">
            <button disabled={!game.shots.length || busy} onClick={() => void update(convertLastShotToGoal)}>Goal</button>
            <button disabled>Penalty</button>
            <button disabled>Faceoff</button>
            <button disabled aria-label="Switch goalie">Goalie</button>
            <button type="button" onClick={() => setNoteOpen(true)}>Note</button>
          </div>
          <div className="action-group management-actions">
            <button disabled={!game.shots.length || busy} onClick={() => void update(undoLastAction)}>Undo</button>
            <button className="end-period-button" disabled={busy || !game.periodActive} onClick={() => void update(endPeriod)}>End Period</button>
          </div>
        </nav>
      </header>

      <section className="live-content">
        <div className="rink-panel">
          <RinkSvg game={game} onShot={(x, y) => void update((current) => recordShot(current, x, y))} />
        </div>

        <aside className="live-sidebar">
          <section className="info-panel">
            <h2>Game Info</h2>
            <dl>
              <div><dt>Date</dt><dd>{game.gameDate}</dd></div>
              <div><dt>Opponent</dt><dd>{game.opponent}</dd></div>
              <div><dt>Goalie</dt><dd>{game.initialGoalie}</dd></div>
              <div><dt>Period Length</dt><dd>{formatClock(game.periodLengthSeconds)}</dd></div>
              <div><dt>Game Notes</dt><dd>{game.notes ? 'Added' : 'None'}</dd></div>
            </dl>
          </section>
          <section className="info-panel summary-panel">
            <h2>Period Summary</h2>
            <table>
              <thead><tr><th></th><th>York</th><th>{game.opponent}</th></tr></thead>
              <tbody>
                <tr><td>Shots on Goal</td><td>{stats.york.shots}</td><td>{stats.opponent.shots}</td></tr>
                <tr><td>Grade A Shots</td><td>{stats.york.gradeA}</td><td>{stats.opponent.gradeA}</td></tr>
                <tr><td>Goals</td><td>{stats.york.goals}</td><td>{stats.opponent.goals}</td></tr>
                <tr><td>Penalties</td><td>0</td><td>0</td></tr>
                <tr><td>Faceoffs Won</td><td>0</td><td>0</td></tr>
              </tbody>
            </table>
          </section>
        </aside>
      </section>

      {noteOpen && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setNoteOpen(false)}>
          <section className="note-dialog" role="dialog" aria-modal="true" aria-labelledby="note-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="note-dialog-title">Add Game Note</h2>
            <p>Add a note to the current game record.</p>
            <label htmlFor="game-note">Game note</label>
            <textarea
              id="game-note"
              autoFocus
              rows={5}
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Enter a game note…"
            />
            <div className="dialog-actions">
              <button type="button" className="secondary-button" onClick={() => { setNoteDraft(''); setNoteOpen(false); }}>Cancel</button>
              <button type="button" className="primary-button" disabled={!noteDraft.trim() || busy} onClick={() => void saveNote()}>Save Note</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
