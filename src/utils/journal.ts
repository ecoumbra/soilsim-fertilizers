export type PModule = 'diagnosis' | 'detective' | 'audit';
export const MODULES: PModule[] = ['diagnosis', 'detective', 'audit'];

export interface Attempt {
  id: string;
  module: PModule;
  scenarioId: string;
  ts: string; // ISO
  score: number;
  max: number;
  hints: number;
  tests: number;
  mistakes: string[];
}

export interface JournalFile {
  app: 'soilsim-fertilizers';
  version: 1;
  exported: string;
  attempts: Attempt[];
}

export function makeAttempt(
  p: Omit<Attempt, 'id' | 'ts'>,
  now: Date = new Date(),
  rnd: () => number = Math.random,
): Attempt {
  const ts = now.toISOString();
  return { ...p, ts, id: `${ts}:${p.module}:${p.scenarioId}:${Math.floor(rnd() * 1e6).toString(36)}` };
}

export function ratio(a: Attempt): number {
  return a.max > 0 ? a.score / a.max : 0;
}

export function bestByScenario(attempts: Attempt[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of attempts) {
    const k = `${a.module}:${a.scenarioId}`;
    out[k] = Math.max(out[k] ?? 0, ratio(a));
  }
  return out;
}

export interface ModuleSummary { attempts: number; scenarios: number; best: number; average: number }

export function summarize(attempts: Attempt[]): Record<PModule, ModuleSummary> {
  const out = {} as Record<PModule, ModuleSummary>;
  for (const m of MODULES) {
    const list = attempts.filter((a) => a.module === m);
    const ids = new Set(list.map((a) => a.scenarioId));
    out[m] = {
      attempts: list.length,
      scenarios: ids.size,
      best: list.reduce((b, a) => Math.max(b, ratio(a)), 0),
      average: list.length ? list.reduce((s, a) => s + ratio(a), 0) / list.length : 0,
    };
  }
  return out;
}

export function attemptsCount(attempts: Attempt[], module: PModule, scenarioId: string): number {
  return attempts.filter((a) => a.module === module && a.scenarioId === scenarioId).length;
}

const esc = (v: string | number) => {
  const s = String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(attempts: Attempt[]): string {
  const head = ['timestamp', 'module', 'scenario', 'score', 'max', 'percent', 'hints', 'tests', 'mistakes'];
  const rows = attempts.map((a) =>
    [a.ts, a.module, a.scenarioId, a.score, a.max, Math.round(ratio(a) * 100), a.hints, a.tests, a.mistakes.join(';')].map(esc).join(','),
  );
  return [head.join(','), ...rows].join('\n');
}

export function toJson(attempts: Attempt[], now: Date = new Date()): string {
  const file: JournalFile = { app: 'soilsim-fertilizers', version: 1, exported: now.toISOString(), attempts };
  return JSON.stringify(file, null, 2);
}

function isAttempt(x: unknown): x is Attempt {
  if (typeof x !== 'object' || x === null) return false;
  const a = x as Record<string, unknown>;
  return (
    typeof a.id === 'string' && typeof a.ts === 'string' && typeof a.scenarioId === 'string' &&
    (a.module === 'diagnosis' || a.module === 'detective' || a.module === 'audit') &&
    typeof a.score === 'number' && typeof a.max === 'number' && a.max >= 0 && a.score >= 0 &&
    typeof a.hints === 'number' && typeof a.tests === 'number' &&
    Array.isArray(a.mistakes) && a.mistakes.every((m) => typeof m === 'string')
  );
}

export function parseJournal(text: string): { ok: true; attempts: Attempt[] } | { ok: false; error: 'json' | 'format' } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'json' };
  }
  if (typeof data !== 'object' || data === null) return { ok: false, error: 'format' };
  const f = data as Record<string, unknown>;
  if (f.app !== 'soilsim-fertilizers' || f.version !== 1 || !Array.isArray(f.attempts)) return { ok: false, error: 'format' };
  if (!f.attempts.every(isAttempt)) return { ok: false, error: 'format' };
  return { ok: true, attempts: f.attempts as Attempt[] };
}

/** Об’єднання без дублів за id; результат упорядковано за часом. */
export function mergeAttempts(existing: Attempt[], incoming: Attempt[]): Attempt[] {
  const map = new Map<string, Attempt>();
  for (const a of [...existing, ...incoming]) map.set(a.id, a);
  return Array.from(map.values()).sort((x, y) => x.ts.localeCompare(y.ts));
}
