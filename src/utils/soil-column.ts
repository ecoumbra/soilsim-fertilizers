/**
 * Концептуальна модель ґрунтової колонки. НЕ кількісна: без концентрацій, коефіцієнтів сорбції
 * та швидкостей. Іони подано умовними «частинками»; правила моделі описано в інтерфейсі.
 */
export const N_LAYERS = 6;

export type Level = 'low' | 'medium' | 'high';
export type SoilType = 'sand' | 'loamy-sand' | 'loam' | 'clay' | 'chernozem';
export type Rain = 'light' | 'moderate' | 'heavy';
export type ColumnFertilizer = 'potassium-chloride' | 'ammonium-nitrate';
export type Species = 'K' | 'Cl' | 'Ca' | 'NH4' | 'NO3';

/** Якісний рівень обмінної ємності за типом ґрунту (спрощення). */
export const SOIL_CEC: Record<SoilType, Level> = {
  sand: 'low', 'loamy-sand': 'low', loam: 'medium', clay: 'high', chernozem: 'high',
};

/** Умовне просування води за крок, шарів. */
export const RAIN_LAYERS: Record<Rain, number> = { light: 1, moderate: 2, heavy: 3 };

const RANK: Record<Level, number> = { low: 1, medium: 2, high: 3 };
/** Найглибший шар (індекс), якого може сягнути адсорбований катіон. */
const CATION_MAX_INDEX: Record<Level, number> = { low: 3, medium: 2, high: 1 };
/** Кількість частинок кожного іона за умовною кількістю добрива. */
export const PARTICLES: Record<Level, number> = { low: 6, medium: 10, high: 14 };

export interface Params {
  fertilizer: ColumnFertilizer;
  soil: SoilType;
  rain: Rain;
  amount: Level;
}

export interface Particle { species: Species; pos: number | 'out'; id: number }

export interface ColumnState {
  step: number;
  particles: Particle[];
  nitrified: boolean;
  /** підпис останньої події для пояснення */
  event: 'start' | 'advance' | 'nitrify';
}

export function cationMaxIndex(p: Params, particleIndex: number, count: number): number {
  const level = SOIL_CEC[p.soil];
  const base = CATION_MAX_INDEX[level];
  // перевищення обмінної ємності: частина катіонів проникає на шар глибше
  const exceeds = RANK[p.amount] > RANK[level];
  return exceeds && particleIndex >= Math.floor(count / 2) ? base + 1 : base;
}

export function initialState(p: Params): ColumnState {
  const n = PARTICLES[p.amount];
  const particles: Particle[] = [];
  let id = 0;
  if (p.fertilizer === 'potassium-chloride') {
    for (let i = 0; i < n; i++) particles.push({ species: 'K', pos: 0, id: id++ });
    for (let i = 0; i < n; i++) particles.push({ species: 'Cl', pos: 0, id: id++ });
    // K⁺ витісняє Ca²⁺ з обмінних центрів: на 2 K⁺ — один Ca²⁺ (баланс зарядів), що рухається з водою
    for (let i = 0; i < Math.ceil(n / 2); i++) particles.push({ species: 'Ca', pos: 0, id: id++ });
  } else {
    for (let i = 0; i < n; i++) particles.push({ species: 'NH4', pos: 0, id: id++ });
    for (let i = 0; i < n; i++) particles.push({ species: 'NO3', pos: 0, id: id++ });
  }
  return { step: 0, particles, nitrified: false, event: 'start' };
}

const MOBILE: Species[] = ['Cl', 'Ca', 'NO3'];

/** Один крок дощу: мобільні іони рухаються з водою, адсорбовані катіони відстають і обмежені ємністю ґрунту. */
export function advance(state: ColumnState, p: Params): ColumnState {
  const rate = RAIN_LAYERS[p.rain];
  const cationCount = state.particles.filter((x) => x.species === 'K' || x.species === 'NH4').length;
  let cationIdx = 0;
  const particles = state.particles.map((x) => {
    if (x.pos === 'out') return { ...x };
    if (MOBILE.includes(x.species)) {
      const pos = x.pos + rate;
      return { ...x, pos: pos >= N_LAYERS ? ('out' as const) : pos };
    }
    const max = cationMaxIndex(p, cationIdx++, cationCount);
    return { ...x, pos: Math.min(max, x.pos + 1) };
  });
  return { step: state.step + 1, particles, nitrified: state.nitrified, event: 'advance' };
}

/** Нітрифікація (якісний крок за вибором користувача): весь NH₄⁺ → NO₃⁻ на тому ж місці. */
export function nitrify(state: ColumnState): ColumnState {
  return {
    ...state,
    nitrified: true,
    event: 'nitrify',
    particles: state.particles.map((x) => (x.species === 'NH4' ? { ...x, species: 'NO3' as const } : x)),
  };
}

export function countBySpecies(state: ColumnState): Record<Species, { inColumn: number; out: number }> {
  const out = {} as Record<Species, { inColumn: number; out: number }>;
  for (const s of ['K', 'Cl', 'Ca', 'NH4', 'NO3'] as Species[]) out[s] = { inColumn: 0, out: 0 };
  for (const x of state.particles) {
    if (x.pos === 'out') out[x.species].out++;
    else out[x.species].inColumn++;
  }
  return out;
}

/** Кількість частинок виду в кожному шарі (індекс 0..N_LAYERS-1). */
export function layerCounts(state: ColumnState, species: Species): number[] {
  const arr = new Array<number>(N_LAYERS).fill(0);
  for (const x of state.particles) if (x.species === species && x.pos !== 'out') arr[x.pos]++;
  return arr;
}

/** Увесь аніон залишив колонку. */
export function allAnionsOut(state: ColumnState): boolean {
  return state.particles.filter((x) => MOBILE.includes(x.species)).every((x) => x.pos === 'out');
}

export function deepest(state: ColumnState, species: Species): number {
  let m = -1;
  for (const x of state.particles) if (x.species === species && x.pos !== 'out') m = Math.max(m, x.pos);
  return m;
}
