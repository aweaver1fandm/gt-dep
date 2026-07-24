import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '../../app/store';
import { db } from '../../storage/database';
import { BrandHeader } from './BrandHeader';

export function GameReadyPage() {
  const activeGameId = useAppStore((state) => state.activeGameId);
  const showHome = useAppStore((state) => state.showHome);
  const game = useLiveQuery(
    async () => activeGameId ? db.games.get(activeGameId) : undefined,
    [activeGameId]
  );

  return (
    <main className="setup-shell">
      <BrandHeader />
      <section className="setup-card game-ready-card">
        <p className="eyebrow ready-eyebrow">Game saved</p>
        <h2>{game ? `York Devils vs. ${game.opponent}` : 'Preparing game…'}</h2>
        {game && (
          <p>
            {game.gameDate} · {game.periodLengthSeconds / 60} minute periods · Starting goalie: {game.initialGoalie}
          </p>
        )}
        <p className="ready-message">The live tracking rink arrives in Alpha 3. This game is stored locally and can be continued from the home screen.</p>
        <button type="button" className="start-game-button" onClick={showHome}>Return to Home</button>
      </section>
    </main>
  );
}
