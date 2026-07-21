import { test } from 'node:test';
import assert from 'node:assert';
import type { OCDReport, PhaseResult } from '../src/types.js';

test('OCDReport structure validity', () => {
  const result: PhaseResult = {
    phase: 'cleanliness',
    passed: true,
    durationMs: 45,
    issues: [],
    rawOutput: 'Clean'
  };
  const report: OCDReport = {
    timestamp: new Date().toISOString(),
    overallPassed: true,
    strictMode: false,
    totalErrors: 0,
    totalWarnings: 0,
    phases: [result],
    summaryMessage: 'Verification passed cleanly.'
  };
  assert.strictEqual(report.overallPassed, true);
  assert.strictEqual(report.phases.length, 1);
});
