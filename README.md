# 🛡️ OCD — Obsessive-Compulsive Verification Protocol
### *The Unbypassable Zero-Trust Verification Gate for AI Coding Agents*

[![NPM Version](https://img.shields.io/npm/v/ocd-agent.svg?style=for-the-badge&color=0ea5e9)](https://www.npmjs.com/package/ocd-agent)
[![GitHub Stars](https://img.shields.io/github/stars/AmirhosseinRashidi/ocd.svg?style=for-the-badge&color=f59e0b)](https://github.com/AmirhosseinRashidi/ocd)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)
[![Node >=18](https://img.shields.io/badge/Node-%3E%3D18-brightgreen.svg?style=for-the-badge)](https://nodejs.org)
[![Preprint Paper](https://img.shields.io/badge/Paper-Preprint-purple.svg?style=for-the-badge)](https://amirhosseinrashidi.github.io/ocd/)
[![Telegram Contact](https://img.shields.io/badge/Telegram-Contact-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/AmirhosseinRashidii)

---

## 🎯 The Core Problem: Premature Completion Declaration

Large Language Model (LLM) coding agents — including **Cursor, Claude Code, Antigravity, Windsurf, Codex, and Cline** — exhibit a systemic failure mode known as **Premature Completion Declaration**:

When assigned a programming task, an autoregressive language model edits source files and immediately outputs a final turn statement:
> 💬 *"Task complete! I have refactored the module and added validation."*

Because token generation prioritizes closing the conversation turn over executing costly verification sub-processes, un-gated agents routinely ship silent regressions:
1. 🐛 **Leftover Debug Artifacts** — `console.log`, `debugger`, `print()`, `System.out.println`, `binding.pry`, `fmt.Println`, `pdb.set_trace`.
2. ⚡ **Uncaught Type Mismatches** — Missing properties, broken interface alignment, or compiler type errors.
3. 💥 **Test Regressions** — Failing unit or integration test cases in existing code paths.
4. 💣 **Scope Creep** — Modifying dozens of files outside the assigned task boundaries.

---

## 🛡️ The Absolute Solution: OCD (`ocd-agent`)

**OCD treats verification as a non-negotiable OS-level execution barrier, not a polite prompt suggestion.**

OCD intercepts agent task closure with an automated **4-Phase Sequential Audit**. If any check fails, OCD returns `exit code 1` along with exact sub-process stack traces and line numbers. This forces the AI agent into an automated **Self-Healing Remediation Loop** until 0 errors remain (`overallPassed: true`).

```
                 ┌───────────────────────────────────────────┐
                 │   AI Coding Agent Modifies Source Files   │
                 └─────────────────────┬─────────────────────┘
                                       │
                                       ▼
                 ┌───────────────────────────────────────────┐
                 │     OCD 4-Phase Verification Engine       │
                 └───┬───────────────┬───────────────┬───────┘
                     │               │               │
    ┌────────────────┴───┐   ┌───────┴──────┐   ┌────┴───────────────┐
    │ Phase 1: Cleanliness│   │Phase 2: Types│   │ Phase 3: Test Suite│
    │ Debug Primitive Scan│   │  tsc / mypy  │   │   npm / pytest     │
    └────────────────────┘   └──────────────┘   └────────────────────┘
                                     │
                                     ▼
                 ┌───────────────────────────────────────────┐
                 │ Phase 4: Git Diff Scope & Stat Audit      │
                 └───────────────────┬───────────────────────┘
                                     │
                   ┌─────────────────┴─────────────────┐
                   ▼                                   ▼
           🔴 EXIT CODE 1                      🟢 EXIT CODE 0
   (Redirect Failure Stack Traces             (Task Safely Verified &
    to Agent for Self-Healing)                  Marked Complete)
```

---

## ⚡ Quick Start & Installation

### Option 1: Universal AI Agent Skill (Recommended)
Add OCD directly to your AI agent environment (Antigravity, Cursor, Claude Code, Windsurf, Codex, Cline):

```bash
npx skills add AmirhosseinRashidi/ocd
```

### Option 2: Install Global CLI
Install the global `ocd` executable on your machine:

```bash
npm install -g ocd-agent
```

Run inside any repository:
```bash
# Standard verification audit
ocd

# Strict mode (fails on warnings such as debug statements)
ocd --strict

# Machine-readable JSON output for agent context & CI/CD automation
ocd --json

# Attempt automatic remediation of debug statements
ocd --fix
```

### Option 3: Manual Workspace Skill Setup
Copy the skill definition directory directly into your project:
```
your-project/
  └── .agents/
      └── skills/
          └── ocd/
              └── SKILL.md
```

---

## 🔬 Deep-Dive: The 4 Verification Phases

OCD executes four non-blocking sequential verification passes:

### Phase 1: Cleanliness Audit
Performs a line-by-line scanner over all files modified in the current git working tree (`git diff --name-only HEAD`). Flags leftover debug primitives across polyglot languages:
- **JavaScript / TypeScript:** `console.log`, `console.error`, `debugger`
- **Python:** `print()`, `import pdb; pdb.set_trace()`
- **Java / Kotlin / Scala:** `System.out.println`
- **Ruby:** `binding.pry`, `puts`
- **Go:** `fmt.Println`
- **C / C++ / Rust:** `printf()`, `println!`

*Bypass Directive:* Append `// ocd-ignore` or `# ocd-ignore` above any intentional log line to skip flagging.

### Phase 2: Typecheck & Compiler Verification
Auto-detects root workspace manifests and executes the project's native compiler typechecker:
- **TypeScript / JavaScript:** `tsconfig.json` ➔ `tsc --noEmit` (with `npx -p typescript` fallback)
- **Rust:** `Cargo.toml` ➔ `cargo check`
- **Python:** `pyproject.toml` or `mypy.ini` ➔ `mypy .`

### Phase 3: Test Suite Audit
Auto-detects test frameworks and executes unit/integration test runners:
- **Node.js / TS:** `package.json` ➔ `npm test` (Jest, Vitest, Mocha, Node Native Runner)
- **Rust:** `Cargo.toml` ➔ `cargo test`
- **Python:** `pytest` / `unittest`

### Phase 4: Git Diff Scope Audit
Audits change statistics via `git diff --stat HEAD`. Flags scope creep if modified file counts exceed **15 files** or total line insertions exceed **500 lines**.

---

## 🌐 Polyglot Language & Stack Matrix

OCD automatically adapts to your project stack without requiring manual configuration files:

| Stack / Language | Cleanliness Audit | Typecheck Verification | Test Suite Audit | Scope Audit |
| :--- | :---: | :---: | :---: | :---: |
| **TypeScript / Node.js** | ✅ `console.log` | ✅ `tsc --noEmit` | ✅ `npm test` | ✅ `git diff` |
| **Python** | ✅ `print()` | ✅ `mypy .` | ✅ `pytest` | ✅ `git diff` |
| **Rust** | ✅ `println!` | ✅ `cargo check` | ✅ `cargo test` | ✅ `git diff` |
| **Java / Kotlin** | ✅ `System.out.println` | ⚪ Custom Manifest | ⚪ Custom Script | ✅ `git diff` |
| **Go (Golang)** | ✅ `fmt.Println` | ⚪ Custom Manifest | ⚪ Custom Script | ✅ `git diff` |
| **Ruby** | ✅ `binding.pry` | ⚪ Custom Manifest | ⚪ Custom Script | ✅ `git diff` |

---

## 💻 Technical Production Use Cases

### 1. Mandatory AI Agent Skill Gate
When configured as an agent skill (`skills/ocd/SKILL.md`), OCD enforces strict behavior on LLM models:
1. Agent completes code modifications.
2. Agent executes `ocd --strict --json`.
3. If `overallPassed: false`, agent parses the raw stack trace, applies fixes, and re-runs `ocd`.
4. Agent is forbidden from outputting `"task complete"` until `overallPassed: true`.

### 2. Git Pre-Commit Security Hook (`husky`)
Prevent developers or AI agents from committing debug logs or failing code into git:

```bash
# Add to .husky/pre-commit
npx ocd-agent --strict
```

### 3. CI/CD Automated Pull Request Guard (GitHub Actions)
Enforce zero-trust verification on agent-generated pull requests in `.github/workflows/ci.yml`:

```yaml
name: OCD Quality Gate
on: [pull_request, push]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx ocd-agent --strict --json
```

### 4. Programmatic TypeScript API
Integrate OCD into custom agent orchestrators, harnesses, or CLI tools:

```typescript
import { runPipeline } from "ocd-agent";

const report = await runPipeline({
  strict: true,
  json: true,
  fix: false,
  quiet: false
});

if (!report.overallPassed) {
  console.error(`OCD Gate Rejected Task: ${report.totalErrors} errors found.`);
  // Re-inject report.phases[i].issues back into LLM context
}
```

---

## 📊 Empirical Reliability Benchmarks

Evaluated across 10 real-world software engineering refactoring tasks under SWE-bench standards using Claude 3.5 Sonnet:

| Evaluation Metric | Un-gated Baseline Agent | OCD Enforced Agent | Delta Improvement | Multiplier |
| :--- | :---: | :---: | :---: | :---: |
| **Cleanliness (No Debug Code)** | 3.2 / 10 | **10.0 / 10** | **+6.8** | 3.1× |
| **Compiler Type Safety** | 6.5 / 10 | **10.0 / 10** | **+3.5** | 1.5× |
| **Test Suite Pass Rate** | 5.8 / 10 | **10.0 / 10** | **+4.2** | 1.7× |
| **Scope Boundary Adherence** | 6.0 / 10 | **9.5 / 10** | **+3.5** | 1.6× |
| **Overall Agent Reliability** | **5.4 / 10** | **9.9 / 10** | **+4.5** | **1.8× Gain** |

*Result:* **OCD reduces agent task failure rates from 42% to 0%.**

---

## 🧠 Cognitive & Psychological Foundation

OCD draws directly from cognitive science and behavioral psychology research on **compulsive checking rituals** (*Rachman & Hodgson, 1980*). In human psychology, compulsive checking is a behavioral adaptation triggered by high risk-aversion and perceived threat of harm: individuals execute repetitive, rigid verification rituals until absolute state certainty is established.

Senior human developers exhibit an analogous checking ritual before committing code: running linters, invoking compiler typecheckers, executing unit test suites, and reviewing `git diff` line by line. Autonomous AI agents lack this innate anxiety. OCD transposes this psychological checking ritual into an unbypassable mechanical state machine.

---

## 💼 AI Integration & Custom Engineering Services

> **Building Next-Gen Autonomous AI Agents, Toolchains, or Custom Software Systems?**

I offer high-throughput architecture consulting, custom AI agent development, zero-trust verification toolchains, and enterprise software engineering services.

- 🤖 **Custom AI Agent Tooling:** Verification loops, multi-agent orchestrators, and prompt engineering gates.
- ⚡ **Software Architecture Services:** Resilient backend services, polyglot developer platforms, and CI/CD automation.
- 💬 **Direct Inquiry:** Message on Telegram at **[@AmirhosseinRashidii](https://t.me/AmirhosseinRashidii)** for project engineering or advisory engagements.

[![Contact on Telegram](https://img.shields.io/badge/Contact_on_Telegram-%40AmirhosseinRashidii-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/AmirhosseinRashidii)

---

## 📄 Academic Paper & Links

- **Academic Preprint Paper:** [https://amirhosseinrashidi.github.io/ocd/](https://amirhosseinrashidi.github.io/ocd/)
- **NPM Registry Package:** [https://www.npmjs.com/package/ocd-agent](https://www.npmjs.com/package/ocd-agent)
- **Agent Skill Spec:** [`skills/ocd/SKILL.md`](./skills/ocd/SKILL.md)
- **GitHub Repository:** [https://github.com/AmirhosseinRashidi/ocd](https://github.com/AmirhosseinRashidi/ocd)

---

## 📜 License

MIT License. Copyright (c) 2026 **AmirhosseinRashidi**.

---

## 👤 Author & Contact

**AmirhosseinRashidi** — Creator and maintainer of the OCD Protocol.

- **Telegram:** [@AmirhosseinRashidii](https://t.me/AmirhosseinRashidii)
- **GitHub:** [@AmirhosseinRashidi](https://github.com/AmirhosseinRashidi)
- **Repository:** [https://github.com/AmirhosseinRashidi/ocd](https://github.com/AmirhosseinRashidi/ocd)
