import { useMemo, useState } from 'react';
import { Search, Scale, X } from 'lucide-react';
import { FERTILIZERS, groupCounts } from '../../data/fertilizers';
import { GROUPS, NUTRIENT_KEYS, type Group, type NutrientKey } from '../../data/types';
import { useI18n } from '../../i18n';
import { ChemFormula } from '../../components/chemistry/ChemFormula';
import { filterFertilizers, sortFertilizers, type SortKey } from '../../utils/fertilizer-utils';
import { FertilizerCard } from './FertilizerCard';

interface Props {
  compare: string[];
  onToggleCompare: (id: string) => void;
  onOpenCompare: () => void;
  onClearCompare: () => void;
  onOpen: (id: string) => void;
}

export function AtlasView({ compare, onToggleCompare, onOpenCompare, onClearCompare, onOpen }: Props) {
  const { t, lang, loc } = useI18n();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<Group | 'all'>('all');
  const [nutrient, setNutrient] = useState<NutrientKey | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('name');

  const counts = useMemo(() => groupCounts(), []);
  const list = useMemo(
    () => sortFertilizers(filterFertilizers(FERTILIZERS, { query, group, nutrient }), sort, lang),
    [query, group, nutrient, sort, lang],
  );
  const filtersActive = query !== '' || group !== 'all' || nutrient !== 'all';

  const reset = () => {
    setQuery('');
    setGroup('all');
    setNutrient('all');
  };

  const selectCls = 'rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring';

  return (
    <div className="fade-in space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={group === g}
            onClick={() => setGroup(group === g ? 'all' : g)}
            className={`rounded-xl border p-4 text-left shadow-soft transition-colors ${
              group === g ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted'
            }`}
          >
            <div className="font-serif text-base font-semibold">{t(`group.${g}`)}</div>
            <div className={`mt-1 text-sm ${group === g ? 'opacity-90' : 'text-muted-foreground'}`}>{t('atlas.count', { n: counts[g] })}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">{t('atlas.search')}</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('atlas.search')}
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          {t('atlas.nutrient')}
          <select className={`${selectCls} mt-1 block`} value={nutrient} onChange={(e) => setNutrient(e.target.value as NutrientKey | 'all')}>
            <option value="all">{t('atlas.all')}</option>
            {NUTRIENT_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          {t('atlas.sort')}
          <select className={`${selectCls} mt-1 block`} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="name">{t('atlas.sort.name')}</option>
            <option value="content">{t('atlas.sort.content')}</option>
          </select>
        </label>
        {filtersActive && (
          <button type="button" onClick={reset} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
            {t('atlas.reset')}
          </button>
        )}
      </div>

      {compare.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/40 bg-accent/40 p-3 text-sm">
          <Scale size={16} />
          <span className="font-medium">{t('compare.tray')}:</span>
          {compare.map((id) => {
            const f = FERTILIZERS.find((x) => x.id === id);
            return f ? (
              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1">
                {loc(f.name)}
                {f.formula && (
                  <span className="text-muted-foreground">
                    (<ChemFormula formula={f.formula} />)
                  </span>
                )}
              </span>
            ) : null;
          })}
          <button type="button" onClick={onOpenCompare} disabled={compare.length < 2} className="rounded-lg bg-primary px-3 py-1 text-primary-foreground disabled:opacity-50">
            {t('compare.open')}
          </button>
          <button type="button" onClick={onClearCompare} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 hover:bg-muted">
            <X size={14} /> {t('compare.clear')}
          </button>
        </div>
      )}

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {t('atlas.found', { n: list.length })}
      </p>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">{t('atlas.empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((f) => (
            <FertilizerCard key={f.id} f={f} inCompare={compare.includes(f.id)} onOpen={() => onOpen(f.id)} onToggleCompare={() => onToggleCompare(f.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
