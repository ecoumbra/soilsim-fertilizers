import { RotateCcw } from 'lucide-react';
import { FERTILIZERS, getFertilizer } from '../../data/fertilizers';
import { GROUPS, type NutrientKey } from '../../data/types';
import { useI18n } from '../../i18n';
import { useStoredState } from '../../hooks/useStoredState';
import { ChemFormula } from '../../components/chemistry/ChemFormula';
import { ModelBadge } from '../../components/ui/Badges';
import { NumField, Panel, SelectField } from '../../components/ui/Controls';
import { activeFromMass, fromKg, massFromActive, toKg, validateAmount, type MassUnit } from '../../utils/calculations';
import { availableGrades, contentFor, defaultGradeId, knownNutrients } from '../../utils/fertilizer-calc';
import { formatQuantity, hasRange } from '../../utils/fertilizer-utils';
import { formatNumber, parseNumber } from '../../utils/number-format';

type Unit = 'kg/ha' | 'kg' | 'g' | 't';
interface State {
  fid: string; gid: string; nutrient: NutrientKey; dir: 'toMass' | 'toActive';
  amount: string; unit: Unit; digits: number; useCustom: boolean; custom: string;
}
const INIT: State = { fid: 'urea', gid: '', nutrient: 'N', dir: 'toMass', amount: '60', unit: 'kg/ha', digits: 2, useCustom: false, custom: '' };

const massUnit = (u: Unit): MassUnit => (u === 't' ? 't' : u === 'g' ? 'g' : 'kg');

export default function ConverterView() {
  const { t, loc, lang } = useI18n();
  const [st, setSt, reset] = useStoredState<State>('calc.converter', INIT);

  const f = getFertilizer(st.fid) ?? FERTILIZERS[0];
  const grades = availableGrades(f);
  const gid = grades.length ? (grades.some((g) => g.id === st.gid) ? st.gid : (defaultGradeId(f) as string)) : undefined;
  const keys = knownNutrients(f, gid);
  const key: NutrientKey = keys.includes(st.nutrient) ? st.nutrient : keys[0];
  const q = f.nutrients[key];
  const rangeAvail = !!q && hasRange(q) && !gid;

  // вміст C
  let contentError: string | undefined;
  let custom: number | undefined;
  if (st.useCustom && rangeAvail && q) {
    const v = parseNumber(st.custom);
    if (v === null) contentError = t('conv.err.customNan');
    else if (v < (q.min as number) || v > (q.max as number)) contentError = t('conv.err.customRange', { min: formatNumber(q.min as number, lang), max: formatNumber(q.max as number, lang) });
    else custom = v;
  }
  const C = contentError ? null : contentFor(f, key, { gradeId: gid, custom });

  const amount = validateAmount(st.amount);
  const amountError = amount.ok ? undefined : t(`conv.err.${amount.error}`);

  let result: { value: number; kg: number } | null = null;
  let calcError: string | undefined;
  if (amount.ok && C !== null && C > 0) {
    try {
      const inKg = toKg(amount.value, massUnit(st.unit));
      const outKg = st.dir === 'toMass' ? massFromActive(inKg, C) : activeFromMass(inKg, C);
      result = { value: fromKg(outKg, massUnit(st.unit)), kg: st.dir === 'toMass' ? outKg : inKg };
    } catch {
      calcError = t('conv.err.calc');
    }
  } else if (C === null || C <= 0) {
    calcError = contentError ?? t('conv.err.noContent');
  }

  const fmt = (v: number) => formatNumber(v, lang, st.digits);
  const unitLabel = st.unit;
  const set = (p: Partial<State>) => setSt((s) => ({ ...s, ...p }));

  const fertKg = result ? result.kg : 0; // маса добрива, кг
  const allRows = result
    ? keys.map((k) => {
        const c = contentFor(f, k, { gradeId: gid, custom: k === key ? custom : undefined }) as number;
        return { k, c, d: fromKg(activeFromMass(fertKg, c), massUnit(st.unit)) };
      })
    : [];

  return (
    <div className="fade-in space-y-5">
      <Panel title={t('conv.title')} right={<ModelBadge type="calc" />}>
        <p className="text-sm text-muted-foreground">{t('conv.intro')}</p>
        <p className="mt-2 rounded-lg bg-muted p-3 font-mono text-sm">M = D · 100 / C &nbsp; | &nbsp; D = M · C / 100</p>
        <p className="mt-1 text-xs text-muted-foreground">{t('conv.legend')}</p>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={t('conv.params')}>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField id="cv-fert" label={t('conv.fertilizer')} value={f.id} onChange={(v) => set({ fid: v, gid: '', useCustom: false })}>
              {GROUPS.map((g) => (
                <optgroup key={g} label={t(`group.${g}`)}>
                  {FERTILIZERS.filter((x) => x.group === g).map((x) => (
                    <option key={x.id} value={x.id}>
                      {loc(x.name)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </SelectField>
            {grades.length > 0 && (
              <SelectField id="cv-grade" label={t('conv.grade')} value={gid ?? ''} onChange={(v) => set({ gid: v })}>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </SelectField>
            )}
            <SelectField id="cv-nutr" label={t('conv.nutrient')} value={key} onChange={(v) => set({ nutrient: v as NutrientKey })}>
              {keys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </SelectField>
            <SelectField id="cv-dir" label={t('conv.direction')} value={st.dir} onChange={(v) => set({ dir: v as State['dir'] })}>
              <option value="toMass">{t('conv.dir.toMass')}</option>
              <option value="toActive">{t('conv.dir.toActive')}</option>
            </SelectField>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-background p-3 text-sm">
            <div className="font-medium">
              {t('conv.content')} <ChemFormula formula={key} />:{' '}
              {C !== null && <span className="font-mono">{formatNumber(C, lang, 2)} %</span>}
            </div>
            {q && hasRange(q) && !gid && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t('conv.range', { r: formatQuantity(q, lang) })} {t('conv.rangeNote')}
              </p>
            )}
            {rangeAvail && (
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={st.useCustom} onChange={(e) => set({ useCustom: e.target.checked, custom: st.custom || String(q?.nominal ?? '') })} />
                  {t('conv.useCustom')}
                </label>
                {st.useCustom && q && (
                  <div className="grid gap-2 sm:grid-cols-[1fr_8rem] sm:items-end">
                    <input
                      type="range"
                      aria-label={t('conv.useCustom')}
                      min={q.min}
                      max={q.max}
                      step={0.1}
                      value={parseNumber(st.custom) ?? (q.nominal as number)}
                      onChange={(e) => set({ custom: e.target.value })}
                      className="w-full"
                    />
                    <NumField id="cv-custom" label="%" value={st.custom} onChange={(v) => set({ custom: v })} error={contentError} />
                  </div>
                )}
              </div>
            )}
            {gid && <p className="mt-1 text-xs text-muted-foreground">{t('conv.gradeNote')}</p>}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_8rem_8rem]">
            <NumField
              id="cv-amount"
              label={st.dir === 'toMass' ? t('conv.inputActive', { n: key }) : t('conv.inputMass')}
              value={st.amount}
              onChange={(v) => set({ amount: v })}
              error={amountError}
            />
            <SelectField id="cv-unit" label={t('conv.unit')} value={st.unit} onChange={(v) => set({ unit: v as Unit })}>
              <option value="kg/ha">{t('conv.unit.kgha')}</option>
              <option value="kg">{t('conv.unit.kg')}</option>
              <option value="g">{t('conv.unit.g')}</option>
              <option value="t">{t('conv.unit.t')}</option>
            </SelectField>
            <SelectField id="cv-digits" label={t('conv.digits')} value={String(st.digits)} onChange={(v) => set({ digits: Number(v) })}>
              {[0, 1, 2, 3].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectField>
          </div>

          <button type="button" onClick={reset} className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
            <RotateCcw size={14} /> {t('common.reset')}
          </button>
        </Panel>

        <Panel title={t('conv.result')}>
          <div aria-live="polite" className="space-y-3 text-sm">
            {calcError && <p className="text-destructive">{calcError}</p>}
            {!result && !calcError && <p className="text-muted-foreground">{t('conv.hint')}</p>}
            {result && C !== null && amount.ok && (
              <>
                <div className="rounded-xl bg-accent/50 p-4">
                  <div className="text-xs text-muted-foreground">
                    {st.dir === 'toMass' ? t('conv.res.mass') : t('conv.res.active', { n: key })}
                  </div>
                  <div className="font-serif text-3xl font-semibold">
                    {fmt(result.value)} <span className="text-lg font-normal">{unitLabel}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-semibold">{t('conv.steps')}</div>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>
                      {t('conv.step.formula')}:{' '}
                      <span className="font-mono">{st.dir === 'toMass' ? 'M = D · 100 / C' : 'D = M · C / 100'}</span>
                    </li>
                    <li>
                      {t('conv.step.subst')}:{' '}
                      <span className="font-mono">
                        {st.dir === 'toMass'
                          ? `M = ${formatNumber(amount.value, lang, 4)} · 100 / ${formatNumber(C, lang, 4)}`
                          : `D = ${formatNumber(amount.value, lang, 4)} · ${formatNumber(C, lang, 4)} / 100`}
                      </span>
                    </li>
                    <li>
                      {t('conv.step.result')}:{' '}
                      <span className="font-mono">
                        {fmt(result.value)} {unitLabel}
                      </span>{' '}
                      <span className="text-xs text-muted-foreground">({t('conv.step.rounding', { n: st.digits })})</span>
                    </li>
                  </ol>
                </div>
                <div>
                  <div className="mb-1 font-semibold">
                    {t('conv.allNutrients', { m: `${fmt(fromKg(fertKg, massUnit(st.unit)))} ${unitLabel}` })}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[16rem] text-sm">
                      <tbody>
                        {allRows.map((r) => (
                          <tr key={r.k} className={`border-b border-border/60 ${r.k === key ? 'bg-accent/30' : ''}`}>
                            <th scope="row" className="py-1.5 pr-3 text-left font-medium">
                              <ChemFormula formula={r.k} />
                            </th>
                            <td className="py-1.5 pr-3 text-muted-foreground">{formatNumber(r.c, lang, 2)} %</td>
                            <td className="py-1.5 font-mono">
                              {fmt(r.d)} {unitLabel}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {f.companions && f.companions.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t('conv.companions')}: {f.companions.map((c) => t(`el.${c}`)).join(', ')}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
