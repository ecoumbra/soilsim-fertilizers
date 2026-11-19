import type { Lang } from '../data/types';

/** Приймає "34,4" і "34.4". Повертає null для порожнього/нечислового/неоднозначного вводу. */
export function parseNumber(input: string): number | null {
  const s = input.trim().replace(/\s/g, '');
  if (s === '') return null;
  const commas = (s.match(/,/g) ?? []).length;
  const dots = (s.match(/\./g) ?? []).length;
  if (commas + dots > 1) return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function formatNumber(value: number, lang: Lang, digits = 2): string {
  return new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-US', {
    maximumFractionDigits: digits,
  }).format(value);
}
