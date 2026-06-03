import type { UserCredentials } from './user.types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiResult<T> {
  readonly status: number;
  readonly ok: boolean;
  readonly headers: Record<string, string>;
  readonly data: T;
}

export interface LoginRequest extends UserCredentials {}

export interface LoginResponse {
  readonly token?: string;
  readonly [key: string]: unknown;
}

export interface ApiRequestOptions {
  readonly headers?: Record<string, string>;
  readonly data?: unknown;
  readonly params?: Record<string, string | number | boolean>;
  readonly timeout?: number;
}
