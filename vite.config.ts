import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as { version: string };

const appVersion = packageJson.version;
const buildTime = process.env.BUILD_TIME ?? new Date().toISOString();
const commitSha = (process.env.GITHUB_SHA ?? 'development').slice(0, 7);
const buildNumber = process.env.GITHUB_RUN_NUMBER ?? 'local';

export default defineConfig(({ command }) => ({
  // Production files are published from the public gt-dep repository.
  // Development remains available at the normal localhost root.
  base: command === 'build' ? '/gt-dep/' : '/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_TIME__: JSON.stringify(buildTime),
    __COMMIT_SHA__: JSON.stringify(commitSha),
    __BUILD_NUMBER__: JSON.stringify(buildNumber)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/york-devils-logo.png', 'assets/game-tracker-icon.png'],
      manifest: {
        name: 'York Devils Game Tracker',
        short_name: 'Game Tracker',
        description: 'Offline-first hockey game tracking and analysis',
        theme_color: '#111827',
        background_color: '#f3f4f6',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'assets/game-tracker-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}']
      }
    })
  ]
}));
