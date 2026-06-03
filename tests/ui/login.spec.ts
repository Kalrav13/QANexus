import { test, expect } from '@fixtures/index';
import { AssertionMessages, UiMessages } from '@constants/messages';
import { RoutePatterns } from '@constants/routes';
import {
  TestTag,
  taggedDescribe,
  taggedTitle,
  type TestTagName,
} from '@constants/testTags';
import { getLoginTestCases } from '@helpers/dataProvider';
import { openLoginPage } from '@helpers/authHelper';
import type { LoginTestCase } from '@app-types/user.types';
import { LoginPage } from '@pages/LoginPage';

const loginData = getLoginTestCases();

test.describe(taggedDescribe('Login tests', TestTag.UI), {
  tag: [TestTag.UI],
}, () => {
  test(
    taggedTitle('displays the login form', TestTag.SMOKE, TestTag.SANITY, TestTag.CRITICAL),
    { tag: [TestTag.SMOKE, TestTag.SANITY, TestTag.CRITICAL, TestTag.UI] },
    async ({ loginPage }) => {
      await openLoginPage(loginPage);
      expect(
        await loginPage.isLoginFormVisible(),
        AssertionMessages.LOGIN_FORM_VISIBLE
      ).toBe(true);
    }
  );

  test.describe(taggedDescribe('Credential validation', TestTag.REGRESSION), {
    tag: [TestTag.REGRESSION, TestTag.UI],
  }, () => {
    for (const user of loginData) {
      const tags = tagsForLoginCase(user);

      test(
        taggedTitle(`[${user.id}] ${user.description}`, ...tags),
        { tag: tags },
        async ({ loginPage }) => {
          await openLoginPage(loginPage);
          await loginPage.login(user.username, user.password);
          await assertLoginOutcome(loginPage, user);
        }
      );
    }
  });
});

function tagsForLoginCase(user: LoginTestCase): TestTagName[] {
  const tags: TestTagName[] = [TestTag.UI];

  if (user.outcome === 'success') {
    return [TestTag.SMOKE, TestTag.SANITY, TestTag.CRITICAL, ...tags];
  }

  return [TestTag.REGRESSION, ...tags];
}

async function assertLoginOutcome(
  loginPage: LoginPage,
  user: LoginTestCase
): Promise<void> {
  switch (user.outcome) {
    case 'success':
      await expect(
        loginPage.page,
        AssertionMessages.DASHBOARD_LOADED
      ).toHaveURL(RoutePatterns.DASHBOARD);
      break;

    case 'error':
      await expect(loginPage.page).toHaveURL(RoutePatterns.LOGIN);
      expect(
        await loginPage.getLoginErrorMessage(),
        AssertionMessages.LOGIN_ERROR_SHOWN
      ).toContain(user.expectedError ?? UiMessages.LOGIN_INVALID_CREDENTIALS);
      break;

    case 'validation':
      await expect(loginPage.page).toHaveURL(RoutePatterns.LOGIN);
      expect(await loginPage.getLoginErrorMessage()).toContain(
        user.expectedError ?? UiMessages.LOGIN_REQUIRED
      );
      break;

    default: {
      const exhaustive: never = user.outcome;
      throw new Error(`Unhandled login outcome: ${exhaustive}`);
    }
  }
}
