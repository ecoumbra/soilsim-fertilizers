/**
 * Балансир тукосумішей. Детермінований розв'язувач без випадкового підбору.
 *
 * Задача: знайти маси m_i ≥ 0 компонентів, щоб у суміші масою B кг:
 *   Σ m_i · c_ij / 100 = t_j · B / 100   (j = N, P₂O₅, K₂O),
 *   Σ m_i + m_наповнювача = B,  m_наповнювача ≥ 0.
 * Усі допустимі «вершини» (базові розв'язки) знаходяться перебором підмножин
 * з розв'язанням лінійної системи методом Гаусса.
 */

export type NutrientName = 'N' | 'P2O5' | 'K2O';
export const NUTRIENT_NAMES: NutrientName[] = ['N', 'P2O5', 'K2O'];

export interface MixComponent { id: string; N: number; P2O5: number; K2O: number }
export interface Target { N: number; P2O5: number; K2O: number }

export interface MixSolution {
  masses: Record<string, number>; // кг, лише ненульові компоненти
  filler: number; // кг наповнювача (баласту)
  total: number; // кг усіх компонентів без наповнювача
  composition: Target; // фактичний склад суміші, %
  support: string[]; // id компонентів у розв'язку
}

export type NoSolutionReason = 'over-concentrated' | 'missing-nutrient' | 'infeasible';

export interface SolveResult {
  solutions: MixSolution[];
  reason?: NoSolutionReason;
  /** мінімальна маса компонентів (кг), потрібна для цілі без обмеження по масі суміші */
  requiredMass?: number;
  missing?: NutrientName[];
}

const EPS = 1e-9;

/** Розв'язує A·x = b (A: R×k, R ≥ k) методом Гаусса; null, якщо стовпці залежні або система неспільна. */
export function solveSystem(A: number[][], b: number[]): number[] | null {
  const R = A.length;
  const k = A[0].length;
  const M = A.map((row, i) => [...row, b[i]]);
  const scale = 1 + Math.max(...b.map(Math.abs));
  let row = 0;
  for (let col = 0; col < k; col++) {
    let p = row;
    for (let r = row + 1; r < R; r++) if (Math.abs(M[r][col]) > Math.abs(M[p][col])) p = r;
    if (Math.abs(M[p][col]) < 1e-12) return null;
    [M[row], M[p]] = [M[p], M[row]];
    for (let r = 0; r < R; r++) {
      if (r === row) continue;
      const f = M[r][col] / M[row][col];
      if (f !== 0) for (let c = col; c <= k; c++) M[r][c] -= f * M[row][c];
    }
    row++;
  }
  for (let r = k; r < R; r++) if (Math.abs(M[r][k]) > 1e-7 * scale) return null;
  return Array.from({ length: k }, (_, i) => M[i][k] / M[i][i]);
}

function* combinations(n: number, maxSize: number): Generator<number[]> {
  const idx: number[] = [];
  function* rec(start: number): Generator<number[]> {
    if (idx.length > 0) yield [...idx];
    if (idx.length === maxSize) return;
    for (let i = start; i < n; i++) {
      idx.push(i);
      yield* rec(i + 1);
      idx.pop();
    }
  }
  yield* rec(0);
}

function composition(masses: Record<string, number>, comps: MixComponent[], B: number): Target {
  const out: Target = { N: 0, P2O5: 0, K2O: 0 };
  for (const c of comps) {
    const m = masses[c.id] ?? 0;
    for (const n of NUTRIENT_NAMES) out[n] += (m * c[n]) / B;
  }
  return out;
}

export function validateTarget(t: Target): boolean {
  return NUTRIENT_NAMES.every((n) => Number.isFinite(t[n]) && t[n] >= 0) && t.N + t.P2O5 + t.K2O <= 100;
}

/** Мінімальна маса компонентів, що дає точно цільові кількості поживних речовин (без обмеження Σ ≤ B). */
export function minimalMass(comps: MixComponent[], target: Target, B: number): number | null {
  const rows = NUTRIENT_NAMES.map((n) => comps.map((c) => c[n] / 100));
  const rhs = NUTRIENT_NAMES.map((n) => (target[n] * B) / 100);
  let best: number | null = null;
  for (const subset of combinations(comps.length, 3)) {
    const A = rows.map((r) => subset.map((i) => r[i]));
    const x = solveSystem(A, rhs);
    if (!x || x.some((v) => v <= EPS)) continue;
    const total = x.reduce((s, v) => s + v, 0);
    if (best === null || total < best) best = total;
  }
  return best;
}

export function solveMixture(comps: MixComponent[], target: Target, B = 100): SolveResult {
  if (!(B > 0)) throw new RangeError('Base mass must be positive');
  if (!validateTarget(target)) throw new RangeError('Invalid target');
  const needed = NUTRIENT_NAMES.filter((n) => target[n] > 0);

  if (needed.length === 0) {
    return { solutions: [{ masses: {}, filler: B, total: 0, composition: { N: 0, P2O5: 0, K2O: 0 }, support: [] }] };
  }

  const missing = needed.filter((n) => !comps.some((c) => c[n] > 0));
  if (missing.length > 0) return { solutions: [], reason: 'missing-nutrient', missing };

  // стовпці: компоненти + наповнювач
  const n = comps.length;
  const col = (i: number): number[] =>
    i < n ? [comps[i].N / 100, comps[i].P2O5 / 100, comps[i].K2O / 100, 1] : [0, 0, 0, 1];
  const rhs = [(target.N * B) / 100, (target.P2O5 * B) / 100, (target.K2O * B) / 100, B];

  const solutions: MixSolution[] = [];
  for (const subset of combinations(n + 1, 4)) {
    const cols = subset.map(col);
    const A = [0, 1, 2, 3].map((r) => cols.map((c) => c[r]));
    const x = solveSystem(A, rhs);
    if (!x || x.some((v) => v <= EPS)) continue;
    const masses: Record<string, number> = {};
    let filler = 0;
    subset.forEach((ci, j) => {
      if (ci < n) masses[comps[ci].id] = x[j];
      else filler = x[j];
    });
    const total = Object.values(masses).reduce((s, v) => s + v, 0);
    solutions.push({ masses, filler, total, composition: composition(masses, comps, B), support: Object.keys(masses) });
  }

  solutions.sort((a, b) => a.support.length - b.support.length || a.filler - b.filler || a.total - b.total);
  if (solutions.length > 0) return { solutions };

  const req = minimalMass(comps, target, B);
  if (req !== null && req > B + 1e-7) return { solutions: [], reason: 'over-concentrated', requiredMass: req };
  return { solutions: [], reason: 'infeasible' };
}

export interface MixItem extends MixComponent { mass: number }

export interface MixComposition {
  total: number;
  kg: Target;
  percent: Target;
  shares: { id: string; mass: number; percent: number }[];
}

/** Склад суміші за масами компонентів (вільне конструювання). */
export function mixtureComposition(items: MixItem[]): MixComposition {
  const total = items.reduce((s, i) => s + i.mass, 0);
  const kg: Target = { N: 0, P2O5: 0, K2O: 0 };
  for (const it of items) for (const n of NUTRIENT_NAMES) kg[n] += (it.mass * it[n]) / 100;
  const percent: Target = {
    N: total > 0 ? (kg.N / total) * 100 : 0,
    P2O5: total > 0 ? (kg.P2O5 / total) * 100 : 0,
    K2O: total > 0 ? (kg.K2O / total) * 100 : 0,
  };
  return {
    total,
    kg,
    percent,
    shares: items.map((i) => ({ id: i.id, mass: i.mass, percent: total > 0 ? (i.mass / total) * 100 : 0 })),
  };
}
