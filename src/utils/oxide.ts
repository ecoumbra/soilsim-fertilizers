import { ATOMIC_MASS } from './chemistry';

export type OxidePairId = 'P-P2O5' | 'K-K2O' | 'Ca-CaO' | 'Mg-MgO' | 'S-SO3' | 'N-NH3';

export interface OxidePair {
  id: OxidePairId;
  element: string; // формула елемента
  oxide: string; // формула оксиду/сполуки
  /** маса «оксидної» формули, що припадає на nElement атомів елемента */
  oxideMass: number;
  elementMass: number;
  /** кількість атомів елемента у формульній одиниці оксиду (P₂O₅ → 2) */
  nEl: number;
  /** коефіцієнт елемент → оксид */
  factor: number;
}

function make(id: OxidePairId, element: string, oxide: string, nEl: number, oxideAtoms: Record<string, number>): OxidePair {
  const oxideMass = Object.entries(oxideAtoms).reduce((s, [el, n]) => s + ATOMIC_MASS[el] * n, 0);
  const elementMass = nEl * ATOMIC_MASS[element];
  return { id, element, oxide, oxideMass, elementMass, nEl, factor: oxideMass / elementMass };
}

/** Коефіцієнти розраховуються з атомних мас, а не хардкодяться. */
export const OXIDE_PAIRS: OxidePair[] = [
  make('P-P2O5', 'P', 'P2O5', 2, { P: 2, O: 5 }),
  make('K-K2O', 'K', 'K2O', 2, { K: 2, O: 1 }),
  make('Ca-CaO', 'Ca', 'CaO', 1, { Ca: 1, O: 1 }),
  make('Mg-MgO', 'Mg', 'MgO', 1, { Mg: 1, O: 1 }),
  make('S-SO3', 'S', 'SO3', 1, { S: 1, O: 3 }),
  make('N-NH3', 'N', 'NH3', 1, { N: 1, H: 3 }),
];

export function getPair(id: OxidePairId): OxidePair {
  const p = OXIDE_PAIRS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown pair ${id}`);
  return p;
}

export function elementToOxide(valueElement: number, pair: OxidePair): number {
  if (valueElement < 0) throw new RangeError('Value must not be negative');
  return valueElement * pair.factor;
}

export function oxideToElement(valueOxide: number, pair: OxidePair): number {
  if (valueOxide < 0) throw new RangeError('Value must not be negative');
  return valueOxide / pair.factor;
}
