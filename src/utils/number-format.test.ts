import { describe, expect, it } from 'vitest';
import { formatNumber, parseNumber } from './number-format';

describe('parseNumber', () => {
  it('приймає кому й крапку', () => {
    expect(parseNumber('34,4')).toBe(34.4);
    expect(parseNumber('34.4')).toBe(34.4);
  });
  it('відхиляє порожнє, нечислове та неоднозначне', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('1,234.5')).toBeNull();
  });
});

describe('formatNumber', () => {
  it('використовує десяткову кому для uk і крапку для en', () => {
    expect(formatNumber(34.4, 'en')).toBe('34.4');
    expect(formatNumber(34.4, 'uk').includes(',')).toBe(true);
  });
});
