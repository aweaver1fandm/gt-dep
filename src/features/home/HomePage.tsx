import { useLiveQuery } from 'dexie-react-hooks';
import { buildInfo, formatBuildTime } from '../../app/buildInfo';
import { useAppStore } from '../../app/store';
import { db } from '../../storage/database';
import { BrandHeader } from '../game-setup/BrandHeader';

interface HomeAction {
  label: string;
  detail: string;
  enabled: boolean;
  action?: () => void;
}

export function HomePage() {
  const showSetup = useAppStore((state) => state.showSetup);
  const showLiveGame = useAppStore((state) => state.showLiveGame);
  const gameCount = useLiveQuery(() => db.games.count(), [], 0);
  const snapshotCount = useLiveQuery(() => db.snapshots.count(), [], 0);
  const activeGame = useLiveQuery(
    () => db.games.where('status').equals('active').reverse().sortBy('updatedAt').then((games) => games[0]),
    []
  );

  const actions: HomeAction[] = [
    { label: 'New Game', detail: 'Set up a new York Devils game', enabled: true, action: showSetup },
    {
      label: 'Continue Game',
      detail: activeGame ? `vs. ${activeGame.opponent}` : 'No active game',
      enabled: Boolean(activeGame),
      action: () => activeGame && showLiveGame(activeGame.id)
    },
    { label: 'Completed Games', detail: 'Browse saved games in a later alpha', enabled: false },
    { label: 'Recovery', detail: 'Automatic snapshots are enabled', enabled: true }
  ];

  return (
    <main className="home-shell">
      <BrandHeader />

      <section className="status-card" aria-label="Local storage status">
        <div><strong>{gameCount}</strong><span>Stored games</span></div>
        <div><strong>{snapshotCount}</strong><span>Recovery snapshots</span></div>
        <div><strong>8</strong><span>Snapshot retention</span></div>
      </section>

      <section className="action-grid" aria-label="Game Tracker actions">
        {actions.map((action) => (
          <button
            key={action.label}
            className="action-card"
            disabled={!action.enabled}
            onClick={action.action}
          >
            <span>{action.label}</span>
            <small>{action.detail}</small>
          </button>
        ))}
      </section>

      <section className="foundation-note">
        <h2>Offline foundation installed</h2>
        <p>Application assets are cached for offline use. Game data and recovery snapshots are stored locally in IndexedDB.</p>
      </section>

      <section className="about-card" aria-labelledby="about-heading">
        <div>
          <p className="eyebrow about-eyebrow">Build information</p>
          <h2 id="about-heading">About Game Tracker</h2>
        </div>
        <dl>
          <div><dt>Version</dt><dd>{buildInfo.version}</dd></div>
          <div><dt>Build</dt><dd>{buildInfo.buildNumber}</dd></div>
          <div><dt>Commit</dt><dd><code>{buildInfo.commit}</code></dd></div>
          <div><dt>Built</dt><dd>{formatBuildTime(buildInfo.buildTime)}</dd></div>
        </dl>
      </section>
    </main>
  );
}
