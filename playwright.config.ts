import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import { appConfig } from './src/config/envManager';

export const AUTH_STORAGE_PATH = path.join(
  __dirname,
  'playwright/.auth/user.json'
);

const authenticatedTestIgnore = [
  /auth\.setup\.ts/,
  /login\.spec\.ts/,
  /smoke\//,
  /api\//,
];

const apiTestMatch = /api\/.*\.api\.spec\.ts/;

/** Playwright accepts worker count (number) or percentage (e.g. "50%"). */
function resolvePlaywrightWorkers(workers: string): number | string {
  const value = workers.trim();

  if (value.endsWith('%')) {
    return value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}

export default defineConfig({
  testDir: './tests',
  timeout: appConfig.timeout.test,
  expect: {
    timeout: appConfig.timeout.expect,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: appConfig.execution.retries,
  workers: resolvePlaywrightWorkers(appConfig.execution.workers),
  reporter: [
    ['list'],
    ['./src/reporters/QANexusReporter.ts'],
    [
      'html',
      {
        outputFolder: 'reports/html-report',
        open: 'never',
      },
    ],
    ['allure-playwright'],
    [
      'junit',
      {
        outputFile: 'reports/junit.xml',
      },
    ],
  ],
  use: {
    baseURL: appConfig.baseUrl,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
    headless: appConfig.execution.headless,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'smoke',
      testMatch: /smoke\/.*\.spec\.ts/,
      testIgnore: /api\//,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testMatch: apiTestMatch,
      use: {
        baseURL: appConfig.apiBaseUrl,
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
    {
      name: 'chromium',
      testIgnore: authenticatedTestIgnore,
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STORAGE_PATH,
      },
      dependencies: ['setup'],
    },
    {
      name: 'chromium-login',
      testMatch: /login\.spec\.ts/,
      testIgnore: /api\//,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: authenticatedTestIgnore,
      use: {
        ...devices['Desktop Firefox'],
        storageState: AUTH_STORAGE_PATH,
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testIgnore: authenticatedTestIgnore,
      use: {
        ...devices['Desktop Safari'],
        storageState: AUTH_STORAGE_PATH,
      },
      dependencies: ['setup'],
    },
  ],
  outputDir: 'reports/test-results',
});
