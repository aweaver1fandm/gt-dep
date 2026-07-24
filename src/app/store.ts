import { create } from 'zustand';

export type AppView = 'home' | 'setup' | 'live';

interface AppState {
  online: boolean;
  view: AppView;
  activeGameId: string | null;
  setOnline: (online: boolean) => void;
  showHome: () => void;
  showSetup: () => void;
  showLiveGame: (gameId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  online: navigator.onLine,
  view: 'home',
  activeGameId: null,
  setOnline: (online) => set({ online }),
  showHome: () => set({ view: 'home' }),
  showSetup: () => set({ view: 'setup' }),
  showLiveGame: (gameId) => set({ view: 'live', activeGameId: gameId })
}));
