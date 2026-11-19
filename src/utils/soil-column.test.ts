import { describe, expect, it } from 'vitest';
import { N_LAYERS, advance, allAnionsOut, countBySpecies, deepest, initialState, layerCounts, nitrify, PARTICLES } from './soil-column';
import type { ColumnState, Params } from './soil-column';
import { isBalanced } from './chemistry';

const KCL: Params = { fertilizer: 'potassium-chloride', soil: 'loam', rain: 'moderate', amount: 'medium' };
const AN: Params = { fertilizer: 'ammonium-nitrate', soil: 'loam', rain: 'moderate', amount: 'medium' };

function run(p: Params, steps: number): ColumnState {
  let s = initialState(p);
  for (let i = 0; i < steps; i++) s = advance(s, p);
  return s;
}

describe('ґрунтова колонка (концептуальна модель)', () => {
  it('початковий стан: усі частинки на поверхні; K⁺ : Cl⁻ : Ca²⁺ = n : n : n/2', () => {
    const s = initialState(KCL);
    const n = PARTICLES.medium;
    const c = countBySpecies(s);
    expect(c.K.inColumn).toBe(n);
    expect(c.Cl.inColumn).toBe(n);
    expect(c.Ca.inColumn).toBe(Math.ceil(n / 2));
    expect(layerCounts(s, 'K')[0]).toBe(n);
  });
  it('Cl⁻ рухається з водою й раніше за K⁺', () => {
    const s = run(KCL, 2);
    expect(deepest(s, 'Cl')).toBe(4);
    expect(deepest(s, 'K')).toBeLessThan(deepest(s, 'Cl'));
  });
  it('Cl⁻ вимивається з колонки; K⁺ лишається в межах обмінної ємності', () => {
    const s = run(KCL, 6);
    const c = countBySpecies(s);
    expect(c.Cl.out).toBe(PARTICLES.medium);
    expect(c.K.out).toBe(0);
    expect(deepest(s, 'K')).toBeLessThanOrEqual(2);
    expect(allAnionsOut(s)).toBe(true);
  });
  it('сильніший дощ вимиває аніони раніше', () => {
    const light = run({ ...KCL, rain: 'light' }, 3);
    const heavy = run({ ...KCL, rain: 'heavy' }, 3);
    expect(countBySpecies(heavy).Cl.out).toBeGreaterThan(countBySpecies(light).Cl.out);
  });
  it('глинистий ґрунт затримує катіон ближче до поверхні, ніж піщаний', () => {
    const sand = run({ ...KCL, soil: 'sand', amount: 'low' }, 8);
    const clay = run({ ...KCL, soil: 'clay', amount: 'low' }, 8);
    expect(deepest(clay, 'K')).toBeLessThan(deepest(sand, 'K'));
  });
  it('перевищення обмінної ємності пропускає частину катіонів глибше', () => {
    const excess = run({ ...KCL, soil: 'loam', amount: 'high' }, 8);
    const fits = run({ ...KCL, soil: 'loam', amount: 'low' }, 8);
    expect(deepest(excess, 'K')).toBeGreaterThan(deepest(fits, 'K'));
    // без перевищення (глина, умовно «високий» рівень = високий) — граничний шар не змінюється
    const clayHigh = run({ ...KCL, soil: 'clay', amount: 'high' }, 8);
    const clayLow = run({ ...KCL, soil: 'clay', amount: 'low' }, 8);
    expect(deepest(clayHigh, 'K')).toBe(deepest(clayLow, 'K'));
  });
  it('NH₄NO₃: NH₄⁺ затримується, NO₃⁻ вимивається', () => {
    const s = run(AN, 6);
    expect(countBySpecies(s).NO3.out).toBe(PARTICLES.medium);
    expect(countBySpecies(s).NH4.out).toBe(0);
  });
  it('нітрифікація перетворює весь NH₄⁺ на NO₃⁻ на тому ж місці', () => {
    const a = run(AN, 1);
    const before = countBySpecies(a);
    const b = nitrify(a);
    const after = countBySpecies(b);
    expect(after.NH4.inColumn + after.NH4.out).toBe(0);
    expect(after.NO3.inColumn + after.NO3.out).toBe(before.NO3.inColumn + before.NO3.out + before.NH4.inColumn + before.NH4.out);
    expect(b.nitrified).toBe(true);
  });
  it('детермінованість і незмінність попереднього стану', () => {
    const s0 = initialState(KCL);
    const snapshot = JSON.stringify(s0);
    advance(s0, KCL);
    expect(JSON.stringify(s0)).toBe(snapshot);
    expect(JSON.stringify(run(KCL, 3))).toBe(JSON.stringify(run(KCL, 3)));
  });
  it('шари: сума по шарах = кількість у колонці', () => {
    const s = run(KCL, 1);
    const sum = layerCounts(s, 'Cl').reduce((a, b) => a + b, 0);
    expect(sum).toBe(countBySpecies(s).Cl.inColumn);
    expect(layerCounts(s, 'Cl')).toHaveLength(N_LAYERS);
  });
  it('рівняння дисоціації та нітрифікації збалансовані', () => {
    expect(isBalanced('KCl -> K^+ + Cl^-')).toBe(true);
    expect(isBalanced('NH4NO3 -> NH4^+ + NO3^-')).toBe(true);
    expect(isBalanced('NH4^+ + 2O2 -> NO3^- + 2H^+ + H2O')).toBe(true);
    expect(isBalanced('CaCl2 -> Ca^2+ + 2Cl^-')).toBe(true);
  });
});
