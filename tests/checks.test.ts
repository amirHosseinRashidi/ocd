import { test } from 'node:test';
import assert from 'node:assert';
import { runCleanlinessCheck, runDiffAuditCheck } from '../src/checks.js';

test('runCleanlinessCheck returns a PhaseResult', async () => {
  const res = await runCleanlinessCheck(process.cwd(), { strict: false, json: false, fix: false, quiet: true });
  assert.strictEqual(res.phase, 'cleanliness');
  assert.strictEqual(typeof res.passed, 'boolean');
});

test('runDiffAuditCheck returns a PhaseResult', async () => {
  const res = await runDiffAuditCheck(process.cwd(), { strict: false, json: false, fix: false, quiet: true });
  assert.strictEqual(res.phase, 'diff');
  assert.strictEqual(typeof res.passed, 'boolean');
});
