import { useMemo, useState } from 'react';
import { AUDIT_SCENARIOS } from '../../data/practicum/audit';
import { useI18n } from '../../i18n';
import { ModelBadge } from '../../components/ui/Badges';
import { Panel } from '../../components/ui/Controls';
import { scoreAudit, type AuditResult } from '../../utils/practicum';
import { makeAttempt, type Attempt } from '../../utils/journal';
import { BackButton, LevelBadge, ScenarioList, ScoreBanner, SourceLinks } from './shared';

interface Props { attempts: Attempt[]; onAttempt: (a: Attempt) => void }
type Stage = 'mark' | 'explain' | 'done';

export default function AuditView({ attempts, onAttempt }: Props) {
  const { t, loc, lang } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const [marked, setMarked] = useState<string[]>([]);
  const [stage, setStage] = useState<Stage>('mark');
  const [mech, setMech] = useState<Record<string, number | undefined>>({});
  const [alt, setAlt] = useState<Record<string, number | undefined>>({});
  const [result, setResult] = useState<AuditResult | null>(null);

  const s = AUDIT_SCENARIOS.find((x) => x.id === openId);
  const items = useMemo(() => AUDIT_SCENARIOS.map((x) => ({ id: x.id, title: loc(x.title), level: x.level })), [lang]);

  const open = (id: string) => { setOpenId(id); setMarked([]); setStage('mark'); setMech({}); setAlt({}); setResult(null); };
  if (!s) return <ScenarioList items={items} module="audit" attempts={attempts} onOpen={open} intro={t('audit.intro')} />;

  const errorFrags = s.fragments.filter((f) => f.errorId);
  const found = errorFrags.filter((f) => marked.includes(f.id));
  const falsePos = marked.filter((id) => !errorFrags.some((f) => f.id === id));
  const missed = errorFrags.length - found.length;

  const toggle = (id: string) => { if (stage === 'mark') setMarked((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id])); };

  const finish = (m: Record<string, number | undefined>, a: Record<string, number | undefined>) => {
    const r = scoreAudit(s, { marked, mechanism: m, alternative: a });
    setResult(r);
    setStage('done');
    onAttempt(makeAttempt({ module: 'audit', scenarioId: s.id, score: r.total, max: r.max, hints: 0, tests: 0, mistakes: r.mistakes }));
  };

  const checkMarks = () => {
    if (found.length === 0) finish({}, {});
    else setStage('explain');
  };

  const allAnswered = found.every((f) => mech[f.errorId as string] !== undefined && alt[f.errorId as string] !== undefined);

  const fragClass = (id: string) => {
    const isErr = errorFrags.some((f) => f.id === id);
    const isMarked = marked.includes(id);
    if (stage === 'mark') return isMarked ? 'border-primary bg-accent/50' : 'border-border hover:bg-muted';
    if (isMarked && isErr) return 'border-success bg-success/15';
    if (isMarked && !isErr) return 'border-destructive bg-destructive/10';
    if (stage === 'done' && isErr) return 'border-warning bg-warning/15';
    return 'border-border';
  };

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BackButton onClick={() => setOpenId(null)} />
        <div className="flex items-center gap-2"><LevelBadge level={s.level} /><ModelBadge type="approx" /></div>
      </div>

      <Panel title={loc(s.title)}>
        <p className="mb-3 text-sm text-muted-foreground">{t(stage === 'mark' ? 'audit.step1' : stage === 'explain' ? 'audit.step2' : 'audit.step3')}</p>
        <ol className="space-y-2">
          {s.fragments.map((f, i) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => toggle(f.id)}
                aria-pressed={marked.includes(f.id)}
                disabled={stage !== 'mark'}
                className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-colors ${fragClass(f.id)}`}
              >
                <span className="mr-2 font-mono text-xs text-muted-foreground">{i + 1}.</span>
                {loc(f.text)}
                {stage !== 'mark' && marked.includes(f.id) && (
                  <span className="ml-2 text-xs font-semibold">{errorFrags.some((e) => e.id === f.id) ? t('audit.markOk') : t('audit.markBad')}</span>
                )}
                {stage === 'done' && !marked.includes(f.id) && f.errorId && <span className="ml-2 text-xs font-semibold">{t('audit.markMissed')}</span>}
              </button>
            </li>
          ))}
        </ol>
        {stage === 'mark' && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={checkMarks} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">{t('audit.checkMarks')}</button>
            <span className="text-xs text-muted-foreground">{t('audit.marked', { n: marked.length })}</span>
          </div>
        )}
        {stage !== 'mark' && (
          <p className="mt-3 text-sm" aria-live="polite">
            {t('audit.feedback', { found: found.length, fp: falsePos.length, missed })}
          </p>
        )}
      </Panel>

      {stage === 'explain' && (
        <div className="space-y-4">
          {found.map((f) => {
            const e = s.errors.find((x) => x.id === f.errorId)!;
            return (
              <Panel key={e.id} title={`${t('audit.errorIn')}: «${loc(f.text)}»`}>
                <fieldset className="space-y-1.5">
                  <legend className="mb-1 text-sm font-semibold">{t('audit.mechanism')}</legend>
                  {e.mechanism.options.map((o, i) => (
                    <label key={i} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm ${mech[e.id] === i ? 'border-primary bg-accent/40' : 'border-border'}`}>
                      <input type="radio" className="mt-1" name={`m-${e.id}`} checked={mech[e.id] === i} onChange={() => setMech((m) => ({ ...m, [e.id]: i }))} />
                      <span>{loc(o)}</span>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="mt-3 space-y-1.5">
                  <legend className="mb-1 text-sm font-semibold">{t('audit.alternative')}</legend>
                  {e.alternative.options.map((o, i) => (
                    <label key={i} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm ${alt[e.id] === i ? 'border-primary bg-accent/40' : 'border-border'}`}>
                      <input type="radio" className="mt-1" name={`a-${e.id}`} checked={alt[e.id] === i} onChange={() => setAlt((m) => ({ ...m, [e.id]: i }))} />
                      <span>{loc(o)}</span>
                    </label>
                  ))}
                </fieldset>
              </Panel>
            );
          })}
          <button type="button" onClick={() => finish(mech, alt)} disabled={!allAnswered} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{t('audit.finish')}</button>
        </div>
      )}

      {stage === 'done' && result && (
        <Panel title={t('mix.result')}>
          <div className="space-y-4 text-sm" aria-live="polite">
            <ScoreBanner score={result.total} max={result.max} />
            <ul className="grid gap-2 sm:grid-cols-4">
              <li className="rounded-lg bg-muted p-2">{t('audit.res.found')}: <strong>{result.found}/{errorFrags.length}</strong></li>
              <li className="rounded-lg bg-muted p-2">{t('audit.res.fp')}: <strong>{result.falsePositives}</strong></li>
              <li className="rounded-lg bg-muted p-2">{t('audit.res.mech')}: <strong>{result.mechanismOk}</strong></li>
              <li className="rounded-lg bg-muted p-2">{t('audit.res.alt')}: <strong>{result.alternativeOk}</strong></li>
            </ul>
            {s.errors.map((e) => (
              <div key={e.id} className="rounded-lg border border-border bg-background p-3">
                <div className="font-semibold">{t('audit.correctMech')}</div>
                <p>{loc(e.mechanism.options[e.mechanism.correct])}</p>
                <div className="mt-2 font-semibold">{t('audit.correctAlt')}</div>
                <p>{loc(e.alternative.options[e.alternative.correct])}</p>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="mb-1 font-semibold">{t('prac.expert')}</div>
              <p>{loc(s.explanation)}</p>
            </div>
            <SourceLinks ids={s.sourceIds} />
            <div className="flex gap-2 no-print">
              <button type="button" onClick={() => open(s.id)} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">{t('prac.retry')}</button>
              <BackButton onClick={() => setOpenId(null)} />
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
