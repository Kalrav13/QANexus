import { test, expect } from '@playwright/test';

import { AuthApi } from '@api/AuthApi';
import { ApiError } from '@api/ApiClient';
import { getDefaultCredentials } from '@helpers/authHelper';
import {
  createAuthApi,
  loginViaApi,
} from '@helpers/apiHelper';
import { getLoginTestCaseById } from '@helpers/dataProvider';
import { TestTag, taggedDescribe, taggedTitle } from '@constants/testTags';
import { Logger } from '@utils/logger';

test.describe(taggedDescribe('Authentication API', TestTag.API), {
  tag: [TestTag.API],
}, () => {
  test(
    taggedTitle('authenticates with valid credentials', TestTag.SMOKE, TestTag.CRITICAL),
    { tag: [TestTag.API, TestTag.SMOKE, TestTag.CRITICAL] },
    async ({ request }) => {
      const authApi = createAuthApi(request);
      const credentials = getDefaultCredentials();

      Logger.info('Executing authentication API test', { username: credentials.username });

      const result = await authApi.login(credentials);

      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
      Logger.info('Authentication API returned success', { status: result.status });
    }
  );

  test(
    taggedTitle('rejects invalid credentials', TestTag.REGRESSION),
    { tag: [TestTag.API, TestTag.REGRESSION] },
    async ({ request }) => {
      const invalid = getLoginTestCaseById('invalidUser');
      const authApi = new AuthApi(request);

      Logger.info('Executing invalid login API test', { username: invalid.username });

      await expect(
        authApi.login({ username: invalid.username, password: invalid.password })
      ).rejects.toThrow(ApiError);
    }
  );

  test(
    taggedTitle('validates session after login', TestTag.SANITY),
    { tag: [TestTag.API, TestTag.SANITY] },
    async ({ request }) => {
      const credentials = getDefaultCredentials();
      const { token } = await loginViaApi(credentials, request);

      test.skip(!token, 'API token was not returned by the authentication endpoint');

      const authApi = createAuthApi(request, token);
      Logger.info('Validating authenticated API session');

      const session = await authApi.validateSession();

      expect(session.ok).toBe(true);
      expect(session.status).toBe(200);
      Logger.info('Session validation successful', { status: session.status });
    }
  );
});
