import { describe, expect, it } from 'vitest';
import { activeFromMass, fromKg, massFromActive, roundTo, toKg, validateAmount } from './calculations';
import { OXIDE_PAIRS, elementToOxide, getPair, oxideToElement } from './oxide';
import { FERTILIZERS } from '../data/fertilizers';
import { contentFor, defaultGradeId, knownNutrients, npkComponent } from './fertilizer-calc';

const get = (id: string) => FERTILIZERS.find((f) => f.id === id)!;

describe('конвертер діючої речовини (еталони)', () => {
  it('60 кг/га N із карбаміду (46,2 %) → 129,9 кг/га', () => {
    expect(roundTo(massFromActive(60, 46.2), 1)).toBe(129.9);
  });
  it('60 кг/га N з аміачної селітри (34,4 %) → 174,4 кг/га', () => {
    expect(roundTo(massFromActive(60, 34.4), 1)).toBe(174.4);
  });
  it('200 кг/га нітроамофоски 16:16:16 → по 32 кг N, P2O5, K2O', () => {
    const f = get('nitroammophoska');
    for (const k of ['N', 'P2O5', 'K2O'] as const) {
      expect(activeFromMass(200, contentFor(f, k, { gradeId: 'npk-16-16-16' })!)).toBe(32);
    }
  });
  it('M = D·100/C і D = M·C/100 взаємно обернені', () => {
    expect(activeFromMass(massFromActive(37.5, 21), 21)).toBeCloseTo(37.5, 10);
  });
  it('ділення на нуль і від’ємні значення', () => {
    expect(() => massFromActive(10, 0)).toThrow();
    expect(() => massFromActive(-1, 20)).toThrow();
    expect(() => activeFromMass(-1, 20)).toThrow();
  });
  it('перевірка введення, кома як десятковий роздільник', () => {
    expect(validateAmount('')).toEqual({ ok: false, error: 'empty' });
    expect(validateAmount('abc')).toEqual({ ok: false, error: 'nan' });
    expect(validateAmount('-5')).toEqual({ ok: false, error: 'negative' });
    expect(validateAmount('34,4')).toEqual({ ok: true, value: 34.4 });
  });
  it('одиниці маси', () => {
    expect(toKg(1, 't')).toBe(1000);
    expect(fromKg(500, 'g')).toBe(500000);
  });
  it('вміст за маркою й розрахункове значення', () => {
    expect(contentFor(get('uan-solution'), 'N', { gradeId: 'kas-28' })).toBe(28);
    expect(defaultGradeId(get('uan-solution'))).toBe('kas-32');
    expect(defaultGradeId(get('nitroammophoska'))).toBe('npk-16-16-16');
    expect(contentFor(get('simple-superphosphate'), 'P2O5')).toBe(18);
    expect(contentFor(get('simple-superphosphate'), 'P2O5', { custom: 20 })).toBe(20);
    expect(contentFor(get('nitroammophoska'), 'N')).toBeNull();
    expect(knownNutrients(get('ammophos'))).toEqual(['N', 'P2O5']);
    expect(npkComponent(get('ammophos'))).toEqual({ N: 12, P2O5: 52, K2O: 0 });
  });
});

describe('оксидні еквіваленти', () => {
  it('коефіцієнти елемент → оксид', () => {
    expect(getPair('P-P2O5').factor).toBeCloseTo(2.2914, 3);
    expect(getPair('K-K2O').factor).toBeCloseTo(1.2046, 3);
    expect(getPair('Ca-CaO').factor).toBeCloseTo(1.3992, 3);
    expect(getPair('Mg-MgO').factor).toBeCloseTo(1.6583, 3);
    expect(getPair('S-SO3').factor).toBeCloseTo(2.497, 2);
    expect(getPair('N-NH3').factor).toBeCloseTo(1.2159, 3);
  });
  it('обернені коефіцієнти', () => {
    expect(1 / getPair('P-P2O5').factor).toBeCloseTo(0.4364, 3);
    expect(1 / getPair('K-K2O').factor).toBeCloseTo(0.8301, 3);
    expect(1 / getPair('Ca-CaO').factor).toBeCloseTo(0.7147, 3);
    expect(1 / getPair('Mg-MgO').factor).toBeCloseTo(0.603, 3);
  });
  it('перетворення в обидва боки', () => {
    const p = getPair('P-P2O5');
    expect(oxideToElement(elementToOxide(10, p), p)).toBeCloseTo(10, 10);
    expect(elementToOxide(10, p)).toBeCloseTo(22.914, 2);
    expect(OXIDE_PAIRS).toHaveLength(6);
    expect(() => elementToOxide(-1, p)).toThrow();
  });
});
