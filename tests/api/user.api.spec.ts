import { test, expect } from '@playwright/test';

import { getDefaultCredentials } from '@helpers/authHelper';
import {
  createUserApi,
  getUserPersona,
  loginViaApi,
} from '@helpers/apiHelper';
import { TestTag, taggedDescribe, taggedTitle } from '@constants/testTags';
import { Logger } from '@utils/logger';

test.describe(taggedDescribe('User API', TestTag.API), {
  tag: [TestTag.API],
}, () => {
  test(
    taggedTitle('returns system users when authenticated', TestTag.SMOKE, TestTag.CRITICAL),
    { tag: [TestTag.API, TestTag.SMOKE, TestTag.CRITICAL] },
    async ({ request }) => {
      const credentials = getDefaultCredentials();
      const { token } = await loginViaApi(credentials, request);

      test.skip(!token, 'API token was not returned by the authentication endpoint');

      const userApi = createUserApi(request, token);
      Logger.info('Fetching users via UserApi');

      const users = await userApi.getUsers();

      expect(users.ok).toBe(true);
      expect(users.status).toBe(200);
      expect(Array.isArray(users.data)).toBe(true);
      expect(users.data.length).toBeGreaterThan(0);

      Logger.info('User list retrieved', { count: users.data.length });
    }
  );

  test(
    taggedTitle('returns a user by id', TestTag.REGRESSION),
    { tag: [TestTag.API, TestTag.REGRESSION] },
    async ({ request }) => {
      const credentials = getDefaultCredentials();
      const { token } = await loginViaApi(credentials, request);

      test.skip(!token, 'API token was not returned by the authentication endpoint');

      const userApi = createUserApi(request, token);
      const list = await userApi.getUsers();
      const firstUser = list.data.find((user) => user.id !== undefined);

      test.skip(firstUser?.id === undefined, 'No user id available in list response');

      const userId = firstUser!.id as number;
      Logger.info('Fetching user by id', { userId });

      const user = await userApi.getUserById(userId);

      expect(user.ok).toBe(true);
      expect(user.status).toBe(200);
      expect(user.data.userName.length).toBeGreaterThan(0);

      const adminPersona = getUserPersona('admin');
      expect(user.data.userName).toBe(adminPersona.userName);

      Logger.info('User retrieved by id', { userName: user.data.userName });
    }
  );
});
