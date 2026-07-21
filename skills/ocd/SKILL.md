---
name: ocd
description: Obsessive-Compulsive Verification Protocol for coding agents. Mandates sequential 4-phase code verification (cleanliness, typecheck, test, git diff audit) before completing tasks. Triggers on /ocd, "verify code", "check diff", or pre-commit checks.
license: MIT
---

# OCD — Obsessive-Compulsive Verification Protocol

Author: amirHosseinRashidi

Prevent premature task completion by executing a strict, non-negotiable verification loop.

## Verification Rules for Agents

1. **Mandatory Execution:** Whenever code or documentation in a repository is modified, the coding agent MUST execute the `ocd` verification CLI before marking the task complete.
   
   Command: `npx ocd` or `ocd`

2. **Zero-Error Gate:** If `ocd` returns a non-zero exit code or reports `totalErrors > 0`, the agent CANNOT output "task complete".

3. **Self-Remediation Loop:**
   - Review raw stack traces and issues produced in the `ocd` output.
   - Apply fixes to resolve all identified type errors, failing tests, or leftover debug statements (`console.log`, `debugger`, `print()`).
   - Re-run `ocd` until all checks pass (`overallPassed: true`).

## The 4 Verification Phases

1. **Cleanliness Check:** Audits modified files for leftover debug artifacts.
2. **Typecheck Check:** Runs project typechecker (`tsc`, `cargo check`, `mypy`).
3. **Test Suite Check:** Executes test suite (`npm test`, `cargo test`, `pytest`).
4. **Git Diff Audit:** Verifies line count changes and guards against unintended scope creep.
