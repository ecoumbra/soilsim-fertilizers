import { useRef, useState } from 'react';
import { Download, Printer, Trash2, Upload } from 'lucide-react';
import { DIAG_SCENARIOS } from '../../data/practicum/diagnosis';
import { AUDIT_SCENARIOS } from '../../data/practicum/audit';
import { useI18n } from '../../i18n';
import { Panel } from '../../components/ui/Controls';
import { DETECTIVE_CASES } from '../../utils/detective';
import { downloadText } from '../../utils/download';
import { MODULES, mergeAttempts, parseJournal, ratio, summarize, toCsv, toJson, type Attempt } from '../../utils/journal';

interface Props { attempts: Attempt[]; replaceAll: (l: Attempt[]) => void; clear: () => void }

export default function JournalView({ attempts, replaceAll, clear }: Props) {
  const { t, loc, lang } = useI18n();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [confirm, setConfirm] = useState(false);

  const sum = summarize(attempts);
  const totals: Record<string, number> = { diagnosis: DIAG_SCENARIOS.length, detective: DETECTIVE_CASES.length, audit: AUDIT_SCENARIOS.length };
  const pct = (v: number) => new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-US', { style: 'percent', maximumFractionDigits: 0 }).format(v);
  const when = (iso: string) => new Date(iso).toLocaleString(lang === 'uk' ? 'uk-UA' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' });

  const title = (a: Attempt): string => {
    if (a.module === 'diagnosis') { const s = DIAG_SCENARIOS.find((x) => x.id === a.scenarioId); return s ? loc(s.title) : a.scenarioId; }
    if (a.module === 'audit') { const s = AUDIT_SCENARIOS.find((x) => x.id === a.scenarioId); return s ? loc(s.title) : a.scenarioId; }
    const i = DETECTIVE_CASES.findIndex((x) => x.id === a.scenarioId);
    return i >= 0 ? t('det.sampleN', { n: i + 1 }) : a.scenarioId;
  };
  const mistakes = (a: Attempt) => (a.mistakes.length ? a.mistakes.map((m) => t(`jr.mistake.${m}`)).join('; ') : '—');

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const r = parseJournal(String(reader.result ?? ''));
      if (!r.ok) { setMsg({ kind: 'err', text: t(r.error === 'json' ? 'jr.err.json' : 'jr.err.format') }); return; }
      const merged = mergeAttempts(attempts, r.attempts);
      const added = merged.length - attempts.length;
      replaceAll(merged);
      setMsg({ kind: 'ok', text: t('jr.imported', { n: added, total: r.attempts.length }) });
    };
    reader.onerror = () => setMsg({ kind: 'err', text: t('jr.err.json') });
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const sorted = [...attempts].sort((a, b) => b.ts.localeCompare(a.ts));

  return (
    <div className="fade-in space-y-5">
      <Panel title={t('jr.title')}>
        <p className="text-sm text-muted-foreground">{t('jr.intro')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {MODULES.map((m) => (
            <div key={m} className="rounded-xl border border-border bg-background p-3 text-sm">
              <div className="font-semibold">{t(`jr.module.${m}`)}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t('jr.done', { n: sum[m].scenarios, total: totals[m] })}</div>
              <div className="text-xs text-muted-foreground">{t('jr.attemptsN', { n: sum[m].attempts })}</div>
              <div className="text-xs text-muted-foreground">{t('jr.best', { p: pct(sum[m].best) })} · {t('jr.avg', { p: pct(sum[m].average) })}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 no-print">
          <button type="button" onClick={() => downloadText('soilsim-fertilizers-journal.json', toJson(attempts), 'application/json')} disabled={attempts.length === 0} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"><Download size={14} /> {t('jr.exportJson')}</button>
          <button type="button" onClick={() => downloadText('soilsim-fertilizers-journal.csv', toCsv(attempts), 'text/csv')} disabled={attempts.length === 0} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"><Download size={14} /> {t('jr.exportCsv')}</button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"><Printer size={14} /> {t('jr.print')}</button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
            <Upload size={14} /> {t('jr.import')}
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          {!confirm ? (
            <button type="button" onClick={() => setConfirm(true)} disabled={attempts.length === 0} className="inline-flex items-center gap-1.5 rounded-lg border border-destructive px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"><Trash2 size={14} /> {t('jr.clear')}</button>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 px-3 py-1.5 text-sm" role="alert">
              {t('jr.clearConfirm')}
              <button type="button" onClick={() => { clear(); setConfirm(false); setMsg(null); }} className="rounded bg-destructive px-2 py-0.5 text-destructive-foreground">{t('jr.yes')}</button>
              <button type="button" onClick={() => setConfirm(false)} className="rounded border border-border px-2 py-0.5">{t('jr.no')}</button>
            </span>
          )}
        </div>
        {msg && <p role="status" className={`mt-3 text-sm ${msg.kind === 'ok' ? 'text-success' : 'text-destructive'}`}>{msg.text}</p>}
        <p className="mt-2 text-xs text-muted-foreground no-print">{t('jr.privacy')}</p>
      </Panel>

      <Panel title={t('jr.history')}>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('jr.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3">{t('jr.col.date')}</th>
                  <th className="py-2 pr-3">{t('jr.col.module')}</th>
                  <th className="py-2 pr-3">{t('jr.col.task')}</th>
                  <th className="py-2 pr-3">{t('jr.col.score')}</th>
                  <th className="py-2 pr-3">{t('jr.col.extra')}</th>
                  <th className="py-2">{t('jr.col.mistakes')}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 align-top">
                    <td className="py-1.5 pr-3 whitespace-nowrap">{when(a.ts)}</td>
                    <td className="py-1.5 pr-3">{t(`jr.module.${a.module}`)}</td>
                    <td className="py-1.5 pr-3">{title(a)}</td>
                    <td className="py-1.5 pr-3 font-mono">{a.score}/{a.max} ({pct(ratio(a))})</td>
                    <td className="py-1.5 pr-3 text-xs text-muted-foreground">
                      {a.hints > 0 && t('jr.hintsN', { n: a.hints })} {a.tests > 0 && t('jr.testsN', { n: a.tests })}
                    </td>
                    <td className="py-1.5 text-xs">{mistakes(a)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
