import { describe, expect, it } from 'vitest';
import { FERTILIZERS, groupCounts } from './index';
import { GROUPS } from '../types';
import { nutrientEntries, theoreticalFor } from '../../utils/fertilizer-utils';

describe('база добрив', () => {
  it('містить 23 добрива (22 з переліку; шлаки розділено) з розподілом 6/6/7/4', () => {
    expect(FERTILIZERS).toHaveLength(23);
    expect(groupCounts()).toEqual({ nitrogen: 6, phosphorus: 6, potassium: 7, complex: 4 });
  });
  it('унікальні id та повні назви', () => {
    const ids = FERTILIZERS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of FERTILIZERS) {
      expect(f.name.uk.length).toBeGreaterThan(0);
      expect(f.name.en.length).toBeGreaterThan(0);
      expect(f.description.uk.length).toBeGreaterThan(0);
      expect(f.description.en.length).toBeGreaterThan(0);
      expect(GROUPS.includes(f.group)).toBe(true);
    }
  });
  it('номінальне значення в межах діапазону', () => {
    for (const f of FERTILIZERS) {
      for (const [, q] of nutrientEntries(f)) {
        if (q.nominal !== null && q.min !== undefined && q.max !== undefined) {
          expect(q.nominal >= q.min && q.nominal <= q.max).toBe(true);
        }
      }
    }
  });
  it('сума форм азоту дорівнює загальному N (допуск 0,3)', () => {
    for (const f of FERTILIZERS) {
      if (!f.nitrogenForms) continue;
      const sum = (f.nitrogenForms.amide ?? 0) + (f.nitrogenForms.ammonium ?? 0) + (f.nitrogenForms.nitrate ?? 0);
      expect(Math.abs(sum - (f.nutrients.N?.nominal ?? -999)) <= 0.3).toBe(true);
    }
  });
  it('частки форм азоту в марках дають 100 %', () => {
    for (const f of FERTILIZERS) {
      for (const g of f.grades ?? []) {
        const s = g.nitrogenSharesOfTotalN;
        if (s) expect(s.amide + s.ammonium + s.nitrate).toBe(100);
      }
    }
  });
  it('рішення автора: подвійна сіль кальцієвої селітри та розділення шлаків', () => {
    const ca = FERTILIZERS.find((f) => f.id === 'calcium-nitrate')!;
    expect(ca.formula).toBe('5Ca(NO3)2·NH4NO3·10H2O');
    expect(FERTILIZERS.some((f) => f.id === 'thomas-slag')).toBe(true);
    expect(FERTILIZERS.some((f) => f.id === 'open-hearth-slag')).toBe(true);
    expect(FERTILIZERS.find((f) => f.id === 'thomas-slag')!.nutrients.P2O5?.nominal).toBe(18);
  });
  it('рішення автора по P-добривах (R5–R9, R20, R21)', () => {
    const get = (id: string) => FERTILIZERS.find((f) => f.id === id)!;
    expect(get('double-superphosphate').name.en).toBe('Triple superphosphate (TSP)');
    expect(get('double-superphosphate').nutrients.P2O5?.nominal).toBe(44);
    expect(get('precipitate').nutrients.P2O5?.nominal).toBe(31.5);
    expect(get('precipitate').p2o5Basis).toBe('citrate-soluble');
    expect(get('rock-phosphate').nutrients.P2O5?.nominal).toBe(22);
    expect(get('rock-phosphate').p2o5Basis).toBe('total');
    expect(get('simple-superphosphate').nutrients.P2O5?.nominal).toBe(18);
    expect(get('simple-superphosphate').nutrients.S?.nominal).toBe(9);
    const th = theoreticalFor(get('simple-superphosphate'))!;
    expect(th.molarMass).toBeCloseTo(596.39, 1);
    expect(th.content.P2O5).toBeCloseTo(23.8, 1);
    expect(th.content.S).toBeCloseTo(10.8, 1);
  });
  it('усі формули розбираються', () => {
    for (const f of FERTILIZERS) {
      const formula = f.theoreticalFormula === undefined ? f.formula : f.theoreticalFormula;
      if (formula) expect(theoreticalFor(f)).not.toBeNull();
    }
  });
  it('склад марок узгоджений з діапазоном картки', () => {
    for (const f of FERTILIZERS) {
      for (const g of f.grades ?? []) {
        for (const [k, v] of Object.entries(g.nutrients)) {
          const q = f.nutrients[k as 'N'];
          expect(q).toBeTruthy();
          if (q && q.min !== undefined && q.max !== undefined) expect(v >= q.min && v <= q.max).toBe(true);
        }
      }
    }
  });
  it('повідомляє про відхилення «формула ↔ вміст» (інформаційно, без помилки)', () => {
    const rows: string[] = [];
    for (const f of FERTILIZERS) {
      const th = theoreticalFor(f);
      if (!th) continue;
      for (const [k, q] of nutrientEntries(f)) {
        const t = th.content[k];
        if (t === undefined || q.nominal === null) continue;
        const rel = Math.abs(t - q.nominal) / t;
        if (rel > 0.03) rows.push(`${f.id}: ${k} заявлено ${q.nominal} %, за формулою ${t.toFixed(1)} %`);
      }
    }
    console.info('Відхилення >3 % (комерційне vs теоретичне):\n' + rows.join('\n'));
    expect(Array.isArray(rows)).toBe(true);
  });
});
