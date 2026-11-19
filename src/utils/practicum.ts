import type { AuditScenario, DiagScenario, HypothesisId } from '../data/practicum/types';

// ---------------- Діагностика ----------------
export const DIAG_MAX = 8;

export interface DiagAnswer {
  hypothesis: HypothesisId | '';
  fert: string; // id добрива/вапнувального матеріалу або ''
  rationale: string[]; // id обраних тверджень
  hintsUsed: number;
}

export interface DiagResult {
  hypothesisPts: number; // 0 | 2 | 3
  fertPts: number; // 0..3
  rationalePts: number; // 0..2
  hintPenalty: number;
  total: number;
  max: number;
  mistakes: string[];
  correctRationaleMissed: number;
  wrongRationaleChosen: number;
}

export function scoreDiagnosis(s: DiagScenario, a: DiagAnswer): DiagResult {
  const hypothesisPts = a.hypothesis === s.primary ? 3 : a.hypothesis !== '' && s.acceptable.includes(a.hypothesis) ? 2 : 0;
  const fertPts = a.fert ? (s.fert[a.fert] ?? 0) : 0;
  let raw = 0;
  let wrong = 0;
  let right = 0;
  for (const r of s.rationale) {
    const chosen = a.rationale.includes(r.id);
    if (chosen && r.correct) { raw += 1; right++; }
    if (chosen && !r.correct) { raw -= 1; wrong++; }
  }
  const missed = s.rationale.filter((r) => r.correct).length - right;
  const rationalePts = Math.min(2, Math.max(0, raw));
  const hintPenalty = Math.min(2, Math.max(0, a.hintsUsed));
  const total = Math.max(0, hypothesisPts + fertPts + rationalePts - hintPenalty);

  const mistakes: string[] = [];
  if (hypothesisPts === 0) mistakes.push('hypothesis');
  else if (hypothesisPts < 3) mistakes.push('hypothesis-partial');
  if (fertPts === 0) mistakes.push('fertilizer');
  else if (fertPts < 3) mistakes.push('fertilizer-partial');
  if (wrong > 0) mistakes.push('rationale-wrong');
  if (rationalePts < 2 && wrong === 0) mistakes.push('rationale-missed');
  return { hypothesisPts, fertPts, rationalePts, hintPenalty, total, max: DIAG_MAX, mistakes, correctRationaleMissed: missed, wrongRationaleChosen: wrong };
}

// ---------------- Аудит ----------------
export interface AuditAnswer {
  marked: string[]; // id фрагментів
  mechanism: Record<string, number | undefined>; // errorId → індекс варіанта
  alternative: Record<string, number | undefined>;
}

export interface AuditResult {
  found: number;
  missed: number;
  falsePositives: number;
  mechanismOk: number;
  alternativeOk: number;
  total: number;
  max: number;
  mistakes: string[];
}

export function scoreAudit(s: AuditScenario, a: AuditAnswer): AuditResult {
  const errorFragments = s.fragments.filter((f) => f.errorId);
  const errorIds = new Set(errorFragments.map((f) => f.id));
  const marked = new Set(a.marked);
  const foundFragments = errorFragments.filter((f) => marked.has(f.id));
  const falsePositives = a.marked.filter((id) => !errorIds.has(id)).length;
  let mechanismOk = 0;
  let alternativeOk = 0;
  for (const f of foundFragments) {
    const e = s.errors.find((x) => x.id === f.errorId);
    if (!e) continue;
    if (a.mechanism[e.id] === e.mechanism.correct) mechanismOk++;
    if (a.alternative[e.id] === e.alternative.correct) alternativeOk++;
  }
  const found = foundFragments.length;
  const missed = errorFragments.length - found;
  const max = errorFragments.length * 3;
  const total = Math.max(0, found + mechanismOk + alternativeOk - falsePositives);
  const mistakes: string[] = [];
  if (falsePositives > 0) mistakes.push('falsePositive');
  if (missed > 0) mistakes.push('missedError');
  if (mechanismOk < found) mistakes.push('mechanism');
  if (alternativeOk < found) mistakes.push('alternative');
  return { found, missed, falsePositives, mechanismOk, alternativeOk, total, max, mistakes };
}
