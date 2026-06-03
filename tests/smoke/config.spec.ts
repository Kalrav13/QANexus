import { test, expect } from '@playwright/test';

import { appConfig } from '@config/envManager';
import { TestTag, taggedDescribe, taggedTitle } from '@constants/testTags';

test.describe(taggedDescribe('Framework bootstrap', TestTag.SMOKE, TestTag.SANITY), {
  tag: [TestTag.SMOKE, TestTag.SANITY],
}, () => {
  test(
    taggedTitle('loads environment configuration', TestTag.CRITICAL),
    { tag: [TestTag.CRITICAL, TestTag.SMOKE] },
    () => {
      expect(appConfig.baseUrl).toMatch(/orangehrm/i);
      expect(appConfig.apiBaseUrl).toMatch(/api/i);
      expect(appConfig.credentials.username.length).toBeGreaterThan(0);
      expect(appConfig.credentials.password.length).toBeGreaterThan(0);
      expect(appConfig.execution.headless).toBe(true);
    }
  );
});
