import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, RotateCcw, Square } from 'lucide-react';
import { getSource } from '../../../data/sources';
import { useI18n } from '../../../i18n';
import { useStoredState } from '../../../hooks/useStoredState';
import { ChemEquation } from '../../../components/chemistry/ChemFormula';
import { ModelBadge } from '../../../components/ui/Badges';
import { Panel, SelectField } from '../../../components/ui/Controls';
import {
  N_LAYERS, RAIN_LAYERS, SOIL_CEC, advance, allAnionsOut, countBySpecies, deepest, initialState, nitrify,
  type ColumnFertilizer, type ColumnState, type Level, type Params, type Rain, type SoilType, type Species,
} from '../../../utils/soil-column';

const MAX_STEPS = 12;
const INIT: Params = { fertilizer: 'potassium-chloride', soil: 'loam', rain: 'moderate', amount: 'medium' };

const SPECIES_STYLE: Record<Species, { color: string; row: number; shape: 'circle' | 'square' }> = {
  K: { color: 'var(--olive)', row: 0, shape: 'circle' },
  NH4: { color: 'var(--primary)', row: 0, shape: 'circle' },
  Ca: { color: 'var(--earth)', row: 1, shape: 'circle' },
  Cl: { color: 'var(--chart-2)', row: 2, shape: 'square' },
  NO3: { color: 'var(--chart-4)', row: 2, shape: 'square' },
};
const SPECIES_LABEL: Record<Species, string> = { K: 'K⁺', NH4: 'NH₄⁺', Ca: 'Ca²⁺', Cl: 'Cl⁻', NO3: 'NO₃⁻' };

const SRC_COL = ['ipni-kcl', 'alberta-cec', 'ksu-chloride', 'pioneer-k', 'va-dcr-p', 'isu-nh3', 'usda-nrcs-an'];

function Column({ state, soil }: { state: ColumnState; soil: SoilType }) {
  const LH = 48;
  const top = 20;
  const x0 = 50;
  const layerTint = soil === 'sand' ? 0.12 : soil === 'loamy-sand' ? 0.16 : soil === 'loam' ? 0.22 : soil === 'clay' ? 0.3 : 0.38;
  // позиції частинок у шарі
  const slots: Record<string, number> = {};
  const particles = state.particles.filter((p) => p.pos !== 'out').map((p) => {
    const layer = p.pos as number;
    const style = SPECIES_STYLE[p.species];
    const key = `${layer}-${style.row}`;
    const k = (slots[key] = (slots[key] ?? -1) + 1);
    return { p, x: x0 + 8 + (k % 15) * 9.2, y: top + layer * LH + 11 + style.row * 14 + Math.floor(k / 15) * 5, style };
  });
  const out = state.particles.filter((p) => p.pos === 'out');
  return (
    <svg viewBox="0 0 360 372" role="img" aria-label="soil column" className="mx-auto w-full max-w-md">
      <rect x="0" y="0" width="360" height="372" rx="14" fill="var(--muted)" />
      {Array.from({ length: N_LAYERS }, (_, i) => (
        <g key={i}>
          <rect x={x0} y={top + i * LH} width="150" height={LH} fill="var(--earth)" opacity={layerTint + (1 - i / N_LAYERS) * 0.18} stroke="var(--border)" />
          <text x={x0 - 8} y={top + i * LH + LH / 2 + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">{i + 1}</text>
        </g>
      ))}
      <text x={x0 + 75} y={12} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">↓</text>
      {particles.map(({ p, x, y, style }) =>
        style.shape === 'circle' ? (
          <circle key={p.id} cx={x} cy={y} r="3.8" fill={style.color} stroke="var(--foreground)" strokeWidth="0.6" />
        ) : (
          <rect key={p.id} x={x - 3.6} y={y - 3.6} width="7.2" height="7.2" fill={style.color} stroke="var(--foreground)" strokeWidth="0.6" />
        ),
      )}
      <rect x={x0} y={top + N_LAYERS * LH + 14} width="150" height="40" rx="8" fill="var(--chart-2)" opacity="0.18" stroke="var(--border)" />
      <text x={x0 + 75} y={top + N_LAYERS * LH + 38} textAnchor="middle" fontSize="12" fill="var(--foreground)">
        {out.length > 0 ? `↓ ${out.length}` : ''}
      </text>
    </svg>
  );
}

export default function SoilColumnView() {
  const { t, lang } = useI18n();
  const [params, setParams, resetParams] = useStoredState<Params>('lab.column', INIT);
  const [history, setHistory] = useState<ColumnState[]>(() => [initialState(params)]);
  const [auto, setAuto] = useState(false);
  const [answer, setAnswer] = useState(false);
  const state = history[history.length - 1];
  const finished = state.step >= MAX_STEPS || allAnionsOut(state);

  // зміна параметрів починає експеримент спочатку
  useEffect(() => {
    setHistory([initialState(params)]);
    setAuto(false);
    setAnswer(false);
  }, [params.fertilizer, params.soil, params.rain, params.amount]);

  const step = () => setHistory((h) => (h[h.length - 1].step >= MAX_STEPS ? h : [...h, advance(h[h.length - 1], params)]));
  const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  const doNitrify = () => setHistory((h) => (h[h.length - 1].nitrified ? h : [...h, nitrify(h[h.length - 1])]));
  const restart = () => { setHistory([initialState(params)]); setAuto(false); };

  useEffect(() => {
    if (!auto) return;
    if (finished) { setAuto(false); return; }
    const id = window.setTimeout(step, 900);
    return () => window.clearTimeout(id);
  }, [auto, history]);

  const counts = useMemo(() => countBySpecies(state), [state]);
  const species: Species[] = params.fertilizer === 'potassium-chloride' ? ['K', 'Cl', 'Ca'] : state.nitrified ? ['NH4', 'NO3'] : ['NH4', 'NO3'];
  const cation: Species = params.fertilizer === 'potassium-chloride' ? 'K' : 'NH4';
  const anion: Species = params.fertilizer === 'potassium-chloride' ? 'Cl' : 'NO3';
  const depth = (s: Species) => { const d = deepest(state, s); return d < 0 ? '—' : String(d + 1); };
  const lvl = (l: Level) => t(`col.level.${l}`);

  const set = (p: Partial<Params>) => setParams((s) => ({ ...s, ...p }));
  const eqs = params.fertilizer === 'potassium-chloride'
    ? ['KCl -> K^+ + Cl^-', 'CaX2 + 2K^+ <-> 2KX + Ca^2+']
    : ['NH4NO3 -> NH4^+ + NO3^-', 'NH4^+ + 2O2 -> NO3^- + 2H^+ + H2O'];

  return (
    <div className="fade-in space-y-5">
      <Panel title={t('col.title')} right={<ModelBadge type="concept" />}>
        <div className="space-y-1 text-sm">
          <p><strong>{t('mix.goalLabel')}:</strong> {t('col.goal')}</p>
          <p className="text-muted-foreground"><strong>{t('mix.theoryLabel')}:</strong> {t('col.theory')}</p>
          <p className="rounded-lg border border-warning bg-warning/15 p-2 text-xs text-foreground">{t('col.disclaimer')}</p>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Panel title={t('mix.params')}>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField id="co-fert" label={t('conv.fertilizer')} value={params.fertilizer} onChange={(v) => set({ fertilizer: v as ColumnFertilizer })}>
              <option value="potassium-chloride">{t('col.fert.kcl')}</option>
              <option value="ammonium-nitrate">{t('col.fert.an')}</option>
            </SelectField>
            <SelectField id="co-amount" label={t('col.amount')} value={params.amount} onChange={(v) => set({ amount: v as Level })}>
              {(['low', 'medium', 'high'] as const).map((l) => <option key={l} value={l}>{lvl(l)}</option>)}
            </SelectField>
            <SelectField id="co-soil" label={t('col.soil')} value={params.soil} onChange={(v) => set({ soil: v as SoilType })}>
              {(['sand', 'loamy-sand', 'loam', 'clay', 'chernozem'] as const).map((s) => <option key={s} value={s}>{t(`col.soil.${s}`)}</option>)}
            </SelectField>
            <SelectField id="co-rain" label={t('col.rain')} value={params.rain} onChange={(v) => set({ rain: v as Rain })}>
              {(['light', 'moderate', 'heavy'] as const).map((r) => <option key={r} value={r}>{t(`col.rain.${r}`)}</option>)}
            </SelectField>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t('col.cecNote', { level: lvl(SOIL_CEC[params.soil]) })}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={back} disabled={history.length <= 1} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"><ChevronLeft size={14} /> {t('col.back')}</button>
            <button type="button" onClick={step} disabled={finished} className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{t('col.step')} <ChevronRight size={14} /></button>
            <button type="button" onClick={() => setAuto((a) => !a)} disabled={finished && !auto} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50">
              {auto ? <Square size={14} /> : <Play size={14} />} {auto ? t('col.pause') : t('col.auto')}
            </button>
            {params.fertilizer === 'ammonium-nitrate' && (
              <button type="button" onClick={doNitrify} disabled={state.nitrified || state.step === 0} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50">{t('col.nitrify')}</button>
            )}
            <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"><RotateCcw size={14} /> {t('sol.repeat')}</button>
            <button type="button" onClick={() => { resetParams(); }} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">{t('common.reset')}</button>
          </div>

          <div aria-live="polite" className="mt-4 rounded-lg bg-accent/40 p-3 text-sm">
            <div className="font-semibold">{t('col.stepN', { n: state.step, max: MAX_STEPS })}</div>
            <p>{t(`col.msg.${state.event}`, { rate: RAIN_LAYERS[params.rain] })}</p>
            {finished && <p className="mt-1 font-medium">{t('col.finished')}</p>}
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="text-sm font-semibold">{t('mix.equation')}</div>
            {eqs.map((e) => <ChemEquation key={e} equation={e} />)}
            <p className="text-xs text-muted-foreground">{t('col.xNote')}</p>
          </div>
        </Panel>

        <Panel title={t('col.profile')}>
          <Column state={state} soil={params.soil} />
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {(['K', 'NH4', 'Ca', 'Cl', 'NO3'] as Species[]).filter((s) => (params.fertilizer === 'potassium-chloride' ? ['K', 'Cl', 'Ca'] : ['NH4', 'NO3']).includes(s)).map((s) => (
              <li key={s} className="flex items-center gap-1">
                <svg width="12" height="12" aria-hidden="true">{SPECIES_STYLE[s].shape === 'circle' ? <circle cx="6" cy="6" r="5" fill={SPECIES_STYLE[s].color} stroke="var(--foreground)" strokeWidth="0.6" /> : <rect x="1" y="1" width="10" height="10" fill={SPECIES_STYLE[s].color} stroke="var(--foreground)" strokeWidth="0.6" />}</svg>
                {SPECIES_LABEL[s]} {SPECIES_STYLE[s].shape === 'circle' ? t('col.cationShape') : t('col.anionShape')}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-muted-foreground">{t('col.layersNote')}</p>
        </Panel>
      </div>

      <Panel title={t('mix.result')}>
        <div className="grid gap-5 lg:grid-cols-2 text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-1 pr-3">{t('col.ion')}</th><th className="py-1 pr-3">{t('col.inColumn')}</th><th className="py-1 pr-3">{t('col.leached')}</th><th className="py-1">{t('col.front')}</th>
              </tr>
            </thead>
            <tbody>
              {species.map((s) => (
                <tr key={s} className="border-b border-border/60">
                  <th scope="row" className="py-1.5 pr-3 text-left font-medium">{SPECIES_LABEL[s]}</th>
                  <td className="py-1.5 pr-3 font-mono">{counts[s].inColumn}</td>
                  <td className="py-1.5 pr-3 font-mono">{counts[s].out}</td>
                  <td className="py-1.5 font-mono">{depth(s)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="space-y-2">
            <p className="rounded-lg bg-muted p-3">
              {t('col.compare', { cat: SPECIES_LABEL[cation], an: SPECIES_LABEL[anion], dc: depth(cation), da: depth(anion) })}
            </p>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="mb-1 font-semibold">{t('mix.control')}</div>
              <p>{t(params.fertilizer === 'potassium-chloride' ? 'col.control.kcl.q' : 'col.control.an.q')}</p>
              <button type="button" onClick={() => setAnswer((x) => !x)} className="mt-2 rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">{t(answer ? 'mix.hideAnswer' : 'mix.showAnswer')}</button>
              {answer && <p className="mt-2 rounded-lg bg-accent/40 p-2">{t(params.fertilizer === 'potassium-chloride' ? 'col.control.kcl.a' : 'col.control.an.a')}</p>}
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground">{t('col.rules')}</div>
          <ul className="list-disc space-y-0.5 pl-5">
            <li>{t('col.rule1', { n: RAIN_LAYERS[params.rain] })}</li>
            <li>{t('col.rule2')}</li>
            <li>{t('col.rule3')}</li>
            <li>{t('col.rule4')}</li>
            <li>{t('col.rule5')}</li>
          </ul>
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
            {SRC_COL.map((id) => { const s = getSource(id); return s ? <a key={id} href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.publisher}</a> : null; })}
          </div>
          <span className="sr-only">{lang}</span>
        </div>
      </Panel>
    </div>
  );
}
