import { useEffect, useState } from 'react';
import { Check, Info, Play, RotateCcw, Square, X } from 'lucide-react';
import { FERTILIZERS, getFertilizer } from '../../../data/fertilizers';
import { getSource } from '../../../data/sources';
import { GROUPS } from '../../../data/types';
import { useI18n } from '../../../i18n';
import { useStoredState } from '../../../hooks/useStoredState';
import { LineChart } from '../../../components/charts/LineChart';
import { ChemEquation, ChemFormula } from '../../../components/chemistry/ChemFormula';
import { ModelBadge, StatusBadge } from '../../../components/ui/Badges';
import { NumField, Panel, SelectField } from '../../../components/ui/Controls';
import { validateAmount } from '../../../utils/calculations';
import { dissolve, interpolate, qualitativeOutcome, temperatureForSolubility, temperatureRange, type Outcome, type SolventId } from '../../../utils/solubility';
import { formatNumber } from '../../../utils/number-format';

interface State { fid: string; solvent: SolventId; mass: string; volume: string; temp: number; stir: boolean }
const INIT: State = { fid: 'mkp', solvent: 'water', mass: '20', volume: '100', temp: 20, stir: true };

// візуальна умовність (НЕ розрахунок): частка зерен, що зникають на схемі, для якісних результатів
const VISUAL: Record<Outcome, number> = { dissolves: 1, limited: 0.6, poor: 0.1, insoluble: 0, unknown: 0 };
const GRAINS = Array.from({ length: 16 }, (_, i): [number, number] => [92 + (i % 8) * 17, 170 + Math.floor(i / 8) * 13 + ((i * 5) % 4)]);

function Beaker({ remaining, tint, stir, settled }: { remaining: number; tint: number; stir: boolean; settled: boolean }) {
  return (
    <svg viewBox="0 0 320 230" role="img" aria-hidden="true" className="mx-auto w-full max-w-sm">
      <rect x="0" y="0" width="320" height="230" rx="14" fill="var(--muted)" />
      <path d="M70 40 H250 V196 a12 12 0 0 1 -12 12 H82 a12 12 0 0 1 -12 -12 Z" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="71" y="100" width="178" height="107" fill="var(--chart-2)" opacity={0.08 + tint * 0.42} />
      <path d="M70 100 q22 -6 44 0 t44 0 t44 0 t44 0" fill="none" stroke="var(--chart-2)" strokeWidth="2" opacity="0.7" />
      {stir && <line x1="160" y1="30" x2="160" y2="170" stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round" className="stir" style={{ transformOrigin: '160px 100px' }} />}
      {GRAINS.slice(0, remaining).map(([x, y], i) => (
        <circle key={i} cx={x} cy={settled ? y : y - ((i * 13) % 50)} r="5" fill="var(--foreground)" opacity="0.75" />
      ))}
    </svg>
  );
}

export default function SolubilityView() {
  const { t, loc, lang } = useI18n();
  const [st, setSt, reset] = useStoredState<State>('lab.solubility', INIT);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [answer, setAnswer] = useState(false);

  const f = getFertilizer(st.fid) ?? FERTILIZERS[0];
  const points = f.solubility?.byTemperature ?? [];
  const range = temperatureRange(points);
  const m = validateAmount(st.mass);
  const v = validateAmount(st.volume);
  const mErr = m.ok ? undefined : t(`conv.err.${m.error}`);
  const vErr = !v.ok ? t(`conv.err.${v.error}`) : v.value <= 0 ? t('sol.err.volume') : undefined;

  const inRange = !!range && st.temp >= range.min && st.temp <= range.max;
  const quantitative = st.solvent === 'water' && points.length > 0 && inRange;
  const S = quantitative ? interpolate(points, st.temp) : null;
  const outcomeQ = qualitativeOutcome(f.solubility, st.solvent);

  let dis = null as ReturnType<typeof dissolve> | null;
  if (quantitative && S !== null && m.ok && v.ok && v.value > 0) dis = dissolve(m.value, v.value * 1.0, S); // ρ(H₂O) ≈ 1 г/мл
  const finalFraction = dis ? (m.ok && m.value > 0 ? dis.dissolved / m.value : 1) : VISUAL[outcomeQ];

  const satT = dis && points.length ? temperatureForSolubility(points, dis.loadPer100g) : null;

  // скидання анімації при зміні параметрів
  useEffect(() => {
    setProgress(0);
    setRunning(false);
    setAnswer(false);
  }, [st.fid, st.solvent, st.mass, st.volume, st.temp]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(1, p + (st.stir ? 0.05 : 0.02));
        if (next >= 1) setRunning(false);
        return next;
      });
    }, 90);
    return () => window.clearInterval(id);
  }, [running, st.stir]);

  const canRun = !!dis || (m.ok && v.ok && v.value > 0 && outcomeQ !== 'unknown');
  const remaining = Math.max(0, Math.round(GRAINS.length * (1 - progress * finalFraction)));
  const tint = progress * Math.min(1, finalFraction === 0 ? 0 : 1);
  const settled = progress > 0.2;
  const fmt = (x: number, d = 2) => formatNumber(x, lang, d);
  const unit = t('sol.unit');

  const sourceIds = Array.from(new Set(points.map((p) => p.sourceId)));
  const solvName = (s: SolventId) => t(`sol.solvent.${s}`);

  const reactionToShow = f.reactions[0];

  return (
    <div className="fade-in space-y-5">
      <Panel title={t('sol.title')} right={<ModelBadge type="approx" />}>
        <div className="space-y-1 text-sm">
          <p><strong>{t('mix.goalLabel')}:</strong> {t('sol.goal')}</p>
          <p className="text-muted-foreground"><strong>{t('mix.theoryLabel')}:</strong> {t('sol.theory')}</p>
          <p className="text-xs text-muted-foreground">{t('sol.modelNote')}</p>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={t('mix.params')}>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField id="sl-fert" label={t('conv.fertilizer')} value={f.id} onChange={(x) => setSt((s) => ({ ...s, fid: x }))}>
              {GROUPS.map((g) => (
                <optgroup key={g} label={t(`group.${g}`)}>
                  {FERTILIZERS.filter((x) => x.group === g).map((x) => (
                    <option key={x.id} value={x.id}>{loc(x.name)}</option>
                  ))}
                </optgroup>
              ))}
            </SelectField>
            <SelectField id="sl-solv" label={t('sol.solvent')} value={st.solvent} onChange={(x) => setSt((s) => ({ ...s, solvent: x as SolventId }))}>
              {(['water', 'citric', 'citrate'] as const).map((s) => (
                <option key={s} value={s}>{solvName(s)}</option>
              ))}
            </SelectField>
            <NumField id="sl-mass" label={t('sol.mass')} value={st.mass} onChange={(x) => setSt((s) => ({ ...s, mass: x }))} unit={t('conv.unit.g')} error={mErr} />
            <NumField id="sl-vol" label={t('sol.volume')} value={st.volume} onChange={(x) => setSt((s) => ({ ...s, volume: x }))} unit={t('sol.ml')} error={vErr} hint={t('sol.densityNote')} />
          </div>
          <div className="mt-3">
            <label htmlFor="sl-temp" className="text-xs text-muted-foreground">{t('sol.temp')}: <span className="font-mono text-foreground">{st.temp} °C</span></label>
            <input id="sl-temp" type="range" min={0} max={100} step={1} value={st.temp} onChange={(e) => setSt((s) => ({ ...s, temp: Number(e.target.value) }))} className="mt-1 w-full" />
            {st.solvent === 'water' && range && !inRange && (
              <p className="mt-1 text-xs text-destructive">{t('sol.outOfRange', { min: range.min, max: range.max })}</p>
            )}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={st.stir} onChange={(e) => setSt((s) => ({ ...s, stir: e.target.checked }))} />
            {t('sol.stir')}
          </label>
          <div className="mt-3">
            <label htmlFor="sl-time" className="text-xs text-muted-foreground">{t('sol.time')}: <span className="font-mono text-foreground">{Math.round(progress * 100)} %</span></label>
            <input id="sl-time" type="range" min={0} max={100} value={Math.round(progress * 100)} onChange={(e) => { setRunning(false); setProgress(Number(e.target.value) / 100); }} className="mt-1 w-full" />
            <p className="text-xs text-muted-foreground">{t('sol.timeNote')}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={!canRun || progress >= 1} onClick={() => setRunning((r) => !r)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {running ? <Square size={14} /> : <Play size={14} />} {running ? t('col.pause') : t('sol.run')}
            </button>
            <button type="button" onClick={() => { setProgress(0); setRunning(false); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
              <RotateCcw size={14} /> {t('sol.repeat')}
            </button>
            <button type="button" onClick={() => { reset(); setProgress(0); setRunning(false); }} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">{t('common.reset')}</button>
          </div>
        </Panel>

        <Panel title={t('mix.reactor')}>
          <Beaker remaining={remaining} tint={tint} stir={running && st.stir} settled={settled} />
          <p className="mt-1 text-center text-xs text-muted-foreground">{t('sol.visualNote')}</p>
        </Panel>
      </div>

      <Panel title={t('mix.result')}>
        <div aria-live="polite" className="space-y-3 text-sm">
          <div className="font-medium">
            {loc(f.name)} · {solvName(st.solvent)} · {st.temp} °C
          </div>
          {dis && S !== null ? (
            <>
              <div className={`flex items-center gap-2 rounded-xl border-2 p-3 font-semibold ${dis.saturated ? 'border-warning bg-warning/20' : 'border-success bg-success/15'}`}>
                {dis.saturated ? <Info size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
                {dis.saturated ? t('sol.res.saturated') : t('sol.res.unsaturated')}
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">{t('sol.res.S')}</div><div className="font-mono">{fmt(S)} {unit}</div></div>
                <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">{t('sol.res.limit')}</div><div className="font-mono">{fmt(dis.limit)} {t('conv.unit.g')}</div></div>
                <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">{t('sol.res.dissolved')}</div><div className="font-mono">{fmt(dis.dissolved)} {t('conv.unit.g')}</div></div>
                <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">{t('sol.res.residue')}</div><div className="font-mono">{fmt(dis.residue)} {t('conv.unit.g')}</div></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('sol.res.load', { v: fmt(dis.loadPer100g) })}{' '}
                {satT === null ? t('sol.res.noFull', { max: range?.max ?? 0 }) : t('sol.res.fullFrom', { t: fmt(satT, 1) })}
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <div className={`rounded-xl border-2 p-3 font-semibold ${outcomeQ === 'dissolves' ? 'border-success bg-success/15' : outcomeQ === 'unknown' ? 'border-border bg-muted' : 'border-warning bg-warning/20'}`}>
                {t(`sol.out.${outcomeQ}`)}
              </div>
              <p className="text-xs text-muted-foreground">{t(st.solvent === 'water' && points.length > 0 ? 'sol.qualOutOfRange' : 'sol.noNumbers')}</p>
              {f.solubility?.note && <p className="text-xs">{loc(f.solubility.note)}</p>}
            </div>
          )}
          {f.solubility && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <StatusBadge status={f.solubility.status} />
              {f.sources.filter((s) => (f.evidence?.solubility ?? []).includes(s.id)).map((s) => {
                const src = getSource(s.id);
                return src ? <a key={s.id} href={src.url} target="_blank" rel="noopener noreferrer" className="underline">{src.publisher}</a> : null;
              })}
            </div>
          )}
        </div>
      </Panel>

      {points.length > 0 && (
        <Panel title={t('sol.chart')}>
          <LineChart
            label={t('sol.chartLabel', { n: loc(f.name) })}
            series={[{ id: 's', label: loc(f.name), color: 'var(--primary)', points: points.map((p) => [p.tC, p.gPer100gWater] as [number, number]), dots: true }]}
            xDomain={[0, 100]}
            yDomain={[0, Math.ceil(Math.max(...points.map((p) => p.gPer100gWater), dis?.loadPer100g ?? 0) / 10) * 10 || 10]}
            xTicks={[0, 20, 40, 60, 80, 100]}
            yTicks={(() => {
              const top = Math.ceil(Math.max(...points.map((p) => p.gPer100gWater), dis?.loadPer100g ?? 0) / 10) * 10 || 10;
              return [0, top / 4, top / 2, (3 * top) / 4, top];
            })()}
            xLabel={t('sol.axisT')}
            yLabel={t('sol.axisS')}
            vLine={st.temp}
            hLine={dis?.loadPer100g}
            fmtY={(x) => String(Math.round(x))}
          />
          <p className="mt-2 text-xs text-muted-foreground">{t('sol.chartLegend')}</p>
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer">{t('sol.dataTable')}</summary>
            <table className="mt-2 w-full max-w-md">
              <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-1">°C</th><th className="py-1">{unit}</th><th className="py-1">{t('field.sources')}</th></tr></thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.tC} className="border-b border-border/60"><td className="py-1">{p.tC}</td><td className="py-1 font-mono">{fmt(p.gPer100gWater)}</td><td className="py-1">{getSource(p.sourceId)?.publisher}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1 text-muted-foreground">{t('sol.sourcesNote', { n: sourceIds.length })}</p>
          </details>
        </Panel>
      )}

      <Panel title={t('mix.mechanism')}>
        <div className="space-y-3 text-sm">
          {reactionToShow ? (
            <>
              <ChemEquation equation={reactionToShow.equation} />
              <p className="text-muted-foreground">{loc(reactionToShow.explanation)}</p>
            </>
          ) : (
            <p className="text-muted-foreground">{t('sol.noReaction')}</p>
          )}
          {f.formula && <p className="text-xs text-muted-foreground">{t('field.formula')}: <ChemFormula formula={f.formula} /></p>}
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-1 font-semibold">{t('mix.control')}</div>
            <p>{t('sol.control.q')}</p>
            <button type="button" onClick={() => setAnswer((x) => !x)} className="mt-2 rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">
              {t(answer ? 'mix.hideAnswer' : 'mix.showAnswer')}
            </button>
            {answer && <p className="mt-2 rounded-lg bg-accent/40 p-2">{t('sol.control.a')}</p>}
          </div>
          {st.solvent !== 'water' && <p className="text-xs text-muted-foreground"><X size={12} className="mr-1 inline" aria-hidden="true" />{t('sol.citrateNote')}</p>}
        </div>
      </Panel>
    </div>
  );
}
