import { APIRequestContext, APIResponse } from '@playwright/test';

import type { ApiRequestOptions, ApiResult, HttpMethod } from '@app-types/api.types';
import { Logger } from '@utils/logger';

export type { ApiRequestOptions, ApiResult };

export class ApiError extends Error {
  public readonly status: number;
  public readonly method: HttpMethod;
  public readonly endpoint: string;
  public readonly responseBody: unknown;

  constructor(
    message: string,
    status: number,
    method: HttpMethod,
    endpoint: string,
    responseBody: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.method = method;
    this.endpoint = endpoint;
    this.responseBody = responseBody;
  }
}

export class ApiClient {
  private readonly request: APIRequestContext;
  private readonly defaultHeaders: Record<string, string>;

  constructor(
    request: APIRequestContext,
    defaultHeaders: Record<string, string> = {}
  ) {
    this.request = request;
    this.defaultHeaders = defaultHeaders;
  }

  public async get<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResult<T>> {
    return this.send<T>('GET', endpoint, options);
  }

  public async post<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResult<T>> {
    return this.send<T>('POST', endpoint, options);
  }

  public async put<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResult<T>> {
    return this.send<T>('PUT', endpoint, options);
  }

  public async delete<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResult<T>> {
    return this.send<T>('DELETE', endpoint, options);
  }

  private async send<T>(
    method: HttpMethod,
    endpoint: string,
    options: ApiRequestOptions
  ): Promise<ApiResult<T>> {
    Logger.debug('API request started', { method, endpoint });

    try {
      const headers = {
        ...this.defaultHeaders,
        ...options.headers
      };

      const response = await this.request.fetch(endpoint, {
        ...options,
        method,
        headers
      });

      const responseBody = await this.parseResponse(response);

      if (!response.ok()) {
        Logger.error('API request failed', {
          method,
          endpoint,
          status: response.status(),
        });
        throw new ApiError(
          `${method} ${endpoint} failed with status ${response.status()}.`,
          response.status(),
          method,
          endpoint,
          responseBody
        );
      }

      Logger.info('API request successful', {
        method,
        endpoint,
        status: response.status(),
      });

      return {
        status: response.status(),
        ok: response.ok(),
        headers: response.headers(),
        data: responseBody as T
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('Unexpected API error', { method, endpoint, error: errorMessage });
      throw new Error(`Unexpected API error during ${method} ${endpoint}: ${errorMessage}`);
    }
  }

  private async parseResponse(response: APIResponse): Promise<unknown> {
    const contentType = response.headers()['content-type'] ?? '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }
}
