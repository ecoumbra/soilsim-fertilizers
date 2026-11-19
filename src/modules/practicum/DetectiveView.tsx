import { useMemo, useState } from 'react';
import { MATERIALS } from '../../data/materials';
import { GROUPS } from '../../data/types';
import { getFertilizer } from '../../data/fertilizers';
import { useI18n } from '../../i18n';
import { ChemEquation, ChemFormula } from '../../components/chemistry/ChemFormula';
import { ModelBadge } from '../../components/ui/Badges';
import { Panel } from '../../components/ui/Controls';
import { DETECTIVE_CASES, DETECTIVE_EQUATIONS, POOL, TEST_ORDER, candidates, needsAcid, runTest, scoreDetective, type Obs, type TestId } from '../../utils/detective';
import { makeAttempt, type Attempt } from '../../utils/journal';
import { BackButton, LevelBadge, ScenarioList, ScoreBanner } from './shared';

interface Props { attempts: Attempt[]; onAttempt: (a: Attempt) => void }
interface LogEntry { test: TestId; obs: Obs }

export default function DetectiveView({ attempts, onAttempt }: Props) {
  const { t, loc } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [answer, setAnswer] = useState('');
  const [done, setDone] = useState<ReturnType<typeof scoreDetective> | null>(null);

  const c = DETECTIVE_CASES.find((x) => x.id === openId);
  const sample = c ? getFertilizer(c.sampleId) : undefined;
  const items = useMemo(() => DETECTIVE_CASES.map((x, i) => ({ id: x.id, title: t('det.sampleN', { n: i + 1 }), level: x.level, extra: <div className="mt-1 text-xs text-muted-foreground">{t('det.budget', { n: x.budget })}</div> })), [t]);

  const open = (id: string) => { setOpenId(id); setLog([]); setAnswer(''); setDone(null); };
  const prepared = !!sample && needsAcid(sample) && log.some((l) => l.test === 'hcl');
  const left = c ? c.budget - log.length : 0;

  const run = (test: TestId) => {
    if (!sample || left <= 0 || done) return;
    setLog((l) => [...l, { test, obs: runTest(test, sample, prepared) }]);
  };

  const finish = () => {
    if (!sample || !c || !answer || done) return;
    const r = scoreDetective(sample, answer, log.map((l) => l.test));
    setDone(r);
    onAttempt(makeAttempt({ module: 'detective', scenarioId: c.id, score: r.total, max: r.max, hints: 0, tests: log.length, mistakes: r.mistakes }));
  };

  if (!c || !sample) {
    return <ScenarioList items={items} module="detective" attempts={attempts} onOpen={open} intro={t('det.intro')} />;
  }

  const obsText = (e: LogEntry): string => {
    if (e.obs.result === 'not-dissolved') return t('det.obs.not-dissolved');
    const base = t(`det.obs.${e.test}.${e.obs.result}`);
    if (e.test === 'flame' && e.obs.colors) return `${base} ${e.obs.colors.map((col) => t(`det.color.${col}`)).join(' + ')}`;
    return base;
  };

  const remaining = done ? candidates(log.map((l) => l.test), log.map((l) => l.obs)) : [];

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BackButton onClick={() => setOpenId(null)} />
        <div className="flex items-center gap-2"><LevelBadge level={c.level} /><ModelBadge type="approx" /></div>
      </div>

      <Panel title={t('det.sampleN', { n: DETECTIVE_CASES.indexOf(c) + 1 })}>
        <p className="text-sm">{t('det.task')}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t('det.note')}</p>
        <p className="mt-2 text-sm font-semibold" aria-live="polite">{t('det.left', { n: Math.max(0, left), max: c.budget })}</p>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Panel title={t('det.tests')}>
          <div className="space-y-2">
            {TEST_ORDER.map((tid) => (
              <button key={tid} type="button" onClick={() => run(tid)} disabled={left <= 0 || !!done} className="w-full rounded-lg border border-border bg-background p-2 text-left text-sm hover:bg-muted disabled:opacity-50">
                <div className="font-medium">{t(`det.test.${tid}`)}</div>
                <div className="text-xs text-muted-foreground">{t(`det.test.${tid}.desc`)}</div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title={t('det.log')}>
          {log.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('det.logEmpty')}</p>
          ) : (
            <ol className="space-y-2 text-sm" aria-live="polite">
              {log.map((e, i) => (
                <li key={i} className="rounded-lg border border-border bg-background p-2">
                  <div className="font-medium">{i + 1}. {t(`det.test.${e.test}`)}</div>
                  <div>{obsText(e)}</div>
                  {(e.obs.result === 'positive' || e.obs.result === 'effervescence') && DETECTIVE_EQUATIONS[e.test] && <div className="mt-1"><ChemEquation equation={DETECTIVE_EQUATIONS[e.test] as string} /></div>}
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <Panel title={t('det.answer')}>
        <label htmlFor="det-ans" className="text-xs text-muted-foreground">{t('det.pick')}</label>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <select id="det-ans" disabled={!!done} value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full max-w-md rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">{t('compare.pick')}</option>
            {GROUPS.map((g) => (
              <optgroup key={g} label={t(`group.${g}`)}>
                {POOL.filter((f) => f.group === g).map((f) => <option key={f.id} value={f.id}>{loc(f.name)}</option>)}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={finish} disabled={!answer || !!done || log.length === 0} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{t('det.submit')}</button>
        </div>
        {log.length === 0 && <p className="mt-1 text-xs text-muted-foreground">{t('det.needTest')}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{t('det.poolNote', { n: MATERIALS.length })}</p>
      </Panel>

      {done && (
        <Panel title={t('mix.result')}>
          <div className="space-y-3 text-sm" aria-live="polite">
            <ScoreBanner score={done.total} max={done.max} />
            <p><strong>{t('det.theSample')}:</strong> {loc(sample.name)}{sample.formula && <> (<ChemFormula formula={sample.formula} />)</>}</p>
            <p>{done.exact ? t('det.exact') : done.inGroup ? t('det.inGroup') : t('det.wrong')}</p>
            {done.group.length > 1 && (
              <p className="rounded-lg border border-warning bg-warning/15 p-2">
                {t('det.groupNote', { list: done.group.map((f) => loc(f.name)).join(', ') })}
              </p>
            )}
            <p>{t('det.candidates', { n: remaining.length, list: remaining.map((f) => loc(f.name)).join(', ') })}</p>
            <p>{t('det.efficiency', { used: log.length, min: done.min })}</p>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="mb-1 font-semibold">{t('prac.expert')}</div>
              <p>{t('det.ions')}: {[...sample.ions.cations, ...sample.ions.anions, ...(sample.ions.neutral ?? [])].map((ion, i) => <span key={ion}>{i > 0 && ', '}<ChemFormula formula={ion} /></span>)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('det.nonspecific')}</p>
            </div>
            <div className="flex gap-2 no-print">
              <button type="button" onClick={() => open(c.id)} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">{t('prac.retry')}</button>
              <BackButton onClick={() => setOpenId(null)} />
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
