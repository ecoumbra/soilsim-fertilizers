export interface SolPoint { tC: number; gPer100gWater: number; sourceId: string }

function sorted(points: SolPoint[]): SolPoint[] {
  return [...points].sort((a, b) => a.tC - b.tC);
}

export function temperatureRange(points: SolPoint[]): { min: number; max: number } | null {
  if (points.length === 0) return null;
  const p = sorted(points);
  return { min: p[0].tC, max: p[p.length - 1].tC };
}

/** Лінійна інтерполяція розчинності (г/100 г води) у межах наявних даних; поза межами — null (без екстраполяції). */
export function interpolate(points: SolPoint[], tC: number): number | null {
  const p = sorted(points);
  if (p.length === 0 || tC < p[0].tC || tC > p[p.length - 1].tC) return null;
  if (p.length === 1) return p[0].gPer100gWater;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i];
    const b = p[i + 1];
    if (tC >= a.tC && tC <= b.tC) {
      const k = b.tC === a.tC ? 0 : (tC - a.tC) / (b.tC - a.tC);
      return a.gPer100gWater + k * (b.gPer100gWater - a.gPer100gWater);
    }
  }
  return null;
}

/** Найнижча температура в межах даних, за якої розчинність ≥ y (для зростаючих кривих); null, якщо не досягається. */
export function temperatureForSolubility(points: SolPoint[], y: number): number | null {
  const p = sorted(points);
  if (p.length === 0) return null;
  if (y <= p[0].gPer100gWater) return p[0].tC;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i];
    const b = p[i + 1];
    if (y >= a.gPer100gWater && y <= b.gPer100gWater && b.gPer100gWater > a.gPer100gWater) {
      return a.tC + ((y - a.gPer100gWater) / (b.gPer100gWater - a.gPer100gWater)) * (b.tC - a.tC);
    }
  }
  return null;
}

export interface Dissolution {
  limit: number; // максимальна маса, що розчиняється у воді при T, г
  dissolved: number; // г
  residue: number; // г
  saturated: boolean;
  loadPer100g: number; // г добрива на 100 г води
}

/** Розчинення m грамів у waterG грамах води за розчинності S (г/100 г води). */
export function dissolve(massG: number, waterG: number, S: number): Dissolution {
  if (!(waterG > 0)) throw new RangeError('Water mass must be positive');
  if (massG < 0 || S < 0) throw new RangeError('Values must not be negative');
  const limit = (S * waterG) / 100;
  const dissolved = Math.min(massG, limit);
  return {
    limit,
    dissolved,
    residue: Math.max(0, massG - limit),
    saturated: massG > limit,
    loadPer100g: (massG / waterG) * 100,
  };
}

export type SolventId = 'water' | 'citric' | 'citrate';
export type Outcome = 'dissolves' | 'limited' | 'poor' | 'insoluble' | 'unknown';

type Cls = 'very-high' | 'high' | 'moderate' | 'low' | 'insoluble' | undefined;

function fromClass(c: Cls): Outcome {
  if (c === 'very-high' || c === 'high') return 'dissolves';
  if (c === 'moderate') return 'limited';
  if (c === 'low') return 'poor';
  if (c === 'insoluble') return 'insoluble';
  return 'unknown';
}

/**
 * Якісний результат за класами розчинності з бази.
 * У цитратних розчинниках — клас «цитрат»; якщо його немає, але добриво добре розчинне у воді, воно розчиняється й у водному розчиннику.
 */
export function qualitativeOutcome(solubility: { water?: Cls; citrate?: Cls } | undefined, solvent: SolventId): Outcome {
  if (!solubility) return 'unknown';
  if (solvent === 'water') return fromClass(solubility.water);
  if (solubility.citrate) return fromClass(solubility.citrate);
  const w = fromClass(solubility.water);
  return w === 'dissolves' ? 'dissolves' : 'unknown';
}
