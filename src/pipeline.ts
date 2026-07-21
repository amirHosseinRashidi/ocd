import type { CLIFlags, OCDReport, PhaseResult } from './types.js';
import {
  runCleanlinessCheck,
  runTypecheckCheck,
  runTestCheck,
  runDiffAuditCheck
} from './checks.js';

export async function runPipeline(flags: CLIFlags): Promise<OCDReport> {
  const cwd = flags.cwd || process.cwd();

  const cleanliness = await runCleanlinessCheck(cwd, flags);
  const typecheck = await runTypecheckCheck(cwd, flags);
  const testSuite = await runTestCheck(cwd, flags);
  const diffAudit = await runDiffAuditCheck(cwd, flags);

  const phases: PhaseResult[] = [cleanliness, typecheck, testSuite, diffAudit];

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const phase of phases) {
    for (const issue of phase.issues) {
      if (issue.severity === 'error') {
        totalErrors++;
      } else {
        totalWarnings++;
      }
    }
  }

  let overallPassed = totalErrors === 0;
  if (flags.strict && totalWarnings > 0) {
    overallPassed = false;
  }

  let summaryMessage = overallPassed
    ? 'Verification Protocol PASSED cleanly. Code is safe to finalize.'
    : `Verification Protocol FAILED with ${totalErrors} error(s) and ${totalWarnings} warning(s). Agent remediation required.`;

  return {
    timestamp: new Date().toISOString(),
    overallPassed,
    strictMode: flags.strict,
    totalErrors,
    totalWarnings,
    phases,
    summaryMessage
  };
}
