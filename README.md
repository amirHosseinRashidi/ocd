# OCD — Obsessive-Compulsive Verification Protocol

> **Author:** amirHosseinRashidi  
> **Repository:** https://github.com/amirHosseinRashidi/ocd

A strict, zero-friction verification engine designed for AI coding agents to eliminate premature completion declarations.

## Features

- **4-Phase Sequential Audit:** Cleanliness, Typecheck, Test Suite, Git Diff.
- **Auto-Detection:** Detects TypeScript (`tsc`), Rust (`cargo`), and Python (`mypy`/`pytest`).
- **Agent Self-Healing:** Emits structured machine-readable JSON or visual terminal stack traces.

## Quick Start

```bash
npm install -g ocd-agent
ocd
```

Flags:
- `--strict`: Fail on warnings as well as errors.
- `--json`: Output machine-readable JSON.
- `--fix`: Attempt auto-remediation.
