import type { Fertilizer, Grade, NutrientKey } from '../data/types';
import { NUTRIENT_KEYS } from '../data/types';

export function availableGrades(f: Fertilizer): Grade[] {
  return f.grades ?? [];
}

/** Марка за замовчуванням: КАС-32 (типова), інакше перша. */
export function defaultGradeId(f: Fertilizer): string | undefined {
  const g = availableGrades(f);
  if (g.length === 0) return undefined;
  return g.find((x) => x.id === 'kas-32')?.id ?? g[0].id;
}

export interface ContentOptions {
  gradeId?: string;
  /** власне значення в межах діапазону (для добрив із діапазоном) */
  custom?: number;
}

/** Вміст діючої речовини, %: марка → власне значення → розрахункове (nominal). null — невідомо. */
export function contentFor(f: Fertilizer, key: NutrientKey, opts: ContentOptions = {}): number | null {
  const grade = opts.gradeId ? availableGrades(f).find((g) => g.id === opts.gradeId) : undefined;
  if (grade && grade.nutrients[key] !== undefined) return grade.nutrients[key] as number;
  const q = f.nutrients[key];
  if (!q) return null;
  if (opts.custom !== undefined) return opts.custom;
  return q.nominal;
}

/** Діючі речовини, для яких вміст відомий за вибраної марки. */
export function knownNutrients(f: Fertilizer, gradeId?: string): NutrientKey[] {
  return NUTRIENT_KEYS.filter((k) => contentFor(f, k, { gradeId }) !== null);
}

export interface NpkComponent { N: number; P2O5: number; K2O: number }

export function npkComponent(f: Fertilizer, gradeId?: string): NpkComponent {
  return {
    N: contentFor(f, 'N', { gradeId }) ?? 0,
    P2O5: contentFor(f, 'P2O5', { gradeId }) ?? 0,
    K2O: contentFor(f, 'K2O', { gradeId }) ?? 0,
  };
}

/** Тверді добрива, придатні для сухого змішування (не рідини й не гази). */
export function isSolidFertilizer(f: Fertilizer): boolean {
  return !f.tags.includes('liquid') && !f.tags.includes('gas');
}
