import type { Material } from '../data/amendments';
import { RULES, type CompatMode, type CompatRule, type CompatStatus, type Matcher } from '../data/compatibility/rules';

export type InsufficientReason = 'no-rule' | 'not-applicable-physical' | 'not-applicable-solubility';

export interface CompatResult {
  status: CompatStatus;
  mode: CompatMode;
  rule?: CompatRule;
  reason?: InsufficientReason;
}

function matches(m: Matcher, x: Material): boolean {
  return (m.ids?.includes(x.id) ?? false) || (m.tags?.some((t) => x.tags.includes(t)) ?? false);
}

const STATUS_WEIGHT: Record<CompatRule['status'], number> = { incompatible: 3, conditional: 2, compatible: 1 };

export function rulesFor(a: Material, b: Material, mode: CompatMode): CompatRule[] {
  return RULES.filter(
    (r) =>
      (r.mode === 'both' || r.mode === mode) &&
      ((matches(r.a, a) && matches(r.b, b)) || (matches(r.a, b) && matches(r.b, a))),
  );
}

/**
 * Оцінює сумісність двох матеріалів. Результат завжди випливає з правила (механізму);
 * за відсутності правила — «недостатньо даних», а не «сумісні».
 */
export function evaluate(a: Material, b: Material, mode: CompatMode): CompatResult {
  if (a.id === b.id) throw new Error('Choose two different materials');

  if (a.physical === 'gas' || b.physical === 'gas') {
    return { status: 'insufficient', mode, reason: 'not-applicable-physical' };
  }
  if (mode === 'dry' && (a.physical === 'liquid' || b.physical === 'liquid')) {
    return { status: 'insufficient', mode, reason: 'not-applicable-physical' };
  }

  const found = rulesFor(a, b, mode);
  if (found.length > 0) {
    found.sort((x, y) => y.priority - x.priority || STATUS_WEIGHT[y.status] - STATUS_WEIGHT[x.status]);
    const rule = found[0];
    return { status: rule.status, mode, rule };
  }

  if (mode === 'solution' && (a.solubility === 'insoluble' || b.solubility === 'insoluble')) {
    return { status: 'insufficient', mode, reason: 'not-applicable-solubility' };
  }
  return { status: 'insufficient', mode, reason: 'no-rule' };
}

export interface PairIssue { a: Material; b: Material; result: CompatResult }

/** Усі пари набору матеріалів, що не є повністю сумісними (для попереджень у Конструкторі NPK). */
export function mixIssues(materials: Material[], mode: CompatMode): PairIssue[] {
  const out: PairIssue[] = [];
  for (let i = 0; i < materials.length; i++) {
    for (let j = i + 1; j < materials.length; j++) {
      const result = evaluate(materials[i], materials[j], mode);
      if (result.status === 'conditional' || result.status === 'incompatible') {
        out.push({ a: materials[i], b: materials[j], result });
      }
    }
  }
  return out;
}
