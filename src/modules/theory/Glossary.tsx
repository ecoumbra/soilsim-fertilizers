import { GLOSSARY } from '../../data/glossary';
import { useI18n } from '../../i18n';

export function Glossary() {
  const { t, loc } = useI18n();
  return (
    <div className="fade-in space-y-4">
      <h2 className="text-xl font-semibold">{t('glossary.title')}</h2>
      <p className="text-sm text-muted-foreground">{t('glossary.intro')}</p>
      <dl className="grid gap-3 md:grid-cols-2">
        {GLOSSARY.map((g) => (
          <div key={g.id} className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <dt className="font-semibold">{loc(g.term)}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{loc(g.definition)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
