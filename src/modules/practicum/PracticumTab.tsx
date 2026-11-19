import { useI18n } from '../../i18n';
import { useHashRoute } from '../../hooks/useHashRoute';
import { useJournal } from '../../hooks/useJournal';
import { PillNav } from '../../components/ui/Controls';
import AuditView from './AuditView';
import DetectiveView from './DetectiveView';
import DiagnosisView from './DiagnosisView';
import JournalView from './JournalView';

const SUBS = ['diagnosis', 'detective', 'audit', 'journal'] as const;
type Sub = (typeof SUBS)[number];

export default function PracticumTab() {
  const { t } = useI18n();
  const { parts, navigate } = useHashRoute();
  const { attempts, add, replaceAll, clear } = useJournal();
  const sub: Sub = (SUBS as readonly string[]).includes(parts[1]) ? (parts[1] as Sub) : 'diagnosis';
  return (
    <div className="space-y-5">
      <div className="no-print">
        <PillNav label="practicum" active={sub} onSelect={(id) => navigate('practicum', id)} items={SUBS.map((s) => ({ id: s, label: t(`prac.sub.${s}`) }))} />
      </div>
      {sub === 'diagnosis' && <DiagnosisView attempts={attempts} onAttempt={add} />}
      {sub === 'detective' && <DetectiveView attempts={attempts} onAttempt={add} />}
      {sub === 'audit' && <AuditView attempts={attempts} onAttempt={add} />}
      {sub === 'journal' && <JournalView attempts={attempts} replaceAll={replaceAll} clear={clear} />}
    </div>
  );
}
