import type { ReactNode } from 'react';
import { getSource } from '../../data/sources';
import type { PLevel } from '../../data/practicum/types';
import { LEVELS } from '../../data/practicum/types';
import { useI18n } from '../../i18n';
import type { Attempt } from '../../utils/journal';
import { attemptsCount, bestByScenario, type PModule } from '../../utils/journal';

export function LevelBadge({ level }: { level: PLevel }) {
  const { t } = useI18n();
  const cls = level === 'beginner' ? 'bg-success text-success-foreground' : level === 'intermediate' ? 'bg-warning text-warning-foreground' : 'bg-destructive text-destructive-foreground';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{t(`prac.level.${level}`)}</span>;
}

export interface ListItem { id: string; title: string; level: PLevel; extra?: ReactNode }

/** Список сценаріїв за рівнями; показує кількість спроб і найкращий результат із журналу. */
export function ScenarioList({ items, module, attempts, onOpen, intro }: { items: ListItem[]; module: PModule; attempts: Attempt[]; onOpen: (id: string) => void; intro: string }) {
  const { t, lang } = useI18n();
  const best = bestByScenario(attempts);
  return (
    <div className="fade-in space-y-5">
      <p className="text-sm text-muted-foreground">{intro}</p>
      {LEVELS.map((lv) => {
        const list = items.filter((i) => i.level === lv);
        if (list.length === 0) return null;
        return (
          <section key={lv} aria-labelledby={`lv-${module}-${lv}`}>
            <h3 id={`lv-${module}-${lv}`} className="mb-2 flex items-center gap-2 text-lg font-semibold">
              {t(`prac.level.${lv}`)} <span className="text-sm font-normal text-muted-foreground">({list.length})</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((it) => {
                const n = attemptsCount(attempts, module, it.id);
                const b = best[`${module}:${it.id}`];
                return (
                  <button key={it.id} type="button" onClick={() => onOpen(it.id)} className="rounded-xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:bg-muted">
                    <div className="font-semibold leading-snug">{it.title}</div>
                    {it.extra}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {n === 0 ? t('prac.notTried') : t('prac.triedBest', { n, p: new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-US', { style: 'percent', maximumFractionDigits: 0 }).format(b ?? 0) })}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function ScoreBanner({ score, max }: { score: number; max: number }) {
  const { t } = useI18n();
  const p = max > 0 ? score / max : 0;
  const cls = p >= 0.75 ? 'border-success bg-success/15' : p >= 0.4 ? 'border-warning bg-warning/20' : 'border-destructive bg-destructive/10';
  return (
    <div className={`rounded-xl border-2 p-4 ${cls}`} role="status">
      <div className="text-xs text-muted-foreground">{t('prac.score')}</div>
      <div className="font-serif text-3xl font-semibold">
        {score} / {max}
      </div>
    </div>
  );
}

export function SourceLinks({ ids }: { ids: string[] }) {
  const { t } = useI18n();
  return (
    <div className="text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">{t('field.sources')}:</span>{' '}
      {ids.map((id, i) => {
        const s = getSource(id);
        return s ? (
          <span key={id}>
            {i > 0 && ' · '}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
              {s.publisher}
            </a>
          </span>
        ) : null;
      })}
    </div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted no-print">
      ← {t('prac.toList')}
    </button>
  );
}
