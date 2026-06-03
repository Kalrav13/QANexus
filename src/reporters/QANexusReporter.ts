import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

interface ExecutionStats {
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly total: number;
  readonly passPercentage: number;
}

const SUMMARY_BORDER = '=================================';

/**
 * Custom Playwright reporter — prints a QANexus execution summary after the run.
 * Counts final outcomes only (retries are not double-counted).
 */
export default class QANexusReporter implements Reporter {
  private rootSuite!: Suite;

  public onBegin(_config: FullConfig, suite: Suite): void {
    this.rootSuite = suite;
  }

  public onEnd(result: FullResult): void {
    const stats = this.aggregateStats(this.rootSuite);
    this.printSummary(stats, result.duration);
  }

  private aggregateStats(suite: Suite): ExecutionStats {
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    for (const test of suite.allTests()) {
      const outcome = this.resolveFinalStatus(test);
      switch (outcome) {
        case 'passed':
          passed += 1;
          break;
        case 'skipped':
          skipped += 1;
          break;
        case 'failed':
          failed += 1;
          break;
        default: {
          const exhaustive: never = outcome;
          throw new Error(`Unhandled test status: ${exhaustive}`);
        }
      }
    }

    const total = passed + failed + skipped;
    const passPercentage =
      total > 0 ? Number(((passed / total) * 100).toFixed(1)) : 0;

    return { passed, failed, skipped, total, passPercentage };
  }

  /** Uses the last test result so retries are counted once. */
  private resolveFinalStatus(test: TestCase): 'passed' | 'failed' | 'skipped' {
    const lastResult = test.results.at(-1);

    if (!lastResult) {
      return 'skipped';
    }

    return mapResultStatus(lastResult);
  }

  private printSummary(stats: ExecutionStats, durationMs: number): void {
    const lines = [
      SUMMARY_BORDER,
      'QANexus Execution Summary',
      SUMMARY_BORDER,
      '',
      `Passed: ${stats.passed}`,
      `Failed: ${stats.failed}`,
      `Skipped: ${stats.skipped}`,
      `Pass rate: ${stats.passPercentage}%`,
      `Duration: ${formatDuration(durationMs)}`,
      '',
      SUMMARY_BORDER,
    ];

    console.log(`\n${lines.join('\n')}\n`);
  }
}

function mapResultStatus(
  result: TestResult
): 'passed' | 'failed' | 'skipped' {
  switch (result.status) {
    case 'passed':
      return 'passed';
    case 'skipped':
      return 'skipped';
    case 'failed':
    case 'timedOut':
    case 'interrupted':
      return 'failed';
    default: {
      const exhaustive: never = result.status;
      throw new Error(`Unhandled Playwright result status: ${exhaustive}`);
    }
  }
}

function formatDuration(durationMs: number): string {
  const roundedMs = Math.round(durationMs);

  if (roundedMs < 1000) {
    return `${roundedMs}ms`;
  }

  const totalSeconds = Math.round(roundedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}
