import { APIRequestContext } from '@playwright/test';

import type { ApiResult, LoginRequest, LoginResponse } from '@app-types/api.types';

import { ApiClient } from './ApiClient';

export class AuthApi {
  private readonly apiClient: ApiClient;

  constructor(request: APIRequestContext, bearerToken?: string) {
    this.apiClient = new ApiClient(request, this.buildDefaultHeaders(bearerToken));
  }

  public async login(payload: LoginRequest): Promise<ApiResult<LoginResponse>> {
    return this.apiClient.post<LoginResponse>('/auth/login', {
      data: payload,
    });
  }

  public async validateSession(): Promise<ApiResult<Record<string, unknown>>> {
    return this.apiClient.get<Record<string, unknown>>('/auth/validate');
  }

  private buildDefaultHeaders(
    bearerToken?: string
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    return headers;
  }
}
