import type { Fertilizer, Group } from '../types';
import { GROUPS } from '../types';
import { nitrogen } from './nitrogen';
import { phosphorus } from './phosphorus';
import { potassium } from './potassium';
import { complex } from './complex';

import { applyVerification } from '../verification';

/** Базові дані + шар верифікації (джерела та підтверджені поля). */
export const FERTILIZERS: Fertilizer[] = [...nitrogen, ...phosphorus, ...potassium, ...complex].map(applyVerification);

export function getFertilizer(id: string): Fertilizer | undefined {
  return FERTILIZERS.find((f) => f.id === id);
}

export function groupCounts(): Record<Group, number> {
  const out = { nitrogen: 0, phosphorus: 0, potassium: 0, complex: 0 } as Record<Group, number>;
  for (const f of FERTILIZERS) out[f.group]++;
  return out;
}

export { GROUPS };
