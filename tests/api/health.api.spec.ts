import { test, expect } from '@playwright/test';

import { appConfig } from '@config/envManager';
import { TestTag, taggedDescribe, taggedTitle } from '@constants/testTags';
import { Logger } from '@utils/logger';

test.describe(taggedDescribe('API health checks', TestTag.API, TestTag.SMOKE), {
  tag: [TestTag.API, TestTag.SMOKE],
}, () => {
  test(
    taggedTitle('web application responds', TestTag.CRITICAL, TestTag.SANITY),
    { tag: [TestTag.API, TestTag.CRITICAL, TestTag.SANITY] },
    async ({ request }) => {
      Logger.info('Checking web application availability', { url: appConfig.baseUrl });

      const response = await request.get(appConfig.baseUrl);

      Logger.info('Web health check completed', { status: response.status() });
      expect(response.ok()).toBeTruthy();
    }
  );

  test(
    taggedTitle('API base URL is reachable', TestTag.CRITICAL),
    { tag: [TestTag.API, TestTag.CRITICAL] },
    async ({ request }) => {
      Logger.info('Checking API base availability', { url: appConfig.apiBaseUrl });

      const response = await request.get(appConfig.apiBaseUrl, {
        failOnStatusCode: false,
      });

      Logger.info('API health check completed', { status: response.status() });
      expect(response.status()).toBeLessThan(500);
    }
  );
});
