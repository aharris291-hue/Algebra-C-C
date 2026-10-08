import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@content': path.resolve(__dirname, 'src/content'),
    },
  },
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    testTimeout: 60000,
    setupFiles: ['tests/setup/yield.ts'],
    // Separate processes are more robust than worker threads on Windows CI.
    pool: 'forks',
  },
});
