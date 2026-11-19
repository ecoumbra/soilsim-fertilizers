/** Сталі кислотної дисоціації H₃PO₄ (25 °C, ідеальний розчин). pKa₂ підтверджено джерелами; pKa₁ і pKa₃ — довідкові, потребують верифікації. */
export const PKA = { pKa1: 2.15, pKa2: 7.2, pKa3: 12.35 } as const;

export interface PhosphateFractions { H3PO4: number; H2PO4: number; HPO4: number; PO4: number }

/** Мольні частки форм ортофосфату за pH. */
export function fractions(pH: number, pka: { pKa1: number; pKa2: number; pKa3: number } = PKA): PhosphateFractions {
  const h = Math.pow(10, -pH);
  const K1 = Math.pow(10, -pka.pKa1);
  const K2 = Math.pow(10, -pka.pKa2);
  const K3 = Math.pow(10, -pka.pKa3);
  const d = h * h * h + K1 * h * h + K1 * K2 * h + K1 * K2 * K3;
  return {
    H3PO4: (h * h * h) / d,
    H2PO4: (K1 * h * h) / d,
    HPO4: (K1 * K2 * h) / d,
    PO4: (K1 * K2 * K3) / d,
  };
}

export interface CurvePoint extends PhosphateFractions { pH: number }

export function curve(pHmin: number, pHmax: number, step: number): CurvePoint[] {
  const out: CurvePoint[] = [];
  const n = Math.round((pHmax - pHmin) / step);
  for (let i = 0; i <= n; i++) {
    const pH = Math.round((pHmin + i * step) * 1e6) / 1e6;
    out.push({ pH, ...fractions(pH) });
  }
  return out;
}

/** Відношення [H₂PO₄⁻]/[HPO₄²⁻] = 10^(pKa₂ − pH). */
export function dihydrogenToHydrogenRatio(pH: number, pKa2: number = PKA.pKa2): number {
  return Math.pow(10, pKa2 - pH);
}

export type PZone = 'feal' | 'window' | 'calcium';

/**
 * Якісна зона за pH ґрунту (межі — орієнтири з джерел, які між собою розходяться:
 * Al-фосфати найактивніші при pH ≈ 4,8–5,5; максимум доступності ≈ 5,5–7,0; Ca-фосфати важливі при pH > 7,0–7,3).
 */
export function phosphorusZone(pH: number): PZone {
  if (pH < 5.5) return 'feal';
  if (pH <= 7.0) return 'window';
  return 'calcium';
}
