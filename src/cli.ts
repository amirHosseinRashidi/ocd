#!/usr/bin/env node
import { runPipeline } from './pipeline.js';
import type { CLIFlags, OCDReport } from './types.js';

function parseFlags(argv: string[]): CLIFlags {
  const flags: CLIFlags = {
    strict: false,
    json: false,
    fix: false,
    quiet: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--strict') flags.strict = true;
    else if (arg === '--json') flags.json = true;
    else if (arg === '--fix') flags.fix = true;
    else if (arg === '--quiet') flags.quiet = true;
    else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  return flags;
}

function printHelp() {
  console.log(`
OCD — Obsessive-Compulsive Verification Protocol (v1.0.0)
Author: AmirhosseinRashidi

USAGE
  $ ocd [flags]

FLAGS
  --strict    Fail process if any warnings are detected
  --json      Output raw machine-readable JSON report
  --fix       Attempt automatic remediation of clean-up issues
  --quiet     Suppress progress output
  -h, --help  Display this help manual

DESCRIPTION
  Runs the strict 4-phase code quality and verification pipeline:
  1. Cleanliness Audit (detects leftover debug code)
  2. Typecheck Verification (runs project typechecker)
  3. Test Suite Audit (runs project tests)
  4. Git Diff Inspection (verifies changed file bounds)
`);
}

function renderTerminalReport(report: OCDReport) {
  console.log('\n==================================================');
  console.log('  OCD — OBSESSIVE-COMPULSIVE VERIFICATION PROTOCOL');
  console.log('==================================================\n');

  for (const phase of report.phases) {
    const symbol = phase.passed ? '✓' : '✗';
    const statusText = phase.passed ? 'PASS' : 'FAIL';
    console.log(`[${statusText}] ${symbol} Phase: ${phase.phase.toUpperCase()} (${phase.durationMs}ms)`);

    if (phase.issues.length > 0) {
      for (const issue of phase.issues) {
        const prefix = issue.severity === 'error' ? '  ❌ [ERROR]' : '  ⚠ [WARN]';
        const loc = issue.file ? ` (${issue.file}:${issue.line || 1})` : '';
        console.log(`${prefix}${loc}: ${issue.message}`);
        if (issue.snippet) {
          console.log(`     > ${issue.snippet}`);
        }
      }
    }
  }

  console.log('\n--------------------------------------------------');
  console.log(`Summary: ${report.summaryMessage}`);
  console.log(`Errors: ${report.totalErrors} | Warnings: ${report.totalWarnings} | Strict: ${report.strictMode}`);
  console.log('--------------------------------------------------\n');
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  const report = await runPipeline(flags);

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    renderTerminalReport(report);
  }

  process.exit(report.overallPassed ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal OCD Execution Error:', err);
  process.exit(1);
});
