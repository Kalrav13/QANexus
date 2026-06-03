import { APIRequestContext } from '@playwright/test';

import type { ApiResult } from '@app-types/api.types';
import type { UserRecord } from '@app-types/user.types';

import { ApiClient } from './ApiClient';

export class UserApi {
  private readonly apiClient: ApiClient;

  constructor(request: APIRequestContext, bearerToken?: string) {
    this.apiClient = new ApiClient(request, this.buildDefaultHeaders(bearerToken));
  }

  public async getUsers(): Promise<ApiResult<UserRecord[]>> {
    return this.apiClient.get<UserRecord[]>('/admin/users');
  }

  public async getUserById(userId: number): Promise<ApiResult<UserRecord>> {
    return this.apiClient.get<UserRecord>(`/admin/users/${userId}`);
  }

  public async createUser(payload: UserRecord): Promise<ApiResult<UserRecord>> {
    return this.apiClient.post<UserRecord>('/admin/users', {
      data: payload,
    });
  }

  public async updateUser(
    userId: number,
    payload: Partial<UserRecord>
  ): Promise<ApiResult<UserRecord>> {
    return this.apiClient.put<UserRecord>(`/admin/users/${userId}`, {
      data: payload,
    });
  }

  public async deleteUser(
    userId: number
  ): Promise<ApiResult<Record<string, unknown>>> {
    return this.apiClient.delete<Record<string, unknown>>(`/admin/users/${userId}`);
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
