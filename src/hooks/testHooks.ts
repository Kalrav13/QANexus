import { test as base, TestInfo } from '@playwright/test';

import { formatTimestamp } from '@utils/dateUtils';
import { ensureDirectory, pathFromProjectRoot } from '@utils/fileUtils';
import { Logger } from '@utils/logger';

type TestFixtures = {
  _lifecycle: void;
};

/**
 * Attaches automatic before/after logging and ensures report directories exist.
 * Chain from testFixtures: withTestHooks(base).extend({ ... })
 */
export function withTestHooks<T extends typeof base>(test: T) {
  return test.extend<TestFixtures>({
    _lifecycle: [
      async ({}, use, testInfo: TestInfo) => {
        ensureDirectory(pathFromProjectRoot('reports', 'screenshots'));

        const startedAt = formatTimestamp();
        Logger.info('Test started', {
          title: testInfo.title,
          project: testInfo.project.name,
          startedAt,
        });

        await use();

        const status = testInfo.status ?? 'unknown';
        const logMeta = {
          title: testInfo.title,
          status,
          durationMs: testInfo.duration,
        };

        if (status === 'failed' || status === 'timedOut') {
          Logger.error('Test finished', logMeta);
        } else {
          Logger.info('Test finished', logMeta);
        }
      },
      { auto: true },
    ],
  });
}
