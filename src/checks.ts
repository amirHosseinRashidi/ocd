import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { CLIFlags, PhaseResult, Issue } from './types.js';

const execAsync = promisify(exec);

const DEBUG_PATTERNS = [
  { regex: /console\.log\s*\(/g, name: 'console.log' },
  { regex: /console\.error\s*\(/g, name: 'console.error' },
  { regex: /debugger;/g, name: 'debugger' },
  { regex: /print\s*\(/g, name: 'print()' },
  { regex: /System\.out\.println\s*\(/g, name: 'System.out.println' },
  { regex: /binding\.pry/g, name: 'binding.pry' },
  { regex: /fmt\.Println\s*\(/g, name: 'fmt.Println' },
  { regex: /import\s+pdb;\s*pdb\.set_trace\(\)/g, name: 'pdb.set_trace' }
];

export async function runCleanlinessCheck(cwd: string, flags: CLIFlags): Promise<PhaseResult> {
  const start = Date.now();
  const issues: Issue[] = [];
  let rawOutput = '';

  try {
    let stdout = '';
    try {
      const res = await execAsync('git diff --name-only HEAD', { cwd });
      stdout = res.stdout;
    } catch {
      const res = await execAsync('git diff --name-only', { cwd });
      stdout = res.stdout;
    }
    rawOutput = stdout;
    const modifiedFiles = stdout.split('\n').map(f => f.trim()).filter(Boolean);

    for (const relPath of modifiedFiles) {
      const fullPath = join(cwd, relPath);
      if (!existsSync(fullPath)) continue;
      try {
        const content = readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((lineText, idx) => {
          for (const pattern of DEBUG_PATTERNS) {
            if (pattern.regex.test(lineText)) {
              issues.push({
                file: relPath,
                line: idx + 1,
                message: `Leftover debug statement detected: ${pattern.name}`,
                severity: flags.strict ? 'error' : 'warning',
                snippet: lineText.trim()
              });
            }
          }
        });
      } catch {
        // Skip binary or unreadable files
      }
    }
  } catch (err: any) {
    rawOutput = err?.message || 'Git diff execution failed';
  }

  const durationMs = Date.now() - start;
  const hasErrors = issues.some(i => i.severity === 'error');
  return {
    phase: 'cleanliness',
    passed: !hasErrors,
    durationMs,
    issues,
    rawOutput
  };
}

export async function runTypecheckCheck(cwd: string, flags: CLIFlags): Promise<PhaseResult> {
  const start = Date.now();
  const issues: Issue[] = [];
  let rawOutput = '';
  let cmd = '';

  if (existsSync(join(cwd, 'tsconfig.json'))) {
    cmd = 'npx tsc --noEmit';
  } else if (existsSync(join(cwd, 'Cargo.toml'))) {
    cmd = 'cargo check';
  } else if (existsSync(join(cwd, 'pyproject.toml')) || existsSync(join(cwd, 'mypy.ini'))) {
    cmd = 'mypy .';
  }

  if (!cmd) {
    return {
      phase: 'typecheck',
      passed: true,
      durationMs: Date.now() - start,
      issues: [],
      rawOutput: 'No typecheck config detected (skipped).'
    };
  }

  let passed = true;
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd });
    rawOutput = stdout + '\n' + stderr;
  } catch (err: any) {
    passed = false;
    rawOutput = (err.stdout || '') + '\n' + (err.stderr || err.message || '');
    issues.push({
      message: `Typecheck failed (${cmd})`,
      severity: 'error',
      snippet: rawOutput.slice(0, 500)
    });
  }

  return {
    phase: 'typecheck',
    passed,
    durationMs: Date.now() - start,
    issues,
    rawOutput
  };
}

export async function runTestCheck(cwd: string, flags: CLIFlags): Promise<PhaseResult> {
  const start = Date.now();
  const issues: Issue[] = [];
  let rawOutput = '';
  let cmd = '';

  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      if (pkg.scripts && pkg.scripts.test && pkg.scripts.test !== 'echo "Error: no test specified" && exit 1') {
        cmd = 'npm test';
      }
    } catch {}
  }

  if (!cmd && existsSync(join(cwd, 'Cargo.toml'))) {
    cmd = 'cargo test';
  } else if (!cmd && (existsSync(join(cwd, 'pytest.ini')) || existsSync(join(cwd, 'conftest.py')))) {
    cmd = 'pytest';
  }

  if (!cmd) {
    return {
      phase: 'test',
      passed: true,
      durationMs: Date.now() - start,
      issues: [],
      rawOutput: 'No test runner configured (skipped).'
    };
  }

  let passed = true;
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd });
    rawOutput = stdout + '\n' + stderr;
  } catch (err: any) {
    passed = false;
    rawOutput = (err.stdout || '') + '\n' + (err.stderr || err.message || '');
    issues.push({
      message: `Test suite execution failed (${cmd})`,
      severity: 'error',
      snippet: rawOutput.slice(0, 800)
    });
  }

  return {
    phase: 'test',
    passed,
    durationMs: Date.now() - start,
    issues,
    rawOutput
  };
}

export async function runDiffAuditCheck(cwd: string, flags: CLIFlags): Promise<PhaseResult> {
  const start = Date.now();
  const issues: Issue[] = [];
  let rawOutput = '';

  try {
    let stdout = '';
    try {
      const res = await execAsync('git diff --stat HEAD', { cwd });
      stdout = res.stdout;
    } catch {
      const res = await execAsync('git diff --stat', { cwd });
      stdout = res.stdout;
    }
    rawOutput = stdout;

    const lines = stdout.trim().split('\n');
    const summaryLine = lines[lines.length - 1] || '';

    const match = summaryLine.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
    if (match) {
      const filesCount = parseInt(match[1] || '0', 10);
      const insertions = parseInt(match[2] || '0', 10);
      const deletions = parseInt(match[3] || '0', 10);

      if (filesCount > 15) {
        issues.push({
          message: `Scope Warning: Large number of modified files (${filesCount} files)`,
          severity: flags.strict ? 'error' : 'warning'
        });
      }
      if (insertions + deletions > 500) {
        issues.push({
          message: `Scope Warning: Large diff size (+${insertions}/-${deletions} lines)`,
          severity: flags.strict ? 'error' : 'warning'
        });
      }
    }
  } catch (err: any) {
    rawOutput = err?.message || 'Git stat check failed';
  }

  const hasErrors = issues.some(i => i.severity === 'error');
  return {
    phase: 'diff',
    passed: !hasErrors,
    durationMs: Date.now() - start,
    issues,
    rawOutput
  };
}
