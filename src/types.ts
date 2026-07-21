export type PhaseName = 'cleanliness' | 'typecheck' | 'test' | 'diff';
export type Severity = 'warning' | 'error';

export interface Issue {
  file?: string;
  line?: number;
  message: string;
  severity: Severity;
  snippet?: string;
}

export interface PhaseResult {
  phase: PhaseName;
  passed: boolean;
  durationMs: number;
  issues: Issue[];
  rawOutput: string;
}

export interface OCDReport {
  timestamp: string;
  overallPassed: boolean;
  strictMode: boolean;
  totalErrors: number;
  totalWarnings: number;
  phases: PhaseResult[];
  summaryMessage: string;
}

export interface CLIFlags {
  strict: boolean;
  json: boolean;
  fix: boolean;
  quiet: boolean;
  cwd?: string;
}
