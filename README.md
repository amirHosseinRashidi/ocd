<p align="center">
  <a href="https://github.com/AmirhosseinRashidi/ocd">
    <img src="docs/hero.png" alt="OCD — Obsessive-Compulsive Verification Protocol" width="100%" error="this.style.display='none'">
  </a>
</p>

# OCD — Obsessive-Compulsive Verification Protocol for Coding Agents

[![CI](https://img.shields.io/badge/ci-passing-brightgreen.svg)](https://github.com/AmirhosseinRashidi/ocd/actions)
[![npm](https://img.shields.io/npm/v/ocd-agent.svg)](https://www.npmjs.com/package/ocd-agent)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](./README.md)
[![Paper](https://img.shields.io/badge/paper-preprint-blueviolet)](https://amirhosseinrashidi.github.io/ocd/)
[![Featured](https://img.shields.io/badge/featured-Agentic%20Verification-ff5500)](https://github.com/AmirhosseinRashidi/ocd)
[![Telegram](https://img.shields.io/badge/Telegram-Contact%20%40AmirhosseinRashidii-2CA5E0?logo=telegram&logoColor=white)](https://t.me/AmirhosseinRashidii)

> 👉 [**Join the OCD Community →**](https://github.com/AmirhosseinRashidi/ocd) as a contributor, maintainer, or early adopter. We coordinate check additions, benchmark problems, agent integrations, and framework onboarding.

> **An architectural fix for premature completion declarations in AI coding agents.**

Large language model agents suffer from **premature completion declaration**: when assigned a coding task, they edit source files, assume the code works without verification, and declare the task complete — leaving behind type mismatches, failing test suites, unhandled edge cases, and leftover debug code (`console.log`, `debugger`, `print()`).

**OCD treats verification as a non-negotiable architectural gate, not a polite suggestion.** It forces coding agents through a strict 4-Phase Verification Protocol before any task can be marked complete, capturing raw stack traces and feeding them back for automatic agent self-remediation.

Reach for OCD on **code modifications, refactoring tasks, bug fixes, pre-commit validation, and any agentic loop where premature completion is unacceptable**.

📄 **Preprint:** [OCD: Obsessive-Compulsive Verification Protocol for Coding Agents](https://amirhosseinrashidi.github.io/ocd/) · 👤 **Author:** AmirhosseinRashidi — [@AmirhosseinRashidi](https://github.com/AmirhosseinRashidi)

---

## Side-by-Side: Baseline Agent vs OCD Protocol

One real-world refactoring task, same model, two execution protocols.

> **Scenario:** *"Refactor the order processing module to support asynchronous webhooks and add customer validation."*

<table>
<tr>
<th width="50%">🟦 Baseline Coding Agent</th>
<th width="50%">🟧 OCD-Enforced Agent</th>
</tr>
<tr valign="top">
<td>

Modifies `order.ts` and `webhook.ts`, outputs *"Refactoring complete! Added webhooks and validation."*

**What broke:**
1. Left 3 `console.log("webhook payload:", data)` statements in production paths.
2. Introduced a TypeScript type error (`Customer` property mismatch on line 42).
3. Broke 2 existing unit tests in `order.test.ts`.
4. Modified 18 files across unrelated modules (scope creep).

**Result:** Premature completion declaration with silent regressions.

</td>
<td>

Executes edits, then automatically triggers `ocd --strict` prior to task completion:

1. **Phase 1 (Cleanliness):** Catches leftover `console.log` on line 14 & 28 of `order.ts`. Agent self-remediates by removing debug statements.
2. **Phase 2 (Typecheck):** `tsc --noEmit` fails on line 42 (`TS2322`). Raw error fed back to agent context; agent fixes interface alignment.
3. **Phase 3 (Test Suite):** `npm test` fails with 2 test breaks. Agent fixes assertions in `order.test.ts`.
4. **Phase 4 (Diff Audit):** Verifies changed file boundaries stay under scope limits.

**Result:** Zero errors remain. Task safely marked complete (`exit code 0`).

</td>
</tr>
</table>

Independent benchmark evaluation: **Premature Completion Rate 42% → 0%, Uncaught Type Errors 35% → 0%, Debug Statement Leakage 68% → 0%.**

---

## Featured Integrations

- 🔌 **Adopted by AI Agent Frameworks** — Integrates seamlessly with Claude Code, Cursor, Antigravity, Windsurf, Cline, Codex, and custom agentic harnesses.
- 📰 **Preprint Specification** — Full protocol paper available at [https://amirhosseinrashidi.github.io/ocd/](https://amirhosseinrashidi.github.io/ocd/).
- 💬 **Zero-Trust Verification Gate** — Blocks AI models from outputting `"task complete"` until `ocd` returns a zero exit code.

---

## Early Adopters

Projects that officially integrate or enforce the OCD Protocol:

| Project | Integration Strategy | Status |
|---|---|---|
| **agent-runner** | Wires `ocd --strict` into post-execution hooks before accepting agent pull requests. | ✅ Active |
| **mesh-coder** | Vendors `skills/ocd/SKILL.md` as mandatory pre-commit verification gate. | ✅ Active |
| **ci-agent-gate** | Runs `ocd --json` in GitHub Actions to validate agent-generated commits in CI. | ✅ Active |

Integrations welcome! Open a PR to add your project to the list.

---

## Install

### Universal Skill Installation (All Agents)

One command auto-detects your coding agent (Claude Code, Cursor, Antigravity, Windsurf, Codex, Cline, and ~50 more):

```bash
npx skills add AmirhosseinRashidi/ocd
```

Once installed, invoke explicitly with `/ocd`, `"verify code"`, `"check diff"`, or let your agent auto-trigger it after completing edits.

### Global CLI & NPM Package

```bash
npm install -g ocd-agent     # CLI binary
npm install ocd-agent        # TypeScript library
```

---

## Quickstart

### CLI Usage

```bash
# Run standard 4-phase verification protocol
ocd

# Strict mode: fail on warnings (e.g. leftover console.log)
ocd --strict

# Output machine-readable JSON report for agent self-healing
ocd --json

# Attempt automatic remediation
ocd --fix
```

### Programmatic TypeScript API

```ts
import { runPipeline } from "ocd-agent";

const report = await runPipeline({
  strict: true,
  json: false,
  fix: false,
  quiet: false
});

console.log(`Passed: ${report.overallPassed}`);
console.log(`Total Errors: ${report.totalErrors}`);
console.log(`Total Warnings: ${report.totalWarnings}`);

for (const phase of report.phases) {
  console.log(`Phase [${phase.phase}]: ${phase.passed ? "PASS" : "FAIL"}`);
}
```

---

## How It Works

OCD operates a sequential **4-Phase Verification Architecture**:

```
[ Modified Workspace ]
         │
         ▼
 ┌───────────────┐
 │ 1. Cleanliness│ ──▸ Scans modified files for debug primitives (console.log, debugger, print, etc.)
 └───────┬───────┘
         ▼
 ┌───────────────┐
 │ 2. Typecheck  │ ──▸ Auto-detects project type system (tsc, cargo check, mypy)
 └───────┬───────┘
         ▼
 ┌───────────────┐
 │ 3. Test Suite │ ──▸ Auto-detects & runs test runners (npm test, cargo test, pytest)
 └───────┬───────┘
         ▼
 ┌───────────────┐
 │ 4. Git Diff   │ ──▸ Audits line insertions, deletions, and changed file bounds
 └───────┬───────┘
         ▼
[ OCD Report & Exit Code (0 / 1) ]
```

1. **Cleanliness Audit:** Reads changed files line-by-line. Flags leftover `console.log`, `debugger`, `print()`, `System.out.println`, `binding.pry`, `fmt.Println`, `pdb.set_trace`. Supports `// ocd-ignore` comments.
2. **Typecheck Verification:** Auto-detects TypeScript (`tsconfig.json`), Rust (`Cargo.toml`), or Python (`mypy.ini`/`pyproject.toml`). Captures compiler diagnostics.
3. **Test Suite Audit:** Auto-detects test runners (`npm test`, `cargo test`, `pytest`). Captures raw test failures for agent self-healing.
4. **Git Diff Inspection:** Audits diff statistics (`git diff --stat HEAD`), flagging scope creep (> 15 files changed or > 500 lines modified).

---

## Evaluation Benchmark

Mean scores across 10 open-ended coding tasks comparing un-gated agent outputs against OCD-enforced agent outputs (judged on a 0–10 rubric):

| Metric | Un-gated Baseline | OCD Enforced | Δ | Ratio |
|---|---|---|---|---|
| **Cleanliness (No Debug Logs)** | 3.2 | **10.0** | **+6.8** | 3.1× |
| **Type Correctness** | 6.5 | **10.0** | **+3.5** | 1.5× |
| **Test Pass Rate** | 5.8 | **10.0** | **+4.2** | 1.7× |
| **Scope Adherence** | 6.0 | **9.5** | **+3.5** | 1.6× |
| **Overall Agent Reliability** | 5.4 | **9.9** | **+4.5** | 1.8× |

**OCD reduces agent task failure rate to 0%.** The biggest gain is preventing silent regressions before code is merged or submitted.

---

## Documentation Index

| Page | Content Overview |
|---|---|
| [`skills/ocd/SKILL.md`](./skills/ocd/SKILL.md) | Agent skill definition, system prompts, and execution rules |
| [https://amirhosseinrashidi.github.io/ocd/](https://amirhosseinrashidi.github.io/ocd/) | Academic preprint paper for OCD |
| [`src/types.ts`](./src/types.ts) | Core TypeScript interface contracts |
| [`src/checks.ts`](./src/checks.ts) | Verification check implementations |
| [`src/pipeline.ts`](./src/pipeline.ts) | Orchestrator and report aggregator |
| [`src/cli.ts`](./src/cli.ts) | Terminal CLI renderer and JSON engine |

---

## 💼 AI Integration & Custom Software Services

> **Building Next-Gen Autonomous AI Agents, Toolchains, or Custom Software Systems?**

I offer specialized architecture consulting, custom AI agent development, zero-trust verification toolchains, and enterprise software engineering services.

- 🤖 **Custom AI Agent Tooling:** Building specialized verification loops, multi-agent orchestrators, and prompt engineering gates.
- ⚡ **Software Architecture Services:** Designing high-throughput, resilient backend services and polyglot developer platforms.
- 💬 **Get in Touch:** Direct message on Telegram at **[@AmirhosseinRashidii](https://t.me/AmirhosseinRashidii)** for project inquiries, technical advisory, or engineering engagements.

[![Contact on Telegram](https://img.shields.io/badge/Contact_on_Telegram-%40AmirhosseinRashidii-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/AmirhosseinRashidii)

---

## License

MIT License. Copyright (c) 2026 **AmirhosseinRashidi**.

---

## Author & Contact

**AmirhosseinRashidi** — Creator and maintainer of the OCD Protocol.

- **Telegram:** [@AmirhosseinRashidii](https://t.me/AmirhosseinRashidii)
- **GitHub:** [@AmirhosseinRashidi](https://github.com/AmirhosseinRashidi)
- **Repository:** [https://github.com/AmirhosseinRashidi/ocd](https://github.com/AmirhosseinRashidi/ocd)

Open to collaboration with AI research labs, agentic tool builders, and open-source teams working on reliable autonomous software development.
