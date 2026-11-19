import { FERTILIZERS } from './fertilizers';
import { AMENDMENTS, type Material, type PhysicalForm, type Solubility } from './amendments';
import type { Fertilizer } from './types';

function physicalOf(f: Fertilizer): PhysicalForm {
  if (f.tags.includes('gas')) return 'gas';
  if (f.tags.includes('liquid')) return 'liquid';
  return 'solid';
}

function solubilityOf(f: Fertilizer): Solubility {
  const w = f.solubility?.water;
  if (w === undefined) return 'unknown';
  if (w === 'insoluble' || w === 'low') return 'insoluble';
  return 'soluble';
}

export function fertilizerToMaterial(f: Fertilizer): Material {
  return {
    id: f.id, kind: 'fertilizer', name: f.name, formula: f.formula,
    tags: f.tags, solubility: solubilityOf(f), physical: physicalOf(f), group: f.group,
  };
}

export const MATERIALS: Material[] = [...FERTILIZERS.map(fertilizerToMaterial), ...AMENDMENTS];

export function getMaterial(id: string): Material | undefined {
  return MATERIALS.find((m) => m.id === id);
}

const GROUP_COLOR: Record<string, string> = {
  nitrogen: 'var(--primary)',
  phosphorus: 'var(--earth)',
  potassium: 'var(--olive)',
  complex: 'var(--chart-2)',
};

/** Колір матеріалу для схем (за групою; вапнувальні матеріали — нейтральний). */
export function colorOf(m: { group?: string }): string {
  return (m.group && GROUP_COLOR[m.group]) || 'var(--muted-foreground)';
}
