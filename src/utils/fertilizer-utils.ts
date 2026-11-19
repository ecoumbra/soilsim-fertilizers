import type { Fertilizer, Group, Lang, NutrientKey, Quantity } from '../data/types';
import { NUTRIENT_KEYS } from '../data/types';
import { formatNumber } from './number-format';
import { molarMass, theoreticalContent } from './chemistry';

const SUB = '₀₁₂₃₄₅₆₇₈₉';

/** Нормалізація формули для пошуку: "NH₄NO₃" = "NH4NO3" = "(NH4)2SO4" без дужок тощо. */
export function normalizeFormula(s: string): string {
  return s
    .replace(/[₀-₉]/g, (c) => String(SUB.indexOf(c)))
    .replace(/[^A-Za-z0-9]/g, '')
    .toLowerCase();
}

export interface Filters {
  query: string;
  group: Group | 'all';
  nutrient: NutrientKey | 'all';
}

export function filterFertilizers(list: Fertilizer[], f: Filters): Fertilizer[] {
  const q = f.query.trim().toLowerCase();
  const qf = normalizeFormula(f.query);
  return list.filter((x) => {
    if (f.group !== 'all' && x.group !== f.group) return false;
    if (f.nutrient !== 'all' && !x.nutrients[f.nutrient]) return false;
    if (!q) return true;
    const names = [x.name.uk, x.name.en, ...(x.synonyms?.uk ?? []), ...(x.synonyms?.en ?? [])].map((s) =>
      s.toLowerCase(),
    );
    if (names.some((n) => n.includes(q))) return true;
    if (qf.length >= 2 && x.formula && normalizeFormula(x.formula).includes(qf)) return true;
    return false;
  });
}

export function nutrientEntries(f: Fertilizer): [NutrientKey, Quantity][] {
  return NUTRIENT_KEYS.filter((k) => f.nutrients[k]).map((k) => [k, f.nutrients[k] as Quantity]);
}

export function maxContent(f: Fertilizer): number {
  return Math.max(0, ...nutrientEntries(f).map(([, q]) => q.nominal ?? q.max ?? 0));
}

export type SortKey = 'name' | 'content';

export function sortFertilizers(list: Fertilizer[], key: SortKey, lang: Lang): Fertilizer[] {
  const copy = [...list];
  if (key === 'name') {
    copy.sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang));
  } else {
    copy.sort((a, b) => maxContent(b) - maxContent(a) || a.name[lang].localeCompare(b.name[lang], lang));
  }
  return copy;
}

/** "34,4" або "16–20" (за мовою). */
export function formatQuantity(q: Quantity, lang: Lang): string {
  if (q.min !== undefined && q.max !== undefined && q.min !== q.max) {
    return `${formatNumber(q.min, lang)}–${formatNumber(q.max, lang)}`;
  }
  return q.nominal === null ? '—' : formatNumber(q.nominal, lang);
}

export function hasRange(q: Quantity): boolean {
  return q.min !== undefined && q.max !== undefined && q.min !== q.max;
}

export interface Theoretical {
  formula: string;
  molarMass: number;
  content: Partial<Record<NutrientKey, number>>;
}

/** Розраховує теоретичні величини; null, якщо не застосовується або формула не розбирається. */
export function theoreticalFor(f: Fertilizer): Theoretical | null {
  const formula = f.theoreticalFormula === undefined ? f.formula : f.theoreticalFormula;
  if (!formula) return null;
  try {
    return { formula, molarMass: molarMass(formula), content: theoreticalContent(formula) };
  } catch {
    return null;
  }
}
