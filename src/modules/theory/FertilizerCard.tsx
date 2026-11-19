import { Plus, Check } from 'lucide-react';
import type { Fertilizer } from '../../data/types';
import { useI18n } from '../../i18n';
import { ChemFormula } from '../../components/chemistry/ChemFormula';
import { FertilizerIllustration } from '../../components/chemistry/FertilizerIllustration';
import { Chip } from '../../components/ui/Badges';
import { formatQuantity, nutrientEntries } from '../../utils/fertilizer-utils';

interface Props {
  f: Fertilizer;
  inCompare: boolean;
  onOpen: () => void;
  onToggleCompare: () => void;
}

export function FertilizerCard({ f, inCompare, onOpen, onToggleCompare }: Props) {
  const { t, loc, lang } = useI18n();
  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md">
      <button type="button" onClick={onOpen} className="flex flex-1 flex-col gap-3 text-left focus-visible:outline-2 focus-visible:outline-ring" aria-label={`${t('card.open')}: ${loc(f.name)}`}>
        <div className="flex items-start gap-3">
          <FertilizerIllustration kind={f.illustration} group={f.group} />
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-snug">{loc(f.name)}</h3>
            <div className="mt-0.5 text-sm text-muted-foreground">
              {f.formula ? <ChemFormula formula={f.formula} /> : <span>{loc(f.formulaNote ?? { uk: '—', en: '—' }).slice(0, 48)}…</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {nutrientEntries(f).map(([k, q]) => (
            <span key={k} className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              <ChemFormula formula={k} /> {formatQuantity(q, lang)} %
            </span>
          ))}
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">{loc(f.description)}</p>
        <div className="mt-auto flex flex-wrap gap-1.5">
          <Chip>{t(`group.${f.group}`)}</Chip>
          {f.subgroup && <Chip>{t(`subgroup.${f.subgroup}`)}</Chip>}
        </div>
      </button>
      <button
        type="button"
        onClick={onToggleCompare}
        aria-pressed={inCompare}
        className={`mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          inCompare ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'
        }`}
      >
        {inCompare ? <Check size={14} /> : <Plus size={14} />}
        {inCompare ? t('compare.remove') : t('compare.add')}
      </button>
    </article>
  );
}
