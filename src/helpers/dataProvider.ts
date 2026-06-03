import fs from 'fs';
import path from 'path';

import { appConfig } from '@config/envManager';
import type { LoginOutcome, LoginTestCase } from '@app-types/user.types';
import { readJsonFile } from '@utils/fileUtils';
import { Logger } from '@utils/logger';

/** Supported data file formats (CSV reserved for future suites). */
export type DataFormat = 'json' | 'csv';

/** Raw shape stored in loginData.json before env resolution. */
export interface LoginDataRecord {
  readonly id: string;
  readonly username: string;
  readonly password: string;
  readonly description: string;
  readonly outcome: LoginOutcome;
  readonly expectedError?: string;
}

export type LoginTestCaseId = LoginDataRecord['id'];

type CsvRow = Record<string, string>;

const DATA_ROOT = path.resolve(process.cwd(), 'src', 'data');
const LOGIN_DATA_JSON = path.join(DATA_ROOT, 'loginData.json');
const LOGIN_DATA_CSV = path.join(DATA_ROOT, 'loginData.csv');

/** IDs whose secrets are loaded from .env at runtime (never hard-coded in CI). */
const ENV_CREDENTIAL_IDS: ReadonlySet<string> = new Set(['validUser']);

let cachedLoginCases: LoginTestCase[] | null = null;

/**
 * Loads typed rows from JSON or CSV (CSV hook for future migration).
 */
export function loadData<T>(
  relativePath: string,
  format: DataFormat
): T[] {
  const absolutePath = path.isAbsolute(relativePath)
    ? relativePath
    : path.resolve(process.cwd(), relativePath);

  Logger.debug('Loading test data', { path: absolutePath, format });

  switch (format) {
    case 'json':
      return loadJsonData<T>(absolutePath);
    case 'csv':
      return loadCsvData(absolutePath) as T[];
    default: {
      const exhaustive: never = format;
      throw new Error(`Unsupported data format: ${exhaustive}`);
    }
  }
}

function loadJsonData<T>(absolutePath: string): T[] {
  const payload = readJsonFile<T[] | Record<string, T>>(absolutePath);

  if (Array.isArray(payload)) {
    return payload;
  }

  return Object.values(payload);
}

/**
 * Minimal CSV loader for future data-driven suites.
 * Enable by adding loginData.csv and switching LOGIN_DATA_FORMAT below.
 */
function loadCsvData(absolutePath: string): CsvRow[] {
  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `CSV data file not found: ${absolutePath}. Provide the file or use JSON format.`
    );
  }

  const content = fs.readFileSync(absolutePath, 'utf-8').trim();
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(',').map((header) => header.trim());
  const rows: CsvRow[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = lines[index].split(',').map((value) => value.trim());
    const row = headers.reduce<CsvRow>((acc, header, columnIndex) => {
      acc[header] = values[columnIndex] ?? '';
      return acc;
    }, {});
    rows.push(row);
  }

  Logger.info('CSV test data loaded', { path: absolutePath, rowCount: rows.length });
  return rows;
}

/** Change to 'csv' when loginData.csv is introduced. */
const LOGIN_DATA_FORMAT: DataFormat = 'json';

function resolveLoginDataPath(): string {
  return LOGIN_DATA_FORMAT === 'csv' ? LOGIN_DATA_CSV : LOGIN_DATA_JSON;
}

function mapRecordToTestCase(record: LoginDataRecord): LoginTestCase {
  const credentials = ENV_CREDENTIAL_IDS.has(record.id)
    ? {
        username: appConfig.credentials.username,
        password: appConfig.credentials.password,
      }
    : {
        username: record.username,
        password: record.password,
      };

  return {
    id: record.id,
    description: record.description,
    outcome: record.outcome,
    expectedError: record.expectedError,
    ...credentials,
  };
}

/**
 * Returns all login scenarios for data-driven tests.
 * Credentials for `validUser` are merged from environment variables.
 */
export function getLoginTestCases(): LoginTestCase[] {
  if (cachedLoginCases) {
    return cachedLoginCases;
  }

  const records = loadData<LoginDataRecord>(resolveLoginDataPath(), LOGIN_DATA_FORMAT);
  cachedLoginCases = records.map(mapRecordToTestCase);

  Logger.debug('Login test data resolved', { count: cachedLoginCases.length });
  return cachedLoginCases;
}

export function getLoginTestCaseById(id: LoginTestCaseId): LoginTestCase {
  const match = getLoginTestCases().find((testCase) => testCase.id === id);

  if (!match) {
    throw new Error(`Login test case "${id}" was not found in login data.`);
  }

  return match;
}

/** Clears in-memory cache (useful for tests that reload data). */
export function clearLoginDataCache(): void {
  cachedLoginCases = null;
}
