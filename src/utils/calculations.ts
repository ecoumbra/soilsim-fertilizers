import { parseNumber } from './number-format';

export type MassUnit = 'g' | 'kg' | 't';
export const UNIT_TO_KG: Record<MassUnit, number> = { g: 0.001, kg: 1, t: 1000 };

export function toKg(value: number, unit: MassUnit): number {
  return value * UNIT_TO_KG[unit];
}
export function fromKg(valueKg: number, unit: MassUnit): number {
  return valueKg / UNIT_TO_KG[unit];
}

export type InputError = 'empty' | 'nan' | 'negative';

/** Перевірка введеної кількості (кома й крапка приймаються). */
export function validateAmount(raw: string): { ok: true; value: number } | { ok: false; error: InputError } {
  if (raw.trim() === '') return { ok: false, error: 'empty' };
  const v = parseNumber(raw);
  if (v === null) return { ok: false, error: 'nan' };
  if (v < 0) return { ok: false, error: 'negative' };
  return { ok: true, value: v };
}

/** M = D · 100 / C — маса добрива за потрібною масою діючої речовини (C у %, C > 0). */
export function massFromActive(D: number, C: number): number {
  if (!(C > 0)) throw new RangeError('Content must be greater than zero');
  if (D < 0) throw new RangeError('Amount must not be negative');
  return (D * 100) / C;
}

/** D = M · C / 100 — маса діючої речовини у масі добрива. */
export function activeFromMass(M: number, C: number): number {
  if (C < 0) throw new RangeError('Content must not be negative');
  if (M < 0) throw new RangeError('Mass must not be negative');
  return (M * C) / 100;
}

/** Округлення лише для відображення. */
export function roundTo(value: number, digits: number): number {
  const k = Math.pow(10, digits);
  return Math.round((value + Number.EPSILON) * k) / k;
}
