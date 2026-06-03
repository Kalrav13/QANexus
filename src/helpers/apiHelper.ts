import { APIRequestContext, request as playwrightRequest } from '@playwright/test';

import { AuthApi } from '@api/AuthApi';
import { UserApi } from '@api/UserApi';
import users from '@data/users.json';
import { appConfig } from '@config/envManager';
import type { LoginRequest, LoginResponse } from '@app-types/api.types';
import type { UserCredentials, UserRecord } from '@app-types/user.types';
import { Logger } from '@utils/logger';

export interface AuthenticatedApis {
  readonly context: APIRequestContext;
  readonly authApi: AuthApi;
  readonly userApi: UserApi;
  readonly token?: string;
}

export async function createApiContext(
  extraHeaders: Record<string, string> = {}
): Promise<APIRequestContext> {
  return playwrightRequest.newContext({
    baseURL: appConfig.apiBaseUrl,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}

export function createAuthApi(apiContext: APIRequestContext, token?: string): AuthApi {
  return new AuthApi(apiContext, token);
}

export function createUserApi(apiContext: APIRequestContext, token?: string): UserApi {
  return new UserApi(apiContext, token);
}

export async function loginViaApi(
  credentials: UserCredentials,
  apiContext?: APIRequestContext
): Promise<{ context: APIRequestContext; token?: string; response: LoginResponse }> {
  const ownsContext = apiContext === undefined;
  const context = apiContext ?? (await createApiContext());
  const authApi = createAuthApi(context);

  const payload: LoginRequest = {
    username: credentials.username,
    password: credentials.password,
  };

  Logger.info('API login attempt', { username: payload.username });
  const result = await authApi.login(payload);
  const token = result.data.token;

  if (token) {
    Logger.info('API login successful', { username: payload.username });
  } else if (ownsContext) {
    Logger.warn('API login succeeded but no token was returned in the response body');
  }

  return { context, token, response: result.data };
}

export async function createAuthenticatedApis(
  credentials: UserCredentials
): Promise<AuthenticatedApis> {
  const { context, token } = await loginViaApi(credentials);
  return {
    context,
    token,
    authApi: createAuthApi(context, token),
    userApi: createUserApi(context, token),
  };
}

export async function disposeApiContext(context: APIRequestContext): Promise<void> {
  await context.dispose();
}

export type UserPersonaKey = keyof typeof users;

/** Expected user personas for API/UI assertions (see src/data/users.json). */
export function getUserPersona(key: UserPersonaKey): UserRecord {
  return users[key];
}
