import type { NutrientKey } from '../data/types';

/** Атомні маси (IUPAC, округлені), г/моль. */
export const ATOMIC_MASS: Record<string, number> = {
  H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.99, Mg: 24.305,
  Al: 26.982, P: 30.974, S: 32.06, Cl: 35.45, K: 39.098, Ca: 40.078, Fe: 55.845,
  Ag: 107.868, Ba: 137.327,
};

export type Composition = Record<string, number>;

interface Cursor { i: number }

function readInt(src: string, c: Cursor): number | null {
  let s = '';
  while (c.i < src.length && /[0-9]/.test(src[c.i])) { s += src[c.i]; c.i++; }
  return s ? parseInt(s, 10) : null;
}

function parseSegment(src: string, c: Cursor, closing: boolean): Composition {
  const out: Composition = {};
  while (c.i < src.length) {
    const ch = src[c.i];
    if (ch === ')') {
      if (closing) return out;
      throw new Error('Unbalanced ")"');
    }
    if (ch === '(') {
      c.i++;
      const inner = parseSegment(src, c, true);
      if (src[c.i] !== ')') throw new Error('Unbalanced "("');
      c.i++;
      const mult = readInt(src, c) ?? 1;
      for (const [el, n] of Object.entries(inner)) out[el] = (out[el] ?? 0) + n * mult;
    } else if (/[A-Z]/.test(ch)) {
      let el = ch;
      c.i++;
      while (c.i < src.length && /[a-z]/.test(src[c.i])) { el += src[c.i]; c.i++; }
      if (!(el in ATOMIC_MASS)) throw new Error(`Unknown element ${el}`);
      const n = readInt(src, c) ?? 1;
      out[el] = (out[el] ?? 0) + n;
    } else {
      throw new Error(`Unexpected "${ch}"`);
    }
  }
  if (closing) throw new Error('Unbalanced "("');
  return out;
}

/**
 * Склад за формулою. Підтримує дужки, гідрати через «·» та суми через «+»
 * з цілими коефіцієнтами: "Ca(H2PO4)2·H2O + 2CaSO4·2H2O".
 */
export function parseFormula(formula: string): Composition {
  const total: Composition = {};
  const parts = formula.replace(/\s/g, '').split(/[·+]/).filter(Boolean);
  for (const part of parts) {
    const m = /^(\d+)(.*)$/.exec(part);
    const coeff = m ? parseInt(m[1], 10) : 1;
    const rest = m ? m[2] : part;
    const comp = parseSegment(rest, { i: 0 }, false);
    for (const [el, n] of Object.entries(comp)) total[el] = (total[el] ?? 0) + n * coeff;
  }
  return total;
}

export function molarMassOf(comp: Composition): number {
  return Object.entries(comp).reduce((s, [el, n]) => s + ATOMIC_MASS[el] * n, 0);
}

export function molarMass(formula: string): number {
  return molarMassOf(parseFormula(formula));
}

const M = (f: Composition) => molarMassOf(f);

/** Теоретичний вміст діючих речовин (масові %) за формулою. */
export function theoreticalContent(formula: string): Partial<Record<NutrientKey, number>> {
  const c = parseFormula(formula);
  const total = molarMassOf(c);
  const out: Partial<Record<NutrientKey, number>> = {};
  if (c.N) out.N = (100 * c.N * ATOMIC_MASS.N) / total;
  if (c.P) out.P2O5 = (100 * (c.P / 2) * M({ P: 2, O: 5 })) / total;
  if (c.K) out.K2O = (100 * (c.K / 2) * M({ K: 2, O: 1 })) / total;
  if (c.Ca) out.CaO = (100 * c.Ca * M({ Ca: 1, O: 1 })) / total;
  if (c.Mg) out.MgO = (100 * c.Mg * M({ Mg: 1, O: 1 })) / total;
  if (c.S) out.S = (100 * c.S * ATOMIC_MASS.S) / total;
  return out;
}

// ---------- перевірка збалансованості рівнянь ----------

interface Species { comp: Composition; charge: number }

function parseSpecies(raw: string): Species {
  let s = raw.replace(/[↑↓]/g, '').trim();
  let coeff = 1;
  if (!s.includes('·')) {
    const m = /^(\d+)(.+)$/.exec(s);
    if (m) {
      coeff = parseInt(m[1], 10);
      s = m[2];
    }
  }
  let charge = 0;
  const idx = s.indexOf('^');
  if (idx >= 0) {
    const c = /^(\d*)([+\-−])$/.exec(s.slice(idx + 1));
    if (!c) throw new Error(`Bad charge in ${raw}`);
    charge = (c[1] ? parseInt(c[1], 10) : 1) * (c[2] === '+' ? 1 : -1);
    s = s.slice(0, idx);
  }
  const base = parseFormula(s);
  const comp: Composition = {};
  for (const [el, n] of Object.entries(base)) comp[el] = n * coeff;
  return { comp, charge: charge * coeff };
}

function sideTotals(side: string): { comp: Composition; charge: number } {
  const comp: Composition = {};
  let charge = 0;
  for (const part of side.split(' + ')) {
    const sp = parseSpecies(part);
    charge += sp.charge;
    for (const [el, n] of Object.entries(sp.comp)) comp[el] = (comp[el] ?? 0) + n;
  }
  return { comp, charge };
}

/** Перевіряє баланс атомів і заряду рівняння формату "A + B -> C + D" або "<->". */
export function isBalanced(equation: string): boolean {
  const [left, right] = equation.split(/<->|->/).map((x) => x.trim());
  if (!left || !right) throw new Error('Equation needs two sides');
  const a = sideTotals(left);
  const b = sideTotals(right);
  if (a.charge !== b.charge) return false;
  const els = new Set([...Object.keys(a.comp), ...Object.keys(b.comp)]);
  for (const el of els) if ((a.comp[el] ?? 0) !== (b.comp[el] ?? 0)) return false;
  return true;
}
