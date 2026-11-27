import { defineConfig, devices } from '@playwright/test';

/** System tests of the public Landing Page (audit corrections, section 6.4.2.4). */
export default defineConfig({
  testDir: './tests/system',
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [['list'], ['junit', { outputFile: 'test-results/system/junit.xml' }]],
  outputDir: 'test-results/system/traces',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4300',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx ng serve --host 127.0.0.1 --port 4300',
    url: 'http://127.0.0.1:4300/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
