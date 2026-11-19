import { useMemo, useState } from 'react';
import { DIAG_SCENARIOS } from '../../data/practicum/diagnosis';
import { HYPOTHESES, type HypothesisId } from '../../data/practicum/types';
import { MATERIALS, getMaterial } from '../../data/materials';
import { GROUPS } from '../../data/types';
import { useI18n } from '../../i18n';
import { ModelBadge } from '../../components/ui/Badges';
import { Panel } from '../../components/ui/Controls';
import { DIAG_MAX, scoreDiagnosis, type DiagResult } from '../../utils/practicum';
import { makeAttempt, type Attempt } from '../../utils/journal';
import { BackButton, LevelBadge, ScenarioList, ScoreBanner, SourceLinks } from './shared';
import { PATTERN_BY_SCENARIO, SymptomLeaf } from './SymptomLeaf';

interface Props { attempts: Attempt[]; onAttempt: (a: Attempt) => void }

export default function DiagnosisView({ attempts, onAttempt }: Props) {
  const { t, loc, lang } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const [hyp, setHyp] = useState<HypothesisId | ''>('');
  const [fert, setFert] = useState('');
  const [rat, setRat] = useState<string[]>([]);
  const [hints, setHints] = useState(0);
  const [note, setNote] = useState('');
  const [result, setResult] = useState<DiagResult | null>(null);

  const s = DIAG_SCENARIOS.find((x) => x.id === openId);
  const items = useMemo(() => DIAG_SCENARIOS.map((x) => ({ id: x.id, title: loc(x.title), level: x.level, extra: x.ambiguous ? <div className="mt-1 text-xs text-warning-foreground"><span className="rounded bg-warning px-1.5 py-0.5">{t('prac.ambiguous')}</span></div> : undefined })), [lang]);

  const open = (id: string) => { setOpenId(id); setHyp(''); setFert(''); setRat([]); setHints(0); setNote(''); setResult(null); };
  const submit = () => {
    if (!s || result) return;
    const r = scoreDiagnosis(s, { hypothesis: hyp, fert, rationale: rat, hintsUsed: hints });
    setResult(r);
    onAttempt(makeAttempt({ module: 'diagnosis', scenarioId: s.id, score: r.total, max: DIAG_MAX, hints, tests: 0, mistakes: r.mistakes }));
  };

  if (!s) {
    return <ScenarioList items={items} module="diagnosis" attempts={attempts} onOpen={open} intro={t('diag.intro')} />;
  }

  const canSubmit = hyp !== '' && fert !== '' && !result;
  const fertName = (id: string) => { const m = getMaterial(id); return m ? loc(m.name) : t('diag.none'); };
  const bestFerts = Object.entries(s.fert).filter(([, v]) => v === 3).map(([id]) => fertName(id));

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BackButton onClick={() => setOpenId(null)} />
        <div className="flex items-center gap-2"><LevelBadge level={s.level} /><ModelBadge type="approx" /></div>
      </div>
      <Panel title={loc(s.title)}>
        <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
          <div>
            <SymptomLeaf pattern={PATTERN_BY_SCENARIO[s.id] ?? 'older-pale'} label={t('diag.schemeLabel')} />
            <p className="mt-1 text-center text-xs text-muted-foreground">{t('diag.schemeNote')}</p>
          </div>
          <dl className="space-y-1.5 text-sm">
            <div><dt className="inline font-semibold">{t('diag.soil')}: </dt><dd className="inline">{loc(s.field.soil)}</dd></div>
            <div><dt className="inline font-semibold">pH: </dt><dd className="inline">{s.field.pH.toString().replace('.', lang === 'uk' ? ',' : '.')}</dd></div>
            <div><dt className="inline font-semibold">{t('diag.crop')}: </dt><dd className="inline">{loc(s.field.crop)}</dd></div>
            <div><dt className="font-semibold">{t('diag.symptoms')}:</dt><dd><ul className="list-disc pl-5">{s.field.symptoms.map((x, i) => <li key={i}>{loc(x)}</li>)}</ul></dd></div>
            <div><dt className="inline font-semibold">{t('diag.tests')}: </dt><dd className="inline">{loc(s.field.tests)}</dd></div>
            <div><dt className="inline font-semibold">{t('diag.history')}: </dt><dd className="inline">{loc(s.field.history)}</dd></div>
          </dl>
        </div>
        {s.ambiguous && <p className="mt-3 rounded-lg border border-warning bg-warning/15 p-2 text-xs">{t('diag.ambiguousNote')}</p>}
        <p className="mt-2 text-xs text-muted-foreground">{t('diag.scopeNote')}</p>
      </Panel>

      <Panel title={t('diag.step1')}>
        <fieldset disabled={!!result} className="grid gap-2 sm:grid-cols-2">
          <legend className="sr-only">{t('diag.step1')}</legend>
          {HYPOTHESES.map((h) => (
            <label key={h.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm ${hyp === h.id ? 'border-primary bg-accent/40' : 'border-border'}`}>
              <input type="radio" name="hyp" value={h.id} checked={hyp === h.id} onChange={() => setHyp(h.id)} />
              {loc(h.label)}
            </label>
          ))}
        </fieldset>
      </Panel>

      <Panel title={t('diag.step2')}>
        <label htmlFor="dg-fert" className="text-xs text-muted-foreground">{t('diag.pickFert')}</label>
        <select id="dg-fert" disabled={!!result} value={fert} onChange={(e) => setFert(e.target.value)} className="mt-1 block w-full max-w-md rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="">{t('compare.pick')}</option>
          <option value="none">{t('diag.none')}</option>
          {GROUPS.map((g) => (
            <optgroup key={g} label={t(`group.${g}`)}>
              {MATERIALS.filter((m) => m.group === g).map((m) => <option key={m.id} value={m.id}>{loc(m.name)}</option>)}
            </optgroup>
          ))}
          <optgroup label={t('mix.amendments')}>
            {MATERIALS.filter((m) => m.kind === 'amendment').map((m) => <option key={m.id} value={m.id}>{loc(m.name)}</option>)}
          </optgroup>
        </select>
      </Panel>

      <Panel title={t('diag.step3')}>
        <fieldset disabled={!!result} className="space-y-2">
          <legend className="sr-only">{t('diag.step3')}</legend>
          {s.rationale.map((r) => (
            <label key={r.id} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm ${rat.includes(r.id) ? 'border-primary bg-accent/40' : 'border-border'}`}>
              <input type="checkbox" className="mt-1" checked={rat.includes(r.id)} onChange={(e) => setRat((p) => (e.target.checked ? [...p, r.id] : p.filter((x) => x !== r.id)))} />
              <span>{loc(r.text)}</span>
            </label>
          ))}
        </fieldset>
        <div className="mt-3">
          <label htmlFor="dg-note" className="text-xs text-muted-foreground">{t('diag.note')}</label>
          <textarea id="dg-note" disabled={!!result} value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-sm" />
          <p className="text-xs text-muted-foreground">{t('diag.noteHint')}</p>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={submit} disabled={!canSubmit} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{t('prac.check')}</button>
        <button type="button" onClick={() => setHints((h) => Math.min(2, h + 1))} disabled={hints >= 2 || !!result} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50">
          {t('prac.hint', { n: hints, max: 2 })}
        </button>
      </div>
      {hints > 0 && (
        <ul className="space-y-1 rounded-lg border border-border bg-card p-3 text-sm" aria-live="polite">
          {s.hints.slice(0, hints).map((h, i) => <li key={i}><strong>{t('prac.hintLabel', { n: i + 1 })}:</strong> {loc(h)}</li>)}
          <li className="text-xs text-muted-foreground">{t('prac.hintCost')}</li>
        </ul>
      )}

      {result && (
        <Panel title={t('mix.result')}>
          <div className="space-y-4 text-sm" aria-live="polite">
            <ScoreBanner score={result.total} max={result.max} />
            <ul className="grid gap-2 sm:grid-cols-4">
              <li className="rounded-lg bg-muted p-2">{t('diag.pts.hyp')}: <strong>{result.hypothesisPts}/3</strong></li>
              <li className="rounded-lg bg-muted p-2">{t('diag.pts.fert')}: <strong>{result.fertPts}/3</strong></li>
              <li className="rounded-lg bg-muted p-2">{t('diag.pts.rat')}: <strong>{result.rationalePts}/2</strong></li>
              <li className="rounded-lg bg-muted p-2">{t('diag.pts.hints')}: <strong>−{result.hintPenalty}</strong></li>
            </ul>
            <div className="space-y-1">
              <p><strong>{t('diag.correctHyp')}:</strong> {loc(HYPOTHESES.find((h) => h.id === s.primary)!.label)}
                {s.acceptable.length > 0 && <> · {t('diag.acceptable')}: {s.acceptable.map((a) => loc(HYPOTHESES.find((h) => h.id === a)!.label)).join(', ')}</>}</p>
              <p><strong>{t('diag.bestFert')}:</strong> {bestFerts.join(', ')}</p>
              <p className="text-muted-foreground">{t('diag.yourFert')}: {fertName(fert)} — {t(`diag.fertScore.${s.fert[fert] ?? 0}`)}</p>
            </div>
            <div>
              <div className="mb-1 font-semibold">{t('diag.rationaleReview')}</div>
              <ul className="space-y-1">
                {s.rationale.map((r) => (
                  <li key={r.id} className={`rounded-lg border p-2 ${r.correct ? 'border-success' : 'border-border'}`}>
                    {rat.includes(r.id) ? '☑' : '☐'} {loc(r.text)} <span className="text-xs text-muted-foreground">— {t(r.correct ? 'diag.true' : 'diag.false')}</span>
                  </li>
                ))}
              </ul>
            </div>
            {note.trim() && <p className="rounded-lg bg-muted p-2 text-xs"><strong>{t('diag.yourNote')}:</strong> {note}</p>}
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
