import type { ReactNode } from 'react';
import { FERTILIZERS, getFertilizer } from '../../data/fertilizers';
import { NUTRIENT_KEYS, type Fertilizer } from '../../data/types';
import { useI18n } from '../../i18n';
import { ChemFormula } from '../../components/chemistry/ChemFormula';
import { formatQuantity } from '../../utils/fertilizer-utils';

interface Row { label: ReactNode; a: ReactNode; b: ReactNode; keyA: string; keyB: string }

export function CompareView({ ids, onChange }: { ids: string[]; onChange: (ids: string[]) => void }) {
  const { t, loc, lang } = useI18n();
  const A = ids[0] ? getFertilizer(ids[0]) : undefined;
  const B = ids[1] ? getFertilizer(ids[1]) : undefined;

  const set = (slot: 0 | 1, id: string) => {
    const next = [ids[0] ?? '', ids[1] ?? ''];
    next[slot] = id;
    onChange(next.filter(Boolean));
  };

  const select = (slot: 0 | 1, value?: Fertilizer) => (
    <label className="block text-xs text-muted-foreground">
      {t(slot === 0 ? 'compare.slotA' : 'compare.slotB')}
      <select
        className="mt-1 block w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground"
        value={value?.id ?? ''}
        onChange={(e) => set(slot, e.target.value)}
      >
        <option value="">{t('compare.pick')}</option>
        {FERTILIZERS.map((f) => (
          <option key={f.id} value={f.id}>
            {loc(f.name)}
          </option>
        ))}
      </select>
    </label>
  );

  const rows: Row[] = [];
  if (A && B) {
    const text = (x: Fertilizer, pick: (f: Fertilizer) => string | undefined) => pick(x) ?? t('field.noData');
    rows.push({
      label: t('field.group'),
      a: t(`group.${A.group}`), b: t(`group.${B.group}`),
      keyA: A.group, keyB: B.group,
    });
    rows.push({
      label: t('field.formula'),
      a: A.formula ? <ChemFormula formula={A.formula} /> : '—',
      b: B.formula ? <ChemFormula formula={B.formula} /> : '—',
      keyA: A.formula ?? '', keyB: B.formula ?? '',
    });
    for (const k of NUTRIENT_KEYS) {
      if (!A.nutrients[k] && !B.nutrients[k]) continue;
      const qa = A.nutrients[k];
      const qb = B.nutrients[k];
      const sa = qa ? `${formatQuantity(qa, lang)} %` : '—';
      const sb = qb ? `${formatQuantity(qb, lang)} %` : '—';
      rows.push({ label: <ChemFormula formula={k} />, a: sa, b: sb, keyA: sa, keyB: sb });
    }
    const forms = (x: Fertilizer) => {
      const n = x.nitrogenForms;
      if (!n) return '—';
      const parts: string[] = [];
      if (n.amide !== undefined) parts.push(`${t('form.amide')} ${n.amide}`);
      if (n.ammonium !== undefined) parts.push(`${t('form.ammonium')} ${n.ammonium}`);
      if (n.nitrate !== undefined) parts.push(`${t('form.nitrate')} ${n.nitrate}`);
      return parts.join(' · ') + ' %';
    };
    rows.push({ label: t('field.nitrogenForms'), a: forms(A), b: forms(B), keyA: forms(A), keyB: forms(B) });
    const comp = (x: Fertilizer) => (x.companions?.length ? x.companions.map((c) => t(`el.${c}`)).join(', ') : '—');
    rows.push({ label: t('field.companions'), a: comp(A), b: comp(B), keyA: comp(A), keyB: comp(B) });
    const sol = (x: Fertilizer, k: 'water' | 'citrate') => (x.solubility?.[k] ? t(`sol.${x.solubility[k]}`) : '—');
    rows.push({ label: t('field.water'), a: sol(A, 'water'), b: sol(B, 'water'), keyA: sol(A, 'water'), keyB: sol(B, 'water') });
    rows.push({ label: t('field.citrate'), a: sol(A, 'citrate'), b: sol(B, 'citrate'), keyA: sol(A, 'citrate'), keyB: sol(B, 'citrate') });
    const react = (x: Fertilizer) => (x.soil ? t(`react.${x.soil.reaction}`) : '—');
    rows.push({ label: t('field.reaction'), a: react(A), b: react(B), keyA: react(A), keyB: react(B) });
    const soilText = (x: Fertilizer) => text(x, (f) => (f.soil?.text ? loc(f.soil.text) : undefined));
    rows.push({ label: t('passport.D'), a: soilText(A), b: soilText(B), keyA: soilText(A), keyB: soilText(B) });
    const methods = (x: Fertilizer) => (x.application.methods.length ? x.application.methods.map((m) => t(`method.${m}`)).join(', ') : '—');
    rows.push({ label: t('field.methods'), a: methods(A), b: methods(B), keyA: methods(A), keyB: methods(B) });
  }

  return (
    <div className="fade-in space-y-4">
      <h2 className="text-xl font-semibold">{t('compare.title')}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {select(0, A)}
        {select(1, B)}
      </div>
      {!(A && B) ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{t('compare.hint')}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{t('compare.diff')}</p>
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left">
                  <th className="p-3 font-medium" />
                  <th className="p-3 font-semibold">{loc(A.name)}</th>
                  <th className="p-3 font-semibold">{loc(B.name)}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={`border-b border-border/60 align-top last:border-0 ${r.keyA !== r.keyB ? 'bg-accent/30' : ''}`}>
                    <th scope="row" className="p-3 text-left font-medium text-muted-foreground">
                      {r.label}
                    </th>
                    <td className="p-3">{r.a}</td>
                    <td className="p-3">{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
