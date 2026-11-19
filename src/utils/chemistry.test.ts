import { describe, expect, it } from 'vitest';
import { isBalanced, molarMass, parseFormula, theoreticalContent } from './chemistry';

describe('chemistry', () => {
  it('рахує молярні маси', () => {
    expect(molarMass('NH4NO3')).toBeCloseTo(80.04, 1);
    expect(molarMass('CO(NH2)2')).toBeCloseTo(60.06, 1);
    expect(molarMass('KCl')).toBeCloseTo(74.55, 1);
  });
  it('розбирає дужки, гідрати й суми', () => {
    expect(parseFormula('(NH4)2SO4')).toEqual({ N: 2, H: 8, S: 1, O: 4 });
    expect(parseFormula('CaHPO4·2H2O').H).toBe(5);
    expect(parseFormula('Ca(H2PO4)2·H2O + 2CaSO4·2H2O').Ca).toBe(3);
  });
  it('теоретичний вміст N у NH4NO3 = 35,0 %', () => {
    expect(theoreticalContent('NH4NO3').N).toBeCloseTo(35.0, 1);
  });
  it('теоретичний вміст у KH2PO4: P2O5 ≈ 52,2; K2O ≈ 34,6', () => {
    const c = theoreticalContent('KH2PO4');
    expect(c.P2O5).toBeCloseTo(52.2, 1);
    expect(c.K2O).toBeCloseTo(34.6, 1);
  });
  it('кидає помилку для невідомого елемента', () => {
    expect(() => parseFormula('Xx2')).toThrow();
  });
  it('перевіряє баланс рівнянь', () => {
    expect(isBalanced('NH4NO3 -> NH4^+ + NO3^-')).toBe(true);
    expect(isBalanced('NH4^+ + 2O2 -> NO3^- + 2H^+ + H2O')).toBe(true);
    expect(isBalanced('5Ca(NO3)2·NH4NO3·10H2O -> 5Ca^2+ + 11NO3^- + NH4^+ + 10H2O')).toBe(true);
    expect(isBalanced('(NH4)2CO3 -> 2NH3↑ + CO2↑ + H2O')).toBe(true);
    expect(isBalanced('NH4NO3 -> NH4^+ + 2NO3^-')).toBe(false);
    expect(isBalanced('Ca(NO3)2 -> Ca^2+ + NO3^-')).toBe(false);
  });
});

