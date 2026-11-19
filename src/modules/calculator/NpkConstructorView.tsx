import { useMemo, useState } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import { FERTILIZERS, getFertilizer } from '../../data/fertilizers';
import { getMaterial } from '../../data/materials';
import type { Fertilizer } from '../../data/types';
import { useI18n } from '../../i18n';
import { useStoredState } from '../../hooks/useStoredState';
import { ChemFormula } from '../../components/chemistry/ChemFormula';
import { ModelBadge } from '../../components/ui/Badges';
import { NumField, Panel } from '../../components/ui/Controls';
import { validateAmount } from '../../utils/calculations';
import { mixIssues } from '../../utils/compat-engine';
import { defaultGradeId, isSolidFertilizer, npkComponent } from '../../utils/fertilizer-calc';
import { NUTRIENT_NAMES, mixtureComposition, solveMixture, type MixComponent, type MixSolution, type SolveResult, type Target } from '../../utils/mixture-solver';
import { formatNumber, parseNumber } from '../../utils/number-format';

interface State {
  mode: 'free' | 'solve';
  ids: string[];
  masses: Record<string, string>;
  grades: Record<string, string>;
  included: Record<string, boolean>;
  target: { N: string; P2O5: string; K2O: string };
  base: string;
}
const INIT: State = {
  mode: 'free',
  ids: ['ammophos', 'dap', 'urea', 'ammonium-nitrate', 'potassium-chloride', 'potassium-sulfate', 'nitroammophoska'],
  masses: { ammophos: '100', 'potassium-chloride': '100' },
  grades: {},
  included: {},
  target: { N: '8', P2O5: '20', K2O: '20' },
  base: '100',
};

interface Comp extends MixComponent { f: Fertilizer; gradeId?: string }

export default function NpkConstructorView() {
  const { t, loc, lang } = useI18n();
  const [st, setSt, reset] = useStoredState<State>('calc.npk', INIT);
  const [res, setRes] = useState<{ result: SolveResult; comps: Comp[]; target: Target; base: number } | null>(null);
  const [sel, setSel] = useState(0);
  const [formError, setFormError] = useState<string | undefined>();

  const set = (p: Partial<State>) => setSt((s) => ({ ...s, ...p }));
  const fmt = (v: number, d = 2) => formatNumber(v, lang, d);

  const comps: Comp[] = useMemo(
    () =>
      st.ids
        .map((id) => getFertilizer(id))
        .filter((f): f is Fertilizer => !!f)
        .map((f) => {
          const gradeId = f.grades?.length ? (st.grades[f.id] ?? defaultGradeId(f)) : undefined;
          return { id: f.id, f, gradeId, ...npkComponent(f, gradeId) };
        }),
    [st.ids, st.grades],
  );

  const addable = FERTILIZERS.filter((f) => {
    if (st.ids.includes(f.id) || !isSolidFertilizer(f)) return false;
    const c = npkComponent(f, defaultGradeId(f));
    return c.N + c.P2O5 + c.K2O > 0;
  });

  // ---------- вільне конструювання ----------
  const massErrors: Record<string, string | undefined> = {};
  const items = comps.map((c) => {
    const raw = st.masses[c.id] ?? '';
    let mass = 0;
    if (raw.trim() !== '') {
      const v = validateAmount(raw);
      if (v.ok) mass = v.value;
      else massErrors[c.id] = t(`conv.err.${v.error}`);
    }
    return { ...c, mass };
  });
  const comp = mixtureComposition(items);
  const issues = mixIssues(
    items.filter((i) => i.mass > 0).map((i) => getMaterial(i.id)).filter((m): m is NonNullable<typeof m> => !!m),
    'dry',
  );

  const removeComp = (id: string) => set({ ids: st.ids.filter((x) => x !== id) });
  const gradeLabel = (c: Comp) => c.f.grades?.find((g) => g.id === c.gradeId)?.label;

  // ---------- розв'язання задачі ----------
  const solve = () => {
    setFormError(undefined);
    const tg: Target = { N: 0, P2O5: 0, K2O: 0 };
    for (const n of NUTRIENT_NAMES) {
      const raw = st.target[n];
      const v = raw.trim() === '' ? 0 : parseNumber(raw);
      if (v === null || v < 0) return setFormError(t('npk.err.target'));
      tg[n] = v;
    }
    if (tg.N + tg.P2O5 + tg.K2O > 100) return setFormError(t('npk.err.sum'));
    const b = validateAmount(st.base);
    if (!b.ok || b.value <= 0) return setFormError(t('npk.err.base'));
    const use = comps.filter((c) => st.included[c.id] !== false);
    if (use.length === 0) return setFormError(t('npk.err.none'));
    const result = solveMixture(use, tg, b.value);
    setRes({ result, comps: use, target: tg, base: b.value });
    setSel(0);
  };

  const sol: MixSolution | undefined = res?.result.solutions[sel];
  const loadToFree = () => {
    if (!sol) return;
    const masses: Record<string, string> = {};
    for (const [id, m] of Object.entries(sol.masses)) masses[id] = String(Math.round(m * 100) / 100);
    set({ masses, mode: 'free' });
  };

  const bar = (label: string, value: number, key: string) => (
    <div key={key}>
      <div className="mb-0.5 flex justify-between text-xs">
        <span className="font-medium">
          <ChemFormula formula={label} />
        </span>
        <span className="font-mono">{fmt(value)} %</span>
      </div>
      <div className="h-3 rounded-full bg-muted">
        <div className="h-3 rounded-full bg-primary" style={{ width: `${Math.min(100, (value / 60) * 100)}%` }} />
      </div>
    </div>
  );

  const solIssues = sol && res
    ? mixIssues(sol.support.map((id) => getMaterial(id)).filter((m): m is NonNullable<typeof m> => !!m), 'dry')
    : [];

  return (
    <div className="fade-in space-y-5">
      <Panel title={t('npk.title')} right={<ModelBadge type="calc" />}>
        <p className="text-sm text-muted-foreground">{t('npk.intro')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['free', 'solve'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={st.mode === m}
              onClick={() => set({ mode: m })}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${st.mode === m ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}
            >
              {t(`npk.mode.${m}`)}
            </button>
          ))}
          <button type="button" onClick={() => { reset(); setRes(null); }} className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted">
            <RotateCcw size={14} /> {t('common.reset')}
          </button>
        </div>
      </Panel>

      <Panel title={t('npk.components')}>
        <div className="space-y-2">
          {comps.map((c) => (
            <div key={c.id} className="grid items-center gap-2 rounded-lg border border-border bg-background p-3 md:grid-cols-[1.4fr_1fr_auto]">
              <div>
                <div className="font-medium">
                  {loc(c.f.name)} {gradeLabel(c) && <span className="text-muted-foreground">({gradeLabel(c)})</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {c.f.formula && <ChemFormula formula={c.f.formula} />} · N {fmt(c.N, 1)} · P₂O₅ {fmt(c.P2O5, 1)} · K₂O {fmt(c.K2O, 1)} %
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {c.f.grades && c.f.grades.length > 0 && (
                  <select
                    aria-label={t('conv.grade')}
                    value={c.gradeId}
                    onChange={(e) => set({ grades: { ...st.grades, [c.id]: e.target.value } })}
                    className="rounded-lg border border-input bg-card px-2 py-1 text-sm"
                  >
                    {c.f.grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                )}
                {st.mode === 'solve' && (
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" checked={st.included[c.id] !== false} onChange={(e) => set({ included: { ...st.included, [c.id]: e.target.checked } })} />
                    {t('npk.include')}
                  </label>
                )}
              </div>
              <button type="button" onClick={() => removeComp(c.id)} aria-label={`${t('compare.remove')}: ${loc(c.f.name)}`} className="justify-self-end rounded-lg border border-border p-1.5 hover:bg-muted">
                <X size={14} />
              </button>
              {st.mode === 'free' && (
                <div className="md:col-span-3">
                  <div className="grid items-end gap-3 sm:grid-cols-[10rem_1fr]">
                    <NumField id={`m-${c.id}`} label={t('npk.mass')} value={st.masses[c.id] ?? ''} onChange={(v) => set({ masses: { ...st.masses, [c.id]: v } })} unit={t('conv.unit.kg')} error={massErrors[c.id]} />
                    <input
                      type="range"
                      min={0}
                      max={300}
                      step={1}
                      aria-label={`${t('npk.mass')}: ${loc(c.f.name)}`}
                      value={Math.min(300, parseNumber(st.masses[c.id] ?? '') ?? 0)}
                      onChange={(e) => set({ masses: { ...st.masses, [c.id]: e.target.value } })}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="npk-add">
            {t('npk.add')}
          </label>
          <select
            id="npk-add"
            value=""
            onChange={(e) => e.target.value && set({ ids: [...st.ids, e.target.value] })}
            className="rounded-lg border border-input bg-card px-3 py-1.5 text-sm"
          >
            <option value="">{t('compare.pick')}</option>
            {addable.map((f) => (
              <option key={f.id} value={f.id}>
                {loc(f.name)}
              </option>
            ))}
          </select>
          <Plus size={14} className="text-muted-foreground" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t('npk.noLiquids')}</p>
      </Panel>

      {st.mode === 'free' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title={t('npk.result')}>
            <div aria-live="polite" className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs text-muted-foreground">{t('npk.total')}</div>
                  <div className="font-mono text-lg">{fmt(comp.total)} {t('conv.unit.kg')}</div>
                </div>
                {NUTRIENT_NAMES.map((n) => (
                  <div key={n} className="rounded-lg bg-muted p-3">
                    <div className="text-xs text-muted-foreground"><ChemFormula formula={n} /></div>
                    <div className="font-mono text-lg">{fmt(comp.kg[n])} {t('conv.unit.kg')}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">{NUTRIENT_NAMES.map((n) => bar(n, comp.percent[n], n))}</div>
              <p className="rounded-lg bg-accent/40 p-3 text-center font-mono text-base">
                N : P₂O₅ : K₂O = {fmt(comp.percent.N, 1)} : {fmt(comp.percent.P2O5, 1)} : {fmt(comp.percent.K2O, 1)}
              </p>
            </div>
          </Panel>
          <Panel title={t('npk.shares')}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[18rem] text-sm">
                <tbody>
                  {comp.shares.filter((s) => s.mass > 0).map((s) => {
                    const f = getFertilizer(s.id);
                    return (
                      <tr key={s.id} className="border-b border-border/60">
                        <th scope="row" className="py-1.5 pr-3 text-left font-medium">{f ? loc(f.name) : s.id}</th>
                        <td className="py-1.5 pr-3 font-mono">{fmt(s.mass)} {t('conv.unit.kg')}</td>
                        <td className="py-1.5 font-mono text-muted-foreground">{fmt(s.percent, 1)} %</td>
                      </tr>
                    );
                  })}
                  {comp.total === 0 && (
                    <tr><td className="py-2 text-muted-foreground">{t('npk.empty')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {issues.length > 0 && (
              <div className="mt-3 space-y-2" role="status">
                <div className="text-sm font-semibold">{t('npk.compatWarn')}</div>
                {issues.map((i) => (
                  <div key={i.a.id + i.b.id} className="rounded-lg border border-warning bg-warning/15 p-2 text-xs">
                    <strong>
                      {loc(i.a.name)} + {loc(i.b.name)} — {t(`compat.status.${i.result.status}`)}.
                    </strong>{' '}
                    {i.result.rule && loc(i.result.rule.mechanism)}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}

      {st.mode === 'solve' && (
        <>
          <Panel title={t('npk.task')}>
            <div className="grid gap-3 sm:grid-cols-4">
              {NUTRIENT_NAMES.map((n) => (
                <NumField key={n} id={`tg-${n}`} label={`${n === 'N' ? 'N' : n === 'P2O5' ? 'P₂O₅' : 'K₂O'}, %`} value={st.target[n]} onChange={(v) => set({ target: { ...st.target, [n]: v } })} unit="%" />
              ))}
              <NumField id="tg-base" label={t('npk.base')} value={st.base} onChange={(v) => set({ base: v })} unit={t('conv.unit.kg')} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t('npk.taskNote')}</p>
            {formError && <p role="alert" className="mt-2 text-sm text-destructive">{formError}</p>}
            <button type="button" onClick={solve} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              {t('npk.solve')}
            </button>
          </Panel>

          {res && (
            <Panel title={t('npk.solutions')}>
              <div aria-live="polite">
                {res.result.solutions.length === 0 ? (
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-destructive">{t('npk.noSolution')}</p>
                    {res.result.reason === 'over-concentrated' && (
                      <p>{t('npk.reason.over', { need: fmt(res.result.requiredMass as number, 1), base: fmt(res.base, 0) })}</p>
                    )}
                    {res.result.reason === 'missing-nutrient' && (
                      <p>{t('npk.reason.missing', { n: (res.result.missing ?? []).join(', ') })}</p>
                    )}
                    {res.result.reason === 'infeasible' && <p>{t('npk.reason.infeasible')}</p>}
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
                    <ul className="space-y-2">
                      {res.result.solutions.slice(0, 10).map((s, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            aria-pressed={sel === i}
                            onClick={() => setSel(i)}
                            className={`w-full rounded-lg border p-2 text-left text-xs ${sel === i ? 'border-primary bg-accent/40' : 'border-border hover:bg-muted'}`}
                          >
                            <div className="font-semibold">{t('npk.variant', { n: i + 1 })} · {t('npk.filler')}: {fmt(s.filler, 1)} {t('conv.unit.kg')}</div>
                            <div className="text-muted-foreground">
                              {s.support.map((id) => `${loc((getFertilizer(id) as Fertilizer).name)} ${fmt(s.masses[id], 1)}`).join(' · ')}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {sol && (
                      <div className="space-y-3 text-sm">
                        <table className="w-full min-w-[18rem]">
                          <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                              <th className="py-1 pr-3">{t('npk.component')}</th>
                              <th className="py-1 pr-3">{t('conv.unit.kg')}</th>
                              <th className="py-1">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sol.support.map((id) => (
                              <tr key={id} className="border-b border-border/60">
                                <th scope="row" className="py-1.5 pr-3 text-left font-medium">{loc((getFertilizer(id) as Fertilizer).name)}</th>
                                <td className="py-1.5 pr-3 font-mono">{fmt(sol.masses[id], 3)}</td>
                                <td className="py-1.5 font-mono text-muted-foreground">{fmt((sol.masses[id] / res.base) * 100, 2)}</td>
                              </tr>
                            ))}
                            <tr className="border-b border-border/60">
                              <th scope="row" className="py-1.5 pr-3 text-left font-medium">{t('npk.filler')}</th>
                              <td className="py-1.5 pr-3 font-mono">{fmt(sol.filler, 3)}</td>
                              <td className="py-1.5 font-mono text-muted-foreground">{fmt((sol.filler / res.base) * 100, 2)}</td>
                            </tr>
                          </tbody>
                        </table>
                        <div>
                          <div className="mb-1 font-semibold">{t('npk.system')}</div>
                          <div className="formula text-xs">
                            {NUTRIENT_NAMES.map((n) => {
                              const terms = sol.support
                                .map((id, j) => {
                                  const c = res.comps.find((x) => x.id === id) as Comp;
                                  return `${fmt(c[n] / 100, 4)}·m${j + 1}`;
                                })
                                .join(' + ');
                              return `${n === 'N' ? 'N' : n === 'P2O5' ? 'P₂O₅' : 'K₂O'}:  ${terms} = ${fmt((res.target[n] * res.base) / 100, 3)}\n`;
                            })}
                            {`Σ m + m${t('npk.fillerShort')} = ${fmt(res.base, 1)}`}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {sol.support.map((id, j) => `m${j + 1} = ${loc((getFertilizer(id) as Fertilizer).name)}`).join('; ')}
                          </p>
                        </div>
                        <div>
                          <div className="mb-1 font-semibold">{t('npk.steps')}</div>
                          <ol className="list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
                            <li>{t('npk.step1')}</li>
                            <li>{t('npk.step2')}</li>
                            <li>{t('npk.step3')}</li>
                            <li>{t('npk.step4')}</li>
                          </ol>
                        </div>
                        <div className="rounded-lg bg-accent/40 p-3 font-mono text-xs">
                          {t('npk.check')}: N {fmt(sol.composition.N, 3)} · P₂O₅ {fmt(sol.composition.P2O5, 3)} · K₂O {fmt(sol.composition.K2O, 3)} %
                        </div>
                        {solIssues.length > 0 && (
                          <div className="space-y-1" role="status">
                            {solIssues.map((i) => (
                              <div key={i.a.id + i.b.id} className="rounded-lg border border-warning bg-warning/15 p-2 text-xs">
                                <strong>{loc(i.a.name)} + {loc(i.b.name)} — {t(`compat.status.${i.result.status}`)}.</strong>
                              </div>
                            ))}
                          </div>
                        )}
                        <button type="button" onClick={loadToFree} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
                          {t('npk.toFree')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
