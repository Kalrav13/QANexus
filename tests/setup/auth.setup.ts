import path from 'path';

import { test as setup, expect } from '@playwright/test';

import { RoutePatterns } from '@constants/routes';
import { TestTag } from '@constants/testTags';
import { loginViaUi } from '@helpers/authHelper';
import { Logger } from '@utils/logger';
import { ensureDirectory } from '@utils/fileUtils';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate as OrangeHRM admin', { tag: [TestTag.SMOKE, TestTag.CRITICAL] }, async ({ page }) => {
  Logger.info('Authentication setup started');
  ensureDirectory(path.dirname(authFile));

  await loginViaUi(page);
  await expect(page).toHaveURL(RoutePatterns.DASHBOARD);

  await page.context().storageState({ path: authFile });
  Logger.info('Authentication state saved', { path: authFile });
});
