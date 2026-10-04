import { defineConfig } from '@playwright/test';

// End-to-end tests drive the real UI and the real services through the harness server
// (dist/harness/server.js). Run `npm run test:e2e`.
export default defineConfig({
  testDir: 'tests-e2e',
  timeout: 180_000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5198',
    viewport: { width: 1280, height: 860 },
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node dist/harness/server.js',
    url: 'http://127.0.0.1:5198',
    env: { HARNESS_PORT: '5198', HARNESS_TEST_ANSWERS: '1' },
    reuseExistingServer: false,
  },
});
