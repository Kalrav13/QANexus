/**
 * Standard test tags for suite filtering and CI pipelines.
 *
 * Execution examples:
 *   npx playwright test --grep @smoke
 *   npx playwright test --grep @sanity
 *   npx playwright test --grep @regression
 *   npx playwright test --grep @critical
 *   npx playwright test --grep @ui
 *   npx playwright test --grep @api
 *
 * Combine tags (AND):
 *   npx playwright test --grep "@smoke" --grep "@ui"
 */
export const TestTag = {
  SMOKE: '@smoke',
  SANITY: '@sanity',
  REGRESSION: '@regression',
  CRITICAL: '@critical',
  UI: '@ui',
  API: '@api',
} as const;

export type TestTagName = (typeof TestTag)[keyof typeof TestTag];

/** Prefix a test title with tags for readable HTML reports and --grep. */
export function taggedTitle(title: string, ...tags: TestTagName[]): string {
  return `${tags.join(' ')} ${title}`;
}

/** Prefix a describe block title with tags. */
export function taggedDescribe(title: string, ...tags: TestTagName[]): string {
  return `${tags.join(' ')} ${title}`;
}
