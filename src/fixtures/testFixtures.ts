import { test as base, expect } from '@playwright/test';

import { Routes } from '@constants/routes';
import { withTestHooks } from '@hooks/testHooks';
import { Logger } from '@utils/logger';
import { DashboardPage } from '@pages/DashboardPage';
import { LoginPage } from '@pages/LoginPage';

type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  /** Uses storageState from project config; navigates to dashboard (no UI login). */
  authenticatedDashboard: DashboardPage;
};

const testWithHooks = withTestHooks(base);

export const test = testWithHooks.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    Logger.debug('Fixture ready: loginPage');
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    Logger.debug('Fixture ready: dashboardPage');
    await use(new DashboardPage(page));
  },

  authenticatedDashboard: async ({ page }, use) => {
    Logger.info('Navigating to dashboard with saved authentication state');
    await page.goto(Routes.DASHBOARD);
    await use(new DashboardPage(page));
  },
});

export { expect };
