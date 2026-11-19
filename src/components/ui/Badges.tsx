import type { ReactNode } from 'react';
import type { Verification } from '../../data/types';
import { useI18n } from '../../i18n';

const STATUS_STYLE: Record<Verification, string> = {
  'author-provided': 'bg-secondary text-secondary-foreground',
  computed: 'bg-accent text-accent-foreground',
  verified: 'bg-success text-success-foreground',
  'needs-review': 'bg-warning text-warning-foreground',
  unknown: 'bg-muted text-muted-foreground',
};

export function StatusBadge({ status }: { status: Verification }) {
  const { t } = useI18n();
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 ${STATUS_STYLE[status]}`}>
      {t(`status.${status}`)}
    </span>
  );
}

export type ModelType = 'calc' | 'approx' | 'concept';

/** Бейдж типу моделі: розрахунок / наближення / концептуальна модель. */
export function ModelBadge({ type }: { type: ModelType }) {
  const { t } = useI18n();
  return (
    <span className="inline-block rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground">
      {t(`badge.${type}`)}
    </span>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{children}</span>;
}
