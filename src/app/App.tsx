import { useEffect } from 'react';
import { GameSetupPage } from '../features/game-setup/GameSetupPage';
import { HomePage } from '../features/home/HomePage';
import { LiveGamePage } from '../features/live/LiveGamePage';
import { useAppStore } from './store';

export function App() {
  const setOnline = useAppStore((state) => state.setOnline);
  const view = useAppStore((state) => state.view);

  useEffect(() => {
    const online = () => setOnline(true);
    const offline = () => setOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, [setOnline]);

  if (view === 'setup') return <GameSetupPage />;
  if (view === 'live') return <LiveGamePage />;
  return <HomePage />;
}
