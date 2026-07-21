import { test } from 'node:test';
import assert from 'node:assert';
import { runPipeline } from '../src/pipeline.js';

test('runPipeline returns a structured OCDReport with 4 phases', async () => {
  const report = await runPipeline({ strict: false, json: false, fix: false, quiet: true });
  assert.strictEqual(report.phases.length, 4);
  assert.strictEqual(typeof report.overallPassed, 'boolean');
  assert.strictEqual(typeof report.totalErrors, 'number');
});
