import { describe, expect, it } from 'vitest';
import { dissolve, interpolate, qualitativeOutcome, temperatureForSolubility, temperatureRange } from './solubility';
import type { SolPoint } from './solubility';
import { FERTILIZERS } from '../data/fertilizers';

const P: SolPoint[] = [
  { tC: 0, gPer100gWater: 14.8, sourceId: 'x' },
  { tC: 20, gPer100gWater: 22.6, sourceId: 'x' },
  { tC: 40, gPer100gWater: 33.5, sourceId: 'x' },
];

describe('інтерполяція розчинності', () => {
  it('точні точки й проміжні значення', () => {
    expect(interpolate(P, 20)).toBe(22.6);
    expect(interpolate(P, 10)).toBeCloseTo(18.7, 6);
    expect(interpolate(P, 30)).toBeCloseTo(28.05, 6);
  });
  it('без екстраполяції поза межами', () => {
    expect(interpolate(P, -1)).toBeNull();
    expect(interpolate(P, 41)).toBeNull();
    expect(interpolate([], 10)).toBeNull();
  });
  it('діапазон та обернена задача', () => {
    expect(temperatureRange(P)).toEqual({ min: 0, max: 40 });
    expect(temperatureForSolubility(P, 22.6)).toBeCloseTo(20, 6);
    expect(temperatureForSolubility(P, 28.05)).toBeCloseTo(30, 6);
    expect(temperatureForSolubility(P, 10)).toBe(0);
    expect(temperatureForSolubility(P, 50)).toBeNull();
  });
});

describe('розчинення', () => {
  it('ненасичений і насичений розчини', () => {
    const a = dissolve(10, 100, 22.6);
    expect(a.dissolved).toBe(10);
    expect(a.residue).toBe(0);
    expect(a.saturated).toBe(false);
    const b = dissolve(50, 100, 22.6);
    expect(b.dissolved).toBeCloseTo(22.6, 9);
    expect(b.residue).toBeCloseTo(27.4, 9);
    expect(b.saturated).toBe(true);
  });
  it('маса води масштабує межу', () => {
    expect(dissolve(100, 200, 22.6).limit).toBeCloseTo(45.2, 9);
  });
  it('некоректні значення', () => {
    expect(() => dissolve(10, 0, 20)).toThrow();
    expect(() => dissolve(-1, 100, 20)).toThrow();
  });
});

describe('якісні результати', () => {
  it('вода: за класами', () => {
    expect(qualitativeOutcome({ water: 'very-high' }, 'water')).toBe('dissolves');
    expect(qualitativeOutcome({ water: 'moderate' }, 'water')).toBe('limited');
    expect(qualitativeOutcome({ water: 'low' }, 'water')).toBe('poor');
    expect(qualitativeOutcome({ water: 'insoluble' }, 'water')).toBe('insoluble');
    expect(qualitativeOutcome({}, 'water')).toBe('unknown');
    expect(qualitativeOutcome(undefined, 'water')).toBe('unknown');
  });
  it('цитратні розчинники: клас «цитрат»; водорозчинні розчиняються й там; інакше невідомо', () => {
    expect(qualitativeOutcome({ water: 'insoluble', citrate: 'high' }, 'citrate')).toBe('dissolves');
    expect(qualitativeOutcome({ water: 'low', citrate: 'low' }, 'citric')).toBe('poor');
    expect(qualitativeOutcome({ water: 'high' }, 'citric')).toBe('dissolves');
    expect(qualitativeOutcome({ water: 'low' }, 'citrate')).toBe('unknown');
  });
});

describe('числові дані в базі', () => {
  const classOf = (s: number) => (s >= 100 ? 'very-high' : s >= 20 ? 'high' : s >= 5 ? 'moderate' : s >= 0.1 ? 'low' : 'insoluble');
  it('9 добрив мають числові дані; точки впорядковані й зростають', () => {
    const withData = FERTILIZERS.filter((f) => f.solubility?.byTemperature && f.solubility.byTemperature.length > 0);
    expect(withData.map((f) => f.id).sort()).toEqual(
      ['ammonium-nitrate', 'ammonium-sulfate', 'ammophos', 'dap', 'mkp', 'potassium-carbonate', 'potassium-chloride', 'potassium-sulfate', 'urea'],
    );
    for (const f of withData) {
      const pts = f.solubility!.byTemperature!;
      for (let i = 1; i < pts.length; i++) {
        expect(pts[i].tC > pts[i - 1].tC).toBe(true);
        expect(pts[i].gPer100gWater > pts[i - 1].gPer100gWater).toBe(true);
      }
    }
  });
  it('клас розчинності узгоджується з числами за 20 °C', () => {
    for (const f of FERTILIZERS) {
      const pts = f.solubility?.byTemperature;
      const at20 = pts?.find((p) => p.tC === 20);
      if (at20) expect(classOf(at20.gPer100gWater)).toBe(f.solubility!.water);
    }
  });
});
