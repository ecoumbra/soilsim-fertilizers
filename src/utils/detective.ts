import type { Fertilizer } from '../data/types';
import { FERTILIZERS } from '../data/fertilizers';
import type { PLevel } from '../data/practicum/types';

/**
 * «Лабораторний детектив»: результати досліджень ОБЧИСЛЮЮТЬСЯ з іонного складу й властивостей
 * добрива в базі, а не прописані вручну. Тести лише для якісного аналізу; жодних кількісних даних.
 */
export type TestId = 'hcl' | 'water' | 'naoh-heat' | 'nessler' | 'agno3' | 'bacl2' | 'molybdate' | 'flame';
/** Канонічний порядок (кислота — першою, бо розчиняє нерозчинні проби для іонних тестів). */
export const TEST_ORDER: TestId[] = ['hcl', 'water', 'naoh-heat', 'nessler', 'agno3', 'bacl2', 'molybdate', 'flame'];

export type ResultKind =
  | 'positive' | 'weak' | 'slow' | 'negative'
  | 'dissolves' | 'partial' | 'insoluble' | 'miscible' | 'unknown'
  | 'effervescence' | 'weak-effervescence' | 'no-reaction' | 'not-dissolved' | 'dissolves-acid';

export interface Obs { result: ResultKind; colors?: string[] }

/** Проби без надійних даних про склад чи форму виключено (газ, марки з невідомим складом, шлаки, калійна сіль 40 %). */
const EXCLUDED = new Set(['anhydrous-ammonia', 'nitroammophoska', 'thomas-slag', 'open-hearth-slag', 'potassium-salt-40']);
export const POOL: Fertilizer[] = FERTILIZERS.filter((f) => !EXCLUDED.has(f.id));

const PARTIAL_WATER = new Set(['simple-superphosphate']); // містить малорозчинний гіпс (дані автора)
const WEAK_CARBONATE = new Set(['rock-phosphate']); // домішки CaCO₃ 10–15 % (дані автора)

const hasCation = (f: Fertilizer, c: string) => f.ions.cations.includes(c);
const hasAnion = (f: Fertilizer, test: (a: string) => boolean) => f.ions.anions.some(test);
const isLiquid = (f: Fertilizer) => f.tags.includes('liquid');

export function waterOutcome(f: Fertilizer): ResultKind {
  if (isLiquid(f)) return 'miscible';
  if (PARTIAL_WATER.has(f.id)) return 'partial';
  const w = f.solubility?.water;
  if (w === 'insoluble' || w === 'low') return 'insoluble';
  if (w === 'very-high' || w === 'high' || w === 'moderate') return 'dissolves';
  return 'unknown';
}

export function needsAcid(f: Fertilizer): boolean {
  return waterOutcome(f) === 'insoluble';
}

type Ammonium = 'strong' | 'weak' | 'none';
function ammonium(f: Fertilizer): Ammonium {
  if (!hasCation(f, 'NH4^+')) return 'none';
  if (isLiquid(f)) return 'strong';
  return (f.nitrogenForms?.ammonium ?? 0) >= 3 ? 'strong' : 'weak';
}
const isAmide = (f: Fertilizer) => (f.ions.neutral ?? []).includes('CO(NH2)2');

export function runTest(test: TestId, f: Fertilizer, prepared: boolean): Obs {
  if (test === 'water') return { result: waterOutcome(f) };

  if (test === 'hcl') {
    if (hasAnion(f, (a) => a.startsWith('CO3'))) return { result: 'effervescence' };
    if (WEAK_CARBONATE.has(f.id)) return { result: 'weak-effervescence' };
    if (needsAcid(f)) return { result: 'dissolves-acid' };
    return { result: 'no-reaction' };
  }

  if (test === 'flame') {
    const colors: string[] = [];
    if (hasCation(f, 'Na^+')) colors.push('yellow');
    if (hasCation(f, 'K^+')) colors.push('violet');
    if (hasCation(f, 'Ca^2+')) colors.push('brick-red');
    return colors.length ? { result: 'positive', colors } : { result: 'negative' };
  }

  // іонні тести виконують із розчином проби
  if (needsAcid(f) && !prepared) return { result: 'not-dissolved' };

  switch (test) {
    case 'naoh-heat': {
      const a = ammonium(f);
      if (a === 'strong') return { result: 'positive' };
      if (a === 'weak') return { result: 'weak' };
      return { result: isAmide(f) ? 'slow' : 'negative' };
    }
    case 'nessler': {
      const a = ammonium(f);
      return { result: a === 'strong' ? 'positive' : a === 'weak' ? 'weak' : 'negative' };
    }
    case 'agno3':
      return { result: hasAnion(f, (a) => a === 'Cl^-') ? 'positive' : 'negative' };
    case 'bacl2':
      return { result: hasAnion(f, (a) => a.startsWith('SO4')) ? 'positive' : 'negative' };
    case 'molybdate':
      return { result: hasAnion(f, (a) => a.startsWith('H2PO4') || a.startsWith('HPO4') || a.startsWith('PO4')) ? 'positive' : 'negative' };
    default:
      return { result: 'unknown' };
  }
}

/** Послідовне виконання тестів: кислота розчиняє нерозчинну пробу для наступних іонних тестів. */
export function replay(f: Fertilizer, seq: TestId[]): Obs[] {
  let prepared = false;
  const out: Obs[] = [];
  for (const t of seq) {
    out.push(runTest(t, f, prepared));
    if (t === 'hcl' && needsAcid(f)) prepared = true;
  }
  return out;
}

export function signature(obs: Obs[]): string {
  return obs.map((o) => `${o.result}:${(o.colors ?? []).join('+')}`).join('|');
}

/** Добрива, чиї результати збігаються з отриманими. */
export function candidates(seq: TestId[], observed: Obs[]): Fertilizer[] {
  const sig = signature(observed);
  return POOL.filter((f) => signature(replay(f, seq)) === sig);
}

/** Добрива, яких неможливо розрізнити навіть за повного набору тестів. */
export function indistinguishable(sample: Fertilizer): Fertilizer[] {
  return candidates(TEST_ORDER, replay(sample, TEST_ORDER));
}

function subsets(n: number, size: number): number[][] {
  const out: number[][] = [];
  const rec = (start: number, cur: number[]) => {
    if (cur.length === size) { out.push([...cur]); return; }
    for (let i = start; i < n; i++) { cur.push(i); rec(i + 1, cur); cur.pop(); }
  };
  rec(0, []);
  return out;
}

/** Мінімальна кількість тестів (у канонічному порядку), після якої лишаються лише нерозрізнювані з пробою. */
export function minTests(sample: Fertilizer): number {
  const group = new Set(indistinguishable(sample).map((f) => f.id));
  for (let k = 1; k <= TEST_ORDER.length; k++) {
    for (const idx of subsets(TEST_ORDER.length, k)) {
      const seq = idx.map((i) => TEST_ORDER[i]);
      const cands = candidates(seq, replay(sample, seq));
      if (cands.every((c) => group.has(c.id))) return k;
    }
  }
  return TEST_ORDER.length;
}

export const DETECTIVE_MAX = 10;

export interface DetectiveResult {
  exact: boolean;
  inGroup: boolean;
  group: Fertilizer[];
  min: number;
  extra: number;
  total: number;
  max: number;
  mistakes: string[];
}

/** Правильною вважається будь-яка відповідь із групи добрив, нерозрізнюваних наявними тестами (неспецифічні реакції). */
export function scoreDetective(sample: Fertilizer, answerId: string, seq: TestId[]): DetectiveResult {
  const group = indistinguishable(sample);
  const exact = answerId === sample.id;
  const inGroup = group.some((f) => f.id === answerId);
  const min = minTests(sample);
  const extra = Math.max(0, seq.length - min);
  const total = inGroup ? Math.max(6, DETECTIVE_MAX - extra) : 0;
  const mistakes: string[] = [];
  if (!inGroup) mistakes.push('answer');
  if (extra > 0) mistakes.push('extraTests');
  return { exact, inGroup, group, min, extra, total, max: DETECTIVE_MAX, mistakes };
}

export interface DetectiveCase { id: string; level: PLevel; sampleId: string; budget: number }

export const DETECTIVE_CASES: DetectiveCase[] = [
  { id: 'dc-as', level: 'beginner', sampleId: 'ammonium-sulfate', budget: 6 },
  { id: 'dc-kcl', level: 'beginner', sampleId: 'potassium-chloride', budget: 6 },
  { id: 'dc-urea', level: 'beginner', sampleId: 'urea', budget: 6 },
  { id: 'dc-can', level: 'intermediate', sampleId: 'calcium-nitrate', budget: 5 },
  { id: 'dc-tsp', level: 'intermediate', sampleId: 'double-superphosphate', budget: 5 },
  { id: 'dc-map', level: 'intermediate', sampleId: 'ammophos', budget: 5 },
  { id: 'dc-prec', level: 'advanced', sampleId: 'precipitate', budget: 4 },
  { id: 'dc-syl', level: 'advanced', sampleId: 'sylvinite', budget: 4 },
  { id: 'dc-sop', level: 'advanced', sampleId: 'potassium-sulfate', budget: 4 },
];

/** Рівняння реакцій тестів (для пояснення; баланс перевіряє тест). */
export const DETECTIVE_EQUATIONS: Partial<Record<TestId, string>> = {
  'naoh-heat': 'NH4^+ + OH^- -> NH3↑ + H2O',
  agno3: 'Ag^+ + Cl^- -> AgCl↓',
  bacl2: 'Ba^2+ + SO4^2- -> BaSO4↓',
  hcl: 'CO3^2- + 2H^+ -> CO2↑ + H2O',
};
