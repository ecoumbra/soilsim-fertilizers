import type { Quantity, Text, Verification } from '../types';

export const T = (uk: string, en: string): Text => ({ uk, en });

/** Діапазон із переліку автора; розрахункове значення = середина діапазону. */
export const rng = (min: number, max: number): Quantity => ({
  nominal: (min + max) / 2,
  min,
  max,
  basis: 'commercial',
  status: 'author-provided',
});

export const fix = (v: number): Quantity => ({
  nominal: v,
  basis: 'commercial',
  status: 'author-provided',
});

export const AUTHOR: Verification = 'author-provided';
export const NR: Verification = 'needs-review';
