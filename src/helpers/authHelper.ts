import type { Page } from '@playwright/test';

import { appConfig } from '@config/envManager';
import {
  getLoginTestCaseById,
  type LoginTestCaseId,
} from '@helpers/dataProvider';
import { LoginPage } from '@pages/LoginPage';
import type { LoginScenario, UserCredentials } from '@app-types/user.types';
import { Logger } from '@utils/logger';

/** @deprecated Use LoginTestCaseId from dataProvider */
export type LoginScenarioKey = LoginTestCaseId;

/**
 * Resolves credentials for a data-driven scenario by id.
 * Secrets for validUser come from .env (CI-safe).
 */
export function getLoginScenario(key: LoginTestCaseId): LoginScenario {
  const testCase = getLoginTestCaseById(key);

  return {
    username: testCase.username,
    password: testCase.password,
    description: testCase.description,
    expectedError: testCase.expectedError,
  };
}

export function getDefaultCredentials(): UserCredentials {
  return {
    username: appConfig.credentials.username,
    password: appConfig.credentials.password,
  };
}

export async function loginViaUi(
  page: Page,
  credentials: UserCredentials = getDefaultCredentials()
): Promise<LoginPage> {
  Logger.info('UI login started', { username: credentials.username });
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLogin(appConfig.baseUrl);
  await loginPage.loginWithValidCredentials(credentials.username, credentials.password);
  Logger.info('User logged in via UI', { username: credentials.username });
  return loginPage;
}

export async function openLoginPage(loginPage: LoginPage): Promise<LoginPage> {
  await loginPage.navigateToLogin(appConfig.baseUrl);
  return loginPage;
}

export async function openLoginPageOn(page: Page): Promise<LoginPage> {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLogin(appConfig.baseUrl);
  return loginPage;
}
