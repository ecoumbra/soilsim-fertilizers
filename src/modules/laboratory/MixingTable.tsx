import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { Check, Info, RotateCcw, X } from 'lucide-react';
import { MATERIALS, getMaterial } from '../../data/materials';
import type { Material } from '../../data/amendments';
import type { CompatMode, CompatStatus } from '../../data/compatibility/rules';
import { getSource } from '../../data/sources';
import { GROUPS } from '../../data/types';
import { useI18n } from '../../i18n';
import { useStoredState } from '../../hooks/useStoredState';
import { ChemEquation, ChemFormula } from '../../components/chemistry/ChemFormula';
import { ModelBadge, StatusBadge } from '../../components/ui/Badges';
import { Panel } from '../../components/ui/Controls';
import { colorOf } from '../../data/materials';
import { evaluate, type CompatResult } from '../../utils/compat-engine';
import { Reactor } from './Reactor';

interface State { mode: CompatMode; a: string; b: string }
const INIT: State = { mode: 'dry', a: '', b: '' };

const STATUS_STYLE: Record<CompatStatus, string> = {
  compatible: 'border-success bg-success/15',
  conditional: 'border-warning bg-warning/20',
  incompatible: 'border-destructive bg-destructive/10',
  insufficient: 'border-border bg-muted',
};

function StatusIcon({ status }: { status: CompatStatus }) {
  if (status === 'compatible') return <Check size={18} aria-hidden="true" />;
  if (status === 'incompatible') return <X size={18} aria-hidden="true" />;
  return <Info size={18} aria-hidden="true" />;
}

export default function MixingTable() {
  const { t, loc } = useI18n();
  const [st, setSt, reset] = useStoredState<State>('lab.mixing', INIT);
  const [result, setResult] = useState<CompatResult | null>(null);
  const [answer, setAnswer] = useState(false);
  const [filter, setFilter] = useState('');

  const a = st.a ? getMaterial(st.a) : undefined;
  const b = st.b ? getMaterial(st.b) : undefined;

  // зміна параметрів скидає результат
  useEffect(() => {
    setResult(null);
    setAnswer(false);
  }, [st.mode, st.a, st.b]);

  const assign = (slot: 'a' | 'b', id: string) =>
    setSt((s0) => {
      const other = slot === 'a' ? 'b' : 'a';
      // якщо матеріал уже в іншому слоті — міняємо слоти місцями
      if (s0[other] === id) return { ...s0, [slot]: id, [other]: s0[slot] };
      return { ...s0, [slot]: id };
    });
  const pick = (id: string) => {
    if (st.a === id || st.b === id) return;
    if (!st.a) assign('a', id);
    else if (!st.b) assign('b', id);
    else assign('b', id);
  };
  const onDrop = (slot: 'a' | 'b') => (e: DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && getMaterial(id)) assign(slot, id);
  };

  const mix = () => {
    if (a && b) setResult(evaluate(a, b, st.mode));
  };

  const list = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return MATERIALS.filter((m) => !q || m.name.uk.toLowerCase().includes(q) || m.name.en.toLowerCase().includes(q) || (m.formula ?? '').toLowerCase().includes(q));
  }, [filter]);

  const chip = (m: Material) => {
    const used = st.a === m.id || st.b === m.id;
    return (
      <button
        key={m.id}
        type="button"
        draggable
        onDragStart={(e: DragEvent) => e.dataTransfer.setData('text/plain', m.id)}
        onClick={() => pick(m.id)}
        aria-pressed={used}
        title={t('mix.chipHint')}
        className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${used ? 'border-primary bg-accent/50' : 'border-border bg-background hover:bg-muted'}`}
      >
        <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: colorOf(m) }} />
        {loc(m.name)}
      </button>
    );
  };

  const slot = (which: 'a' | 'b', m?: Material) => (
    <div
      onDragOver={(e: DragEvent) => e.preventDefault()}
      onDrop={onDrop(which)}
      className="min-h-[4.5rem] rounded-xl border-2 border-dashed border-border bg-background p-3 text-sm"
    >
      <div className="text-xs text-muted-foreground">{t(which === 'a' ? 'compare.slotA' : 'compare.slotB')}</div>
      {m ? (
        <div className="mt-1 flex items-start justify-between gap-2">
          <div>
            <div className="font-medium">{loc(m.name)}</div>
            {m.formula && (
              <div className="text-xs text-muted-foreground">
                <ChemFormula formula={m.formula} />
              </div>
            )}
          </div>
          <button type="button" onClick={() => setSt((s) => ({ ...s, [which]: '' }))} aria-label={t('compare.remove')} className="rounded-lg border border-border p-1 hover:bg-muted">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="mt-1 text-xs text-muted-foreground">{t('mix.dropHere')}</div>
      )}
    </div>
  );

  const rule = result?.rule;
  const effects = rule?.effects ?? [];

  return (
    <div className="fade-in space-y-5">
      <Panel title={t('mix.title')} right={<ModelBadge type="approx" />}>
        <div className="space-y-1 text-sm">
          <p><strong>{t('mix.goalLabel')}:</strong> {t('mix.goal')}</p>
          <p className="text-muted-foreground"><strong>{t('mix.theoryLabel')}:</strong> {t('mix.theory')}</p>
          <p className="text-xs text-muted-foreground">{t('mix.modelNote')}</p>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Panel title={t('mix.params')}>
          <div role="radiogroup" aria-label={t('mix.mode')} className="mb-3 flex gap-2">
            {(['dry', 'solution'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={st.mode === m}
                onClick={() => setSt((s) => ({ ...s, mode: m }))}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${st.mode === m ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}
              >
                {t(`mix.mode.${m}`)}
              </button>
            ))}
          </div>
          <p className="mb-3 text-xs text-muted-foreground">{t(`mix.mode.${st.mode}.hint`)}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {slot('a', a)}
            {slot('b', b)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={mix} disabled={!a || !b} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {t('mix.run')}
            </button>
            <button type="button" onClick={() => { reset(); setResult(null); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
              <RotateCcw size={14} /> {t('mix.resetTable')}
            </button>
          </div>

          <div className="mt-4">
            <label htmlFor="mix-filter" className="text-xs text-muted-foreground">{t('mix.palette')}</label>
            <input id="mix-filter" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t('atlas.search')} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
            <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
              {GROUPS.map((g) => {
                const items = list.filter((m) => m.group === g);
                return items.length ? (
                  <div key={g}>
                    <div className="mb-1 text-xs font-semibold text-muted-foreground">{t(`group.${g}`)}</div>
                    <div className="flex flex-wrap gap-1.5">{items.map(chip)}</div>
                  </div>
                ) : null;
              })}
              {list.some((m) => m.kind === 'amendment') && (
                <div>
                  <div className="mb-1 text-xs font-semibold text-muted-foreground">{t('mix.amendments')}</div>
                  <div className="flex flex-wrap gap-1.5">{list.filter((m) => m.kind === 'amendment').map(chip)}</div>
                </div>
              )}
            </div>
          </div>
        </Panel>

        <Panel title={t('mix.reactor')}>
          <Reactor
            mode={st.mode}
            a={a}
            b={b}
            mixed={!!result}
            effects={effects}
            label={t('mix.reactorLabel')}
            labelA={a ? loc(a.name).split(' (')[0].slice(0, 22) : ''}
            labelB={b ? loc(b.name).split(' (')[0].slice(0, 22) : ''}
          />
          <p className="mt-1 text-center text-xs text-muted-foreground">{t(result ? 'mix.afterMix' : 'mix.beforeMix')}</p>
        </Panel>
      </div>

      {result && a && b && (
        <Panel title={t('mix.result')}>
          <div aria-live="polite" className="space-y-4 text-sm">
            <div className={`flex items-center gap-2 rounded-xl border-2 p-3 text-base font-semibold ${STATUS_STYLE[result.status]}`}>
              <StatusIcon status={result.status} />
              {t(`compat.status.${result.status}`)}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {loc(a.name)} + {loc(b.name)} · {t(`mix.mode.${st.mode}`)}
              </span>
            </div>

            {rule ? (
              <>
                <div>
                  <div className="mb-1 font-semibold">{t('mix.mechanism')}</div>
                  <p>{loc(rule.mechanism)}</p>
                  {rule.conditions && <p className="mt-1 text-muted-foreground"><strong>{t('mix.conditions')}:</strong> {loc(rule.conditions)}</p>}
                </div>
                {rule.equations && rule.equations.length > 0 && (
                  <div>
                    <div className="mb-1 font-semibold">{t('mix.equation')}</div>
                    <div className="space-y-2">{rule.equations.map((e) => <ChemEquation key={e} equation={e} />)}</div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  <strong>{t('mix.shown')}:</strong>{' '}
                  {effects.length > 0 ? effects.map((e) => t(`mix.effect.${e}`)).join('; ') : t('mix.effect.none')}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <StatusBadge status={rule.verification} />
                  {rule.sourceIds.map((id) => {
                    const s = getSource(id);
                    return s ? (
                      <a key={id} href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {s.publisher}
                      </a>
                    ) : null;
                  })}
                  {rule.sourceIds.length === 0 && <span className="text-muted-foreground">{t('mix.noSources')}</span>}
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-1 font-semibold">{t('mix.control')}</div>
                  <p>{rule.control ? loc(rule.control.q) : t('mix.controlGeneric')}</p>
                  <button type="button" onClick={() => setAnswer((v) => !v)} className="mt-2 rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted">
                    {t(answer ? 'mix.hideAnswer' : 'mix.showAnswer')}
                  </button>
                  {answer && <p className="mt-2 rounded-lg bg-accent/40 p-2">{rule.control ? loc(rule.control.a) : loc(rule.mechanism)}</p>}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="font-medium">{t(`mix.reason.${result.reason}`)}</p>
                <p className="mt-1 text-muted-foreground">{t('mix.insufficientNote')}</p>
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
