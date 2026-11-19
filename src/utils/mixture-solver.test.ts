import { describe, expect, it } from 'vitest';
import { mixtureComposition, solveMixture, solveSystem, validateTarget } from './mixture-solver';
import type { MixComponent } from './mixture-solver';

const AMMOPHOS: MixComponent = { id: 'ammophos', N: 12, P2O5: 52, K2O: 0 };
const AN: MixComponent = { id: 'an', N: 34.4, P2O5: 0, K2O: 0 };
const KCL: MixComponent = { id: 'kcl', N: 0, P2O5: 0, K2O: 60 };
const UREA: MixComponent = { id: 'urea', N: 46.2, P2O5: 0, K2O: 0 };

describe('склад суміші (вільне конструювання)', () => {
  it('100 кг амофосу + 100 кг KCl → 200 кг, 12/52/60 кг, склад 6:26:30', () => {
    const r = mixtureComposition([
      { ...AMMOPHOS, mass: 100 },
      { ...KCL, mass: 100 },
    ]);
    expect(r.total).toBe(200);
    expect(r.kg).toEqual({ N: 12, P2O5: 52, K2O: 60 });
    expect(r.percent).toEqual({ N: 6, P2O5: 26, K2O: 30 });
    expect(r.shares[0].percent).toBe(50);
  });
  it('порожня суміш не дає ділення на нуль', () => {
    const r = mixtureComposition([{ ...AMMOPHOS, mass: 0 }]);
    expect(r.percent).toEqual({ N: 0, P2O5: 0, K2O: 0 });
  });
});

describe('розв’язувач (еталони специфікації)', () => {
  it('ціль 6:26:30, 100 кг: 50 кг амофосу + 50 кг KCl, наповнювача 0', () => {
    const res = solveMixture([AMMOPHOS, AN, KCL], { N: 6, P2O5: 26, K2O: 30 }, 100);
    expect(res.solutions.length).toBeGreaterThan(0);
    const s = res.solutions[0];
    expect(s.support.sort()).toEqual(['ammophos', 'kcl']);
    expect(s.masses.ammophos).toBeCloseTo(50, 6);
    expect(s.masses.kcl).toBeCloseTo(50, 6);
    expect(s.filler).toBeCloseTo(0, 6);
  });
  it('ціль 8:20:20: амофос ≈38,46; KCl ≈33,33; селітра ≈9,84; наповнювач ≈18,37', () => {
    const res = solveMixture([AMMOPHOS, AN, KCL], { N: 8, P2O5: 20, K2O: 20 }, 100);
    const s = res.solutions.find((x) => x.support.length === 3)!;
    expect(s.masses.ammophos).toBeCloseTo(38.4615, 3);
    expect(s.masses.kcl).toBeCloseTo(33.3333, 3);
    expect(s.masses.an).toBeCloseTo(9.839, 3);
    expect(s.filler).toBeCloseTo(18.366, 2);
    expect(s.composition.N).toBeCloseTo(8, 6);
    expect(s.composition.P2O5).toBeCloseTo(20, 6);
    expect(s.composition.K2O).toBeCloseTo(20, 6);
  });
  it('ціль 12:26:30 — немає розв’язку: потрібно ≈117,4 кг (надмірна концентрація)', () => {
    const res = solveMixture([AMMOPHOS, AN, KCL], { N: 12, P2O5: 26, K2O: 30 }, 100);
    expect(res.solutions).toHaveLength(0);
    expect(res.reason).toBe('over-concentrated');
    expect(res.requiredMass!).toBeCloseTo(117.44, 1);
  });
  it('відсутній елемент: немає джерела K2O', () => {
    const res = solveMixture([AMMOPHOS, AN], { N: 5, P2O5: 5, K2O: 5 }, 100);
    expect(res.reason).toBe('missing-nutrient');
    expect(res.missing).toEqual(['K2O']);
  });
  it('нульова ціль за K2O виключає компоненти з калієм', () => {
    const res = solveMixture([AMMOPHOS, AN, KCL], { N: 10, P2O5: 10, K2O: 0 }, 100);
    expect(res.solutions.length).toBeGreaterThan(0);
    for (const s of res.solutions) expect(s.support.includes('kcl')).toBe(false);
  });
  it('усі розв’язки невід’ємні й відтворюють ціль', () => {
    const res = solveMixture([AMMOPHOS, UREA, AN, KCL], { N: 10, P2O5: 10, K2O: 10 }, 100);
    expect(res.solutions.length).toBeGreaterThan(0);
    for (const s of res.solutions) {
      for (const v of Object.values(s.masses)) expect(v > 0).toBe(true);
      expect(s.filler >= -1e-9).toBe(true);
      expect(s.composition.N).toBeCloseTo(10, 6);
      expect(s.composition.P2O5).toBeCloseTo(10, 6);
      expect(s.composition.K2O).toBeCloseTo(10, 6);
      expect(s.total + s.filler).toBeCloseTo(100, 6);
    }
  });
  it('база суміші масштабує розв’язок', () => {
    const a = solveMixture([AMMOPHOS, KCL], { N: 6, P2O5: 26, K2O: 30 }, 100).solutions[0];
    const b = solveMixture([AMMOPHOS, KCL], { N: 6, P2O5: 26, K2O: 30 }, 1000).solutions[0];
    expect(b.masses.ammophos).toBeCloseTo(a.masses.ammophos * 10, 6);
  });
  it('некоректні дані', () => {
    expect(() => solveMixture([AN], { N: 10, P2O5: 0, K2O: 0 }, 0)).toThrow();
    expect(() => solveMixture([AN], { N: -1, P2O5: 0, K2O: 0 }, 100)).toThrow();
    expect(validateTarget({ N: 50, P2O5: 40, K2O: 20 })).toBe(false);
  });
  it('нульова ціль → лише наповнювач', () => {
    const res = solveMixture([AN], { N: 0, P2O5: 0, K2O: 0 }, 100);
    expect(res.solutions[0].filler).toBe(100);
  });
  it('метод Гаусса: залежні стовпці та неспільна система → null', () => {
    expect(solveSystem([[1, 2], [2, 4], [3, 6]], [1, 2, 3])).toBeNull();
    expect(solveSystem([[1], [1]], [1, 2])).toBeNull();
    const x = solveSystem([[2, 0], [0, 4], [2, 4]], [2, 8, 10])!;
    expect(x[0]).toBeCloseTo(1, 9);
    expect(x[1]).toBeCloseTo(2, 9);
  });
});
