import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as { version: string };

export default defineConfig({
  plugins: [react()],

  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify('test-build'),
    __COMMIT_SHA__: JSON.stringify('test'),
    __BUILD_NUMBER__: JSON.stringify('test')
  },

  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true
  }
});