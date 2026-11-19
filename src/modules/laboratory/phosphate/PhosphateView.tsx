import { FERTILIZERS, getFertilizer } from '../../../data/fertilizers';
import { getSource } from '../../../data/sources';
import { useI18n } from '../../../i18n';
import { useStoredState } from '../../../hooks/useStoredState';
import { LineChart } from '../../../components/charts/LineChart';
import { ChemEquation, ChemFormula } from '../../../components/chemistry/ChemFormula';
import { ModelBadge, StatusBadge } from '../../../components/ui/Badges';
import { Panel, SelectField } from '../../../components/ui/Controls';
import { PKA, curve, fractions, phosphorusZone, type PZone } from '../../../utils/phosphate-speciation';
import { formatNumber } from '../../../utils/number-format';

interface State { pH: number; fid: string }
const INIT: State = { pH: 6.5, fid: 'double-superphosphate' };

const ZONE_EQ: Record<PZone, string[]> = {
  feal: ['Al^3+ + H2PO4^- + 2H2O -> AlPO4·2H2O↓ + 2H^+', 'Fe^3+ + H2PO4^- + 2H2O -> FePO4·2H2O↓ + 2H^+'],
  window: ['H2PO4^- <-> H^+ + HPO4^2-'],
  calcium: ['Ca^2+ + HPO4^2- + 2H2O -> CaHPO4·2H2O↓', '5Ca^2+ + 3HPO4^2- + 4OH^- -> Ca5(PO4)3OH↓ + 3H2O'],
};

const SRC_ZONE = ['umn-p', 'unl-passel-p', 'va-dcr-p', 'mu-g9180'];
const SRC_SPEC = ['omex-p', 'va-dcr-p'];

function SrcLinks({ ids }: { ids: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
      {ids.map((id) => {
        const s = getSource(id);
        return s ? (
          <a key={id} href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
            {s.publisher}
          </a>
        ) : null;
      })}
    </div>
  );
}

export default function PhosphateView() {
  const { t, loc, lang } = useI18n();
  const [st, setSt] = useStoredState<State>('lab.phosphate', INIT);
  const pH = Math.min(8, Math.max(4, st.pH));
  const fr = fractions(pH);
  const c = curve(4, 8, 0.1);
  const zone = phosphorusZone(pH);
  const pf = FERTILIZERS.filter((x) => x.nutrients.P2O5);
  const f = getFertilizer(st.fid) ?? pf[0];
  const pct = (x: number) => `${formatNumber(x * 100, lang, x < 0.001 ? 3 : 1)} %`;

  const isRock = f.id === 'rock-phosphate';
  const citrateOnly = f.tags.includes('citrate-soluble');
  const startSpecies = f.ions.anions.find((a) => a.startsWith('H2PO4') || a.startsWith('HPO4')) ?? f.ions.anions.find((a) => a.startsWith('PO4'));

  return (
    <div className="fade-in space-y-5">
      <Panel title={t('phos.title')}>
        <p className="text-sm text-muted-foreground">{t('phos.intro')}</p>
        <div className="mt-3 max-w-md">
          <label htmlFor="ph-slider" className="text-xs text-muted-foreground">pH: <span className="font-mono text-foreground">{formatNumber(pH, lang, 1)}</span></label>
          <input id="ph-slider" type="range" min={4} max={8} step={0.1} value={pH} onChange={(e) => setSt((s) => ({ ...s, pH: Number(e.target.value) }))} className="mt-1 w-full" />
        </div>
      </Panel>

      <Panel title={t('phos.part1')} right={<ModelBadge type="calc" />}>
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <LineChart
              label={t('phos.chartLabel')}
              xDomain={[4, 8]}
              yDomain={[0, 1]}
              xTicks={[4, 5, 6, 7, 8]}
              yTicks={[0, 0.25, 0.5, 0.75, 1]}
              xLabel="pH"
              yLabel={t('phos.axisY')}
              fmtY={(x) => `${Math.round(x * 100)} %`}
              vLine={pH}
              series={[
                { id: 'h2', label: 'H₂PO₄⁻', color: 'var(--primary)', points: c.map((p) => [p.pH, p.H2PO4] as [number, number]) },
                { id: 'h1', label: 'HPO₄²⁻', color: 'var(--chart-2)', points: c.map((p) => [p.pH, p.HPO4] as [number, number]) },
                { id: 'h3', label: 'H₃PO₄', color: 'var(--muted-foreground)', dash: '4 3', points: c.map((p) => [p.pH, p.H3PO4] as [number, number]) },
              ]}
            />
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <li><span className="mr-1 inline-block h-0.5 w-5 align-middle" style={{ background: 'var(--primary)' }} /><ChemFormula formula="H2PO4^-" /></li>
              <li><span className="mr-1 inline-block h-0.5 w-5 align-middle" style={{ background: 'var(--chart-2)' }} /><ChemFormula formula="HPO4^2-" /></li>
              <li><span className="mr-1 inline-block h-0.5 w-5 border-t-2 border-dashed align-middle" /><ChemFormula formula="H3PO4" /></li>
            </ul>
          </div>
          <div className="space-y-3 text-sm">
            <table className="w-full">
              <tbody>
                {([['H3PO4', fr.H3PO4], ['H2PO4^-', fr.H2PO4], ['HPO4^2-', fr.HPO4], ['PO4^3-', fr.PO4]] as [string, number][]).map(([k, v]) => (
                  <tr key={k} className="border-b border-border/60">
                    <th scope="row" className="py-1.5 pr-3 text-left font-medium"><ChemFormula formula={k} /></th>
                    <td className="py-1.5 font-mono">{pct(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="rounded-lg bg-muted p-3 font-mono text-xs">
              [H₂PO₄⁻]/[HPO₄²⁻] = 10^(pKa₂ − pH) = 10^({PKA.pKa2} − {formatNumber(pH, lang, 1)}) = {formatNumber(Math.pow(10, PKA.pKa2 - pH), lang, 2)}
            </div>
            <div className="space-y-1.5">
              <ChemEquation equation="H3PO4 <-> H^+ + H2PO4^-" />
              <ChemEquation equation="H2PO4^- <-> H^+ + HPO4^2-" />
              <ChemEquation equation="HPO4^2- <-> H^+ + PO4^3-" />
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2">pKa₂ = {PKA.pKa2} <StatusBadge status="verified" /></div>
              <div className="flex flex-wrap items-center gap-2">pKa₁ = {PKA.pKa1}; pKa₃ = {PKA.pKa3} <StatusBadge status="needs-review" /></div>
              <p>{t('phos.pkaNote')}</p>
              <SrcLinks ids={SRC_SPEC} />
            </div>
          </div>
        </div>
      </Panel>

      <Panel title={t('phos.part2')} right={<ModelBadge type="concept" />}>
        <p className="text-sm text-muted-foreground">{t('phos.conceptIntro')}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <SelectField id="ph-fert" label={t('conv.fertilizer')} value={f.id} onChange={(x) => setSt((s) => ({ ...s, fid: x }))}>
            {pf.map((x) => (
              <option key={x.id} value={x.id}>{loc(x.name)}</option>
            ))}
          </SelectField>
        </div>

        <div className="mt-4">
          <div className="relative h-8 rounded-full" style={{ background: 'linear-gradient(90deg, var(--chart-4) 0%, var(--success) 40%, var(--success) 65%, var(--earth) 100%)' }} role="img" aria-label={t('phos.barLabel')}>
            <div className="absolute top-[-6px] h-10 w-1 rounded bg-foreground" style={{ left: `calc(${((pH - 4) / 4) * 100}% - 2px)` }} />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>pH 4 · {t('phos.bar.feal')}</span>
            <span>{t('phos.bar.window')}</span>
            <span>{t('phos.bar.calcium')} · pH 8</span>
          </div>
        </div>

        <div aria-live="polite" className="mt-4 space-y-3 text-sm">
          <div className="rounded-xl border-2 border-primary bg-accent/40 p-3 font-medium">{t(`phos.zone.${zone}`)}</div>
          <p>{t(`phos.zoneText.${zone}`)}</p>
          <div className="space-y-1.5">{ZONE_EQ[zone].map((e) => <ChemEquation key={e} equation={e} />)}</div>
          <p className="text-xs text-muted-foreground">{t('phos.eqNote')}</p>

          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-1 font-semibold">{loc(f.name)}</div>
            {startSpecies && <p>{t('phos.startSpecies')}: <ChemFormula formula={startSpecies} /></p>}
            {citrateOnly && <p className="mt-1">{t('phos.citrateOnly')}</p>}
            {isRock && (
              <p className={`mt-1 ${pH > 5.5 ? 'text-destructive' : ''}`}>
                {t(pH > 5.5 ? 'phos.rock.high' : 'phos.rock.low')}
              </p>
            )}
            {f.reactions[0] && (
              <div className="mt-2 space-y-1">
                <ChemEquation equation={f.reactions[0].equation} />
                <p className="text-xs text-muted-foreground">{loc(f.reactions[0].explanation)}</p>
              </div>
            )}
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p>{t('phos.thresholdNote')}</p>
            <SrcLinks ids={SRC_ZONE.concat(isRock ? ['fao-bulletin13'] : [])} />
            <p className="rounded-lg border border-warning bg-warning/15 p-2 text-foreground">{t('phos.disclaimer')}</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
