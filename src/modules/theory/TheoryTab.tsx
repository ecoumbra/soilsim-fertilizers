import { useEffect, useState } from 'react';
import { useHashRoute } from '../../hooks/useHashRoute';
import { useI18n } from '../../i18n';
import { storage } from '../../utils/storage';
import { AtlasView } from './AtlasView';
import { CompareView } from './CompareView';
import { Glossary } from './Glossary';
import { Passport } from './Passport';

const SUBS = ['atlas', 'compare', 'glossary'] as const;
type Sub = (typeof SUBS)[number];

export default function TheoryTab() {
  const { t } = useI18n();
  const { parts, navigate } = useHashRoute();
  const sub: Sub = (SUBS as readonly string[]).includes(parts[1]) ? (parts[1] as Sub) : 'atlas';
  const fertId = sub === 'atlas' ? parts[2] : undefined;

  const [compare, setCompare] = useState<string[]>(() => storage.get<string[]>('compare') ?? []);
  useEffect(() => {
    storage.set('compare', compare);
  }, [compare]);

  const toggle = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 2 ? [...c, id] : [c[0], id]));

  return (
    <div className="space-y-5">
      <nav aria-label="theory" className="flex flex-wrap gap-2">
        {SUBS.map((s) => (
          <button
            key={s}
            type="button"
            aria-current={sub === s ? 'page' : undefined}
            onClick={() => navigate('theory', s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              sub === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted'
            }`}
          >
            {t(`sub.${s}`)}
          </button>
        ))}
      </nav>

      {sub === 'atlas' && fertId && (
        <Passport id={fertId} inCompare={compare.includes(fertId)} onToggleCompare={() => toggle(fertId)} onBack={() => navigate('theory', 'atlas')} />
      )}
      {sub === 'atlas' && !fertId && (
        <AtlasView
          compare={compare}
          onToggleCompare={toggle}
          onOpen={(id) => navigate('theory', 'atlas', id)}
          onOpenCompare={() => navigate('theory', 'compare')}
          onClearCompare={() => setCompare([])}
        />
      )}
      {sub === 'compare' && <CompareView ids={compare} onChange={setCompare} />}
      {sub === 'glossary' && <Glossary />}
    </div>
  );
}
