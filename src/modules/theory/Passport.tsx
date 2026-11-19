import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getFertilizer } from '../../data/fertilizers';
import { getSource } from '../../data/sources';
import type { Fertilizer } from '../../data/types';
import { useI18n } from '../../i18n';
import { ChemEquation, ChemFormula } from '../../components/chemistry/ChemFormula';
import { FertilizerIllustration } from '../../components/chemistry/FertilizerIllustration';
import { Chip, StatusBadge } from '../../components/ui/Badges';
import { formatQuantity, hasRange, nutrientEntries, theoreticalFor } from '../../utils/fertilizer-utils';
import { formatNumber } from '../../utils/number-format';

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border/60 py-2 text-sm last:border-0 sm:grid-cols-[13rem_1fr] sm:gap-3">
      <div className="text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}

/** Номери джерел-підтверджень для поля (за шляхом у f.evidence). */
function Cite({ f, path }: { f: Fertilizer; path: string }) {
  const ids = f.evidence?.[path];
  if (!ids || ids.length === 0) return null;
  const nums = ids.map((id) => f.sources.findIndex((x) => x.id === id) + 1).filter((n) => n > 0);
  if (nums.length === 0) return null;
  return <sup className="ml-1 text-[11px] font-medium text-muted-foreground">[{nums.join(', ')}]</sup>;
}

export function Passport({ id, onBack, onToggleCompare, inCompare }: { id: string; onBack: () => void; onToggleCompare: () => void; inCompare: boolean }) {
  const { t, loc, lang } = useI18n();
  const f = getFertilizer(id);

  const back = (
    <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
      <ArrowLeft size={16} /> {t('passport.back')}
    </button>
  );

  if (!f) {
    return (
      <div className="space-y-4">
        {back}
        <p>{t('passport.notFound')}</p>
      </div>
    );
  }

  const th = theoreticalFor(f);
  const entries = nutrientEntries(f);
  const nf = f.nitrogenForms;

  return (
    <div className="fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {back}
        <button type="button" onClick={onToggleCompare} aria-pressed={inCompare} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
          {inCompare ? t('compare.remove') : t('compare.add')}
        </button>
      </div>

      <header className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
        <FertilizerIllustration kind={f.illustration} group={f.group} size={80} />
        <div>
          <h2 className="text-2xl font-semibold">{loc(f.name)}</h2>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Chip>{t(`group.${f.group}`)}</Chip>
            {f.subgroup && <Chip>{t(`subgroup.${f.subgroup}`)}</Chip>}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{loc(f.description)}</p>
        </div>
      </header>

      <Block title={t('passport.A')}>
        <Row label={t('field.formula')}>
          {f.formula ? <ChemFormula formula={f.formula} className="font-mono" /> : '—'}
          <Cite f={f} path="formula" />
          {f.formulaNote && <div className="mt-1 text-xs text-muted-foreground">{loc(f.formulaNote)}</div>}
        </Row>
        {th && (
          <Row label={t('field.molarMass')}>
            <span className="font-mono">{formatNumber(th.molarMass, lang, 2)}</span> г/моль
            {f.theoreticalFormula && f.theoreticalFormula !== f.formula && (
              <span className="ml-2 text-xs text-muted-foreground">
                (<ChemFormula formula={f.theoreticalFormula} />)
              </span>
            )}
          </Row>
        )}
        {entries.map(([k, q]) => (
          <Row key={k} label={`${t('field.content')}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">
                <ChemFormula formula={k} /> — {formatQuantity(q, lang)} %
              </span>
              <span className="text-xs text-muted-foreground">({t(`basis.${q.basis}`)})</span>
              <StatusBadge status={q.status} />
              <Cite f={f} path={`nutrients.${k}`} />
              {th?.content[k] !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {t('field.theoretical')}: {formatNumber(th.content[k] as number, lang, 1)} %
                </span>
              )}
            </div>
            {hasRange(q) && q.nominal !== null && (
              <div className="mt-0.5 text-xs text-muted-foreground">{t('content.rangeNote', { v: formatNumber(q.nominal, lang, 1) })}</div>
            )}
          </Row>
        ))}
        {nf && (
          <Row label={t('field.nitrogenForms')}>
            <div className="flex flex-wrap gap-2">
              {nf.amide !== undefined && <Chip>{t('form.amide')}: {formatNumber(nf.amide, lang, 1)} %</Chip>}
              {nf.ammonium !== undefined && <Chip>{t('form.ammonium')}: {formatNumber(nf.ammonium, lang, 1)} %</Chip>}
              {nf.nitrate !== undefined && <Chip>{t('form.nitrate')}: {formatNumber(nf.nitrate, lang, 1)} %</Chip>}
              <Cite f={f} path="nitrogenForms" />
            </div>
          </Row>
        )}
        {f.grades && (
          <Row label={t('field.grades')}>
            <ul className="space-y-1">
              {f.grades.map((g) => (
                <li key={g.id}>
                  <span className="font-medium">{g.label}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    — {Object.entries(g.nutrients).map(([k, v], i) => (
                      <span key={k}>
                        {i > 0 && ' · '}
                        <ChemFormula formula={k} /> {formatNumber(v as number, lang, 1)}
                      </span>
                    ))}
                  </span>
                  {g.nitrogenSharesOfTotalN && (
                    <div className="text-xs text-muted-foreground">
                      {t('form.amide')} {g.nitrogenSharesOfTotalN.amide} % · {t('form.ammonium')} {g.nitrogenSharesOfTotalN.ammonium} % · {t('form.nitrate')} {g.nitrogenSharesOfTotalN.nitrate} % ({t('form.shares')})
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <Cite f={f} path="grades" />
          </Row>
        )}
        {f.p2o5Basis && f.nutrients.P2O5 && <Row label={t('field.p2o5Basis')}>{t(`p2o5.${f.p2o5Basis}`)}</Row>}
        {f.companions && f.companions.length > 0 && (
          <Row label={t('field.companions')}>
            <div className="flex flex-wrap gap-1.5">
              {f.companions.map((c) => (
                <Chip key={c}>
                  {c} — {t(`el.${c}`)}
                </Chip>
              ))}
            </div>
          </Row>
        )}
        <Row label={t('field.ions')}>
          <span className="font-mono text-xs">
            {[...f.ions.cations, ...f.ions.anions, ...(f.ions.neutral ?? [])].map((ion, i) => (
              <span key={ion}>
                {i > 0 && ', '}
                <ChemFormula formula={ion} />
              </span>
            ))}
          </span>
        </Row>
      </Block>

      {(f.physical || f.hygroscopicity) && (
        <Block title={t('passport.B')}>
          {f.physical && (
            <Row label={t('field.state')}>
              {loc(f.physical.state)} <StatusBadge status={f.physical.status} /> <Cite f={f} path="physical" />
            </Row>
          )}
          {f.hygroscopicity && (
            <Row label={t('field.hygroscopicity')}>
              {t(`level.${f.hygroscopicity.level}`)} <StatusBadge status={f.hygroscopicity.status} /> <Cite f={f} path="hygroscopicity" />
            </Row>
          )}
        </Block>
      )}

      {f.solubility && (
        <Block title={t('passport.C')}>
          {f.solubility.water && <Row label={t('field.water')}>{t(`sol.${f.solubility.water}`)}</Row>}
          {f.solubility.citrate && <Row label={t('field.citrate')}>{t(`sol.${f.solubility.citrate}`)}</Row>}
          {f.solubility.note && <Row label=" ">{loc(f.solubility.note)}</Row>}
          <Row label=" ">
            <StatusBadge status={f.solubility.status} />
            <Cite f={f} path="solubility" />
          </Row>
        </Block>
      )}

      {f.soil && (
        <Block title={t('passport.D')}>
          <Row label={t('field.reaction')}>
            {t(`react.${f.soil.reaction}`)} <StatusBadge status={f.soil.reactionStatus} /> <Cite f={f} path="soil.reaction" />
          </Row>
          {f.soil.text && (
            <Row label=" ">
              {loc(f.soil.text)} <StatusBadge status={f.soil.textStatus} /> <Cite f={f} path="soil.text" />
            </Row>
          )}
        </Block>
      )}

      {f.plant && (
        <Block title={t('passport.E')}>
          <Row label=" ">
            {loc(f.plant.text)} <StatusBadge status={f.plant.status} /> <Cite f={f} path="plant" />
          </Row>
        </Block>
      )}

      {(f.application.methods.length > 0 || f.compatibilityNotes) && (
        <Block title={t('passport.F')}>
          {f.application.methods.length > 0 && (
            <Row label={t('field.methods')}>
              <div className="flex flex-wrap items-center gap-1.5">
                {f.application.methods.map((m) => (
                  <Chip key={m}>{t(`method.${m}`)}</Chip>
                ))}
                <StatusBadge status={f.application.status} />
                <Cite f={f} path="application" />
              </div>
            </Row>
          )}
          {f.compatibilityNotes && (
            <Row label={t('field.compat')}>
              {loc(f.compatibilityNotes.text)} <StatusBadge status={f.compatibilityNotes.status} /> <Cite f={f} path="compatibility" />
            </Row>
          )}
        </Block>
      )}

      {f.reactions.length > 0 && (
        <Block title={t('passport.G')}>
          <div className="space-y-3">
            {f.reactions.map((r, i) => (
              <div key={i}>
                <ChemEquation equation={r.equation} />
                <p className="mt-1 text-sm text-muted-foreground">
                  {loc(r.explanation)} <StatusBadge status={r.status} /> <Cite f={f} path={`reactions.${i}`} />
                </p>
              </div>
            ))}
          </div>
        </Block>
      )}

      <Block title={t('passport.H')}>
        <p className="text-sm text-muted-foreground">{t('status.legend')}</p>
        <p className="text-xs text-muted-foreground">{t('status.rule')}</p>
        {f.sources.length === 0 && <p className="text-sm">{t('status.noSources')}</p>}
        {f.sources.length > 0 && (
          <div>
            <div className="mb-1 mt-2 text-sm font-semibold">{t('status.sourcesTitle')}</div>
            <ol className="space-y-2 text-sm">
              {f.sources.map((ref, i) => {
                const src = getSource(ref.id);
                if (!src) return null;
                return (
                  <li key={ref.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="font-medium">
                      [{i + 1}] {src.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {src.publisher} · {t(`source.type.${src.type}`)} · {t('source.accessed')}: {src.accessed}
                    </div>
                    <div className="mt-1">{loc(ref.supports)}</div>
                    {src.note && <div className="mt-1 text-xs text-muted-foreground">{loc(src.note)}</div>}
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block break-all text-xs underline">
                      {t('source.open')}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        {f.reviewNote && (
          <div className="rounded-lg border border-warning bg-warning/15 p-3 text-sm">
            <div className="mb-1 font-semibold">
              {t('status.reviewNote')} {f.reviewFlags?.join(', ')}
            </div>
            {loc(f.reviewNote)}
          </div>
        )}
      </Block>
    </div>
  );
}
