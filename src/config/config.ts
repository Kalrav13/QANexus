import { Environment } from '@app-types/environment.types';

export interface CredentialsConfig {
  readonly username: string;
  readonly password: string;
}

export interface TimeoutConfig {
  readonly test: number;
  readonly expect: number;
}

export interface ExecutionConfig {
  readonly retries: number;
  readonly workers: string;
  readonly headless: boolean;
}

export interface AppConfig {
  readonly environment: Environment;
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly credentials: CredentialsConfig;
  readonly timeout: TimeoutConfig;
  readonly execution: ExecutionConfig;
}
