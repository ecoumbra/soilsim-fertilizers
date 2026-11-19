import { RotateCcw } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useStoredState } from '../../hooks/useStoredState';
import { ChemFormula } from '../../components/chemistry/ChemFormula';
import { ModelBadge } from '../../components/ui/Badges';
import { NumField, Panel, SelectField } from '../../components/ui/Controls';
import { validateAmount } from '../../utils/calculations';
import { OXIDE_PAIRS, elementToOxide, getPair, oxideToElement, type OxidePairId } from '../../utils/oxide';
import { formatNumber } from '../../utils/number-format';

interface State { pair: OxidePairId; dir: 'toOxide' | 'toElement'; amount: string }
const INIT: State = { pair: 'P-P2O5', dir: 'toOxide', amount: '10' };

export default function OxideView() {
  const { t, lang } = useI18n();
  const [st, setSt, reset] = useStoredState<State>('calc.oxide', INIT);
  const pair = getPair(st.pair);
  const amount = validateAmount(st.amount);
  const err = amount.ok ? undefined : t(`conv.err.${amount.error}`);
  const f = (v: number, d = 4) => formatNumber(v, lang, d);

  let out: number | null = null;
  if (amount.ok) out = st.dir === 'toOxide' ? elementToOxide(amount.value, pair) : oxideToElement(amount.value, pair);
  const factor = st.dir === 'toOxide' ? pair.factor : 1 / pair.factor;
  const nEl = pair.nEl;

  return (
    <div className="fade-in space-y-5">
      <Panel title={t('oxide.title')} right={<ModelBadge type="calc" />}>
        <p className="text-sm text-muted-foreground">{t('oxide.intro')}</p>
        <p className="mt-2 rounded-lg border border-warning bg-warning/15 p-3 text-sm font-medium">{t('oxide.warn')}</p>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={t('conv.params')}>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField id="ox-pair" label={t('oxide.pair')} value={st.pair} onChange={(v) => setSt((s) => ({ ...s, pair: v as OxidePairId }))}>
              {OXIDE_PAIRS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.element} ↔ {p.oxide.replace(/(\d+)/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)] ?? d)}
                </option>
              ))}
            </SelectField>
            <SelectField id="ox-dir" label={t('conv.direction')} value={st.dir} onChange={(v) => setSt((s) => ({ ...s, dir: v as State['dir'] }))}>
              <option value="toOxide">{t('oxide.dir.toOxide')}</option>
              <option value="toElement">{t('oxide.dir.toElement')}</option>
            </SelectField>
          </div>
          <div className="mt-3 max-w-xs">
            <NumField id="ox-amount" label={t('oxide.value')} value={st.amount} onChange={(v) => setSt((s) => ({ ...s, amount: v }))} unit="%" error={err} />
          </div>
          <button type="button" onClick={reset} className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
            <RotateCcw size={14} /> {t('common.reset')}
          </button>
        </Panel>

        <Panel title={t('conv.result')}>
          <div aria-live="polite" className="space-y-3 text-sm">
            {out !== null && amount.ok && (
              <>
                <div className="rounded-xl bg-accent/50 p-4">
                  <div className="font-serif text-3xl font-semibold">
                    {f(out, 3)} <span className="text-lg font-normal">%</span>{' '}
                    <ChemFormula formula={st.dir === 'toOxide' ? pair.oxide : pair.element} className="text-lg" />
                  </div>
                </div>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>
                    {t('conv.step.formula')}:{' '}
                    <span className="font-mono">
                      <ChemFormula formula={pair.oxide} /> = <ChemFormula formula={pair.element} /> × M(<ChemFormula formula={pair.oxide} />) / ({nEl === 2 ? '2 · ' : ''}M(<ChemFormula formula={pair.element} />))
                    </span>
                  </li>
                  <li>
                    {t('oxide.step.masses')}:{' '}
                    <span className="font-mono">
                      M(<ChemFormula formula={pair.oxide} />) = {f(pair.oxideMass, 3)}; {nEl === 2 ? '2 · ' : ''}M(<ChemFormula formula={pair.element} />) = {f(pair.elementMass, 3)}
                    </span>
                  </li>
                  <li>
                    {t('oxide.step.factor')}:{' '}
                    <span className="font-mono">
                      {st.dir === 'toOxide' ? f(pair.oxideMass, 3) + ' / ' + f(pair.elementMass, 3) : f(pair.elementMass, 3) + ' / ' + f(pair.oxideMass, 3)} = {f(factor)}
                    </span>
                  </li>
                  <li>
                    {t('conv.step.subst')}: <span className="font-mono">{f(amount.value)} × {f(factor)} = {f(out, 3)}</span>
                  </li>
                </ol>
              </>
            )}
          </div>
        </Panel>
      </div>

      <Panel title={t('oxide.table')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-3">{t('oxide.pair')}</th>
                <th className="py-2 pr-3">{t('oxide.fwd')}</th>
                <th className="py-2">{t('oxide.back')}</th>
              </tr>
            </thead>
            <tbody>
              {OXIDE_PAIRS.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <th scope="row" className="py-2 pr-3 text-left font-medium">
                    <ChemFormula formula={p.element} /> ↔ <ChemFormula formula={p.oxide} />
                  </th>
                  <td className="py-2 pr-3 font-mono">{f(p.factor)}</td>
                  <td className="py-2 font-mono">{f(1 / p.factor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t('oxide.tableNote')}</p>
      </Panel>
    </div>
  );
}
