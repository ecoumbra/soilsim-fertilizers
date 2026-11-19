import { describe, expect, it } from 'vitest';
import { curve, dihydrogenToHydrogenRatio, fractions, phosphorusZone } from './phosphate-speciation';
import { isBalanced } from './chemistry';

describe('форми ортофосфату', () => {
  it('сума часток = 1 у всьому діапазоні pH', () => {
    for (let pH = 0; pH <= 14; pH += 0.5) {
      const f = fractions(pH);
      expect(f.H3PO4 + f.H2PO4 + f.HPO4 + f.PO4).toBeCloseTo(1, 12);
    }
  });
  it('при pH = pKa₂ частки H₂PO₄⁻ і HPO₄²⁻ рівні (джерело: співвідношення 1:1 за pH 7,2)', () => {
    const f = fractions(7.2);
    expect(f.H2PO4 / f.HPO4).toBeCloseTo(1, 9);
  });
  it('співвідношення 10:1 за pH 6,2 і 1:10 за pH 8,2 (джерело)', () => {
    expect(fractions(6.2).H2PO4 / fractions(6.2).HPO4).toBeCloseTo(10, 6);
    expect(fractions(8.2).H2PO4 / fractions(8.2).HPO4).toBeCloseTo(0.1, 6);
    expect(dihydrogenToHydrogenRatio(6.2)).toBeCloseTo(10, 9);
  });
  it('у кислому середовищі переважає H₂PO₄⁻, у лужнішому — HPO₄²⁻', () => {
    expect(fractions(5).H2PO4).toBeGreaterThan(0.99);
    expect(fractions(8).HPO4).toBeGreaterThan(0.85);
  });
  it('крива pH 4–8 з кроком 0,1', () => {
    const c = curve(4, 8, 0.1);
    expect(c).toHaveLength(41);
    expect(c[0].pH).toBe(4);
    expect(c[40].pH).toBe(8);
  });
  it('зони за pH', () => {
    expect(phosphorusZone(4.5)).toBe('feal');
    expect(phosphorusZone(6.5)).toBe('window');
    expect(phosphorusZone(7.8)).toBe('calcium');
  });
  it('рівняння дисоціації та осадження збалансовані', () => {
    for (const e of [
      'H3PO4 <-> H^+ + H2PO4^-',
      'H2PO4^- <-> H^+ + HPO4^2-',
      'HPO4^2- <-> H^+ + PO4^3-',
      'Al^3+ + H2PO4^- + 2H2O -> AlPO4·2H2O↓ + 2H^+',
      'Fe^3+ + H2PO4^- + 2H2O -> FePO4·2H2O↓ + 2H^+',
      'Ca^2+ + HPO4^2- + 2H2O -> CaHPO4·2H2O↓',
      '5Ca^2+ + 3HPO4^2- + 4OH^- -> Ca5(PO4)3OH↓ + 3H2O',
    ]) expect(isBalanced(e)).toBe(true);
  });
});
