import { defineConfig, devices } from '@playwright/test';

const appPort = 3210;
const apiPort = 3211;
const baseURL = `http://127.0.0.1:${appPort}`;
const useExternalServers = process.env.PLAYWRIGHT_EXTERNAL_SERVERS === '1';

export default defineConfig({
  testDir: './e2e',
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // The deterministic mock API has shared mutable state (wishlist/order/admin
  // flows), so a single worker prevents unrelated journeys from racing.
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60_000,
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: useExternalServers ? undefined : [
    {
      command: 'node e2e/mock-api.mjs',
      env: { MOCK_API_PORT: String(apiPort) },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      url: `http://127.0.0.1:${apiPort}/health`,
    },
    {
      command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${appPort}`,
      env: {
        PLAYWRIGHT_BUILD: '1',
        NEXT_PUBLIC_API_URL: `http://127.0.0.1:${apiPort}/api`,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      url: baseURL,
    },
  ],
});
