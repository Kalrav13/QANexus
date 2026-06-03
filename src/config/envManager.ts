import { config as dotenvConfig } from 'dotenv';
import path from 'path';

import { AppConfig } from './config';
import { Environment } from '@app-types/environment.types';
import { resolveEnvironment } from './environment';

const REQUIRED_KEYS = [
  'BASE_URL',
  'API_BASE_URL',
  'USERNAME',
  'PASSWORD',
  'HEADLESS',
  'TEST_TIMEOUT_MS',
  'EXPECT_TIMEOUT_MS',
  'RETRIES',
  'WORKERS'
] as const;

type RequiredKey = (typeof REQUIRED_KEYS)[number];

class EnvManager {
  private appConfig: AppConfig | null = null;

  public load(environmentInput = process.env.TEST_ENV): AppConfig {
    if (this.appConfig) {
      return this.appConfig;
    }

    const environment = resolveEnvironment(environmentInput ?? process.env.NODE_ENV);
    const envFilePath = path.resolve(process.cwd(), `.env.${environment}`);

    dotenvConfig({ path: envFilePath, override: false });
    this.validateRequiredVariables(REQUIRED_KEYS);
    this.appConfig = this.createConfig(environment);

    return this.appConfig;
  }

  public getConfig(): AppConfig {
    if (!this.appConfig) {
      return this.load();
    }

    return this.appConfig;
  }

  private createConfig(environment: Environment): AppConfig {
    return {
      environment,
      baseUrl: this.getString('BASE_URL'),
      apiBaseUrl: this.getString('API_BASE_URL'),
      credentials: {
        username: this.getString('USERNAME'),
        password: this.getString('PASSWORD')
      },
      timeout: {
        test: this.getNumber('TEST_TIMEOUT_MS'),
        expect: this.getNumber('EXPECT_TIMEOUT_MS')
      },
      execution: {
        retries: this.getNumber('RETRIES'),
        workers: this.getString('WORKERS'),
        headless: this.getBoolean('HEADLESS')
      }
    };
  }

  private validateRequiredVariables(requiredKeys: readonly RequiredKey[]): void {
    const missing = requiredKeys.filter((key) => {
      const value = process.env[key];
      return value === undefined || value.trim().length === 0;
    });

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}.`
      );
    }
  }

  private getString(key: RequiredKey): string {
    return process.env[key] as string;
  }

  private getNumber(key: RequiredKey): number {
    const rawValue = this.getString(key);
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      throw new Error(`Environment variable "${key}" must be a valid number.`);
    }

    return parsed;
  }

  private getBoolean(key: RequiredKey): boolean {
    const rawValue = this.getString(key).toLowerCase();
    if (rawValue === 'true') {
      return true;
    }

    if (rawValue === 'false') {
      return false;
    }

    throw new Error(`Environment variable "${key}" must be "true" or "false".`);
  }
}

export const envManager = new EnvManager();
export const appConfig = envManager.load();
