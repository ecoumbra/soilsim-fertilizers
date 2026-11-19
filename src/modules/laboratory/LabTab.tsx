import { useI18n } from '../../i18n';
import { useHashRoute } from '../../hooks/useHashRoute';
import { PillNav } from '../../components/ui/Controls';
import MixingTable from './MixingTable';
import SolubilityView from './solubility/SolubilityView';
import PhosphateView from './phosphate/PhosphateView';
import SoilColumnView from './soil-column/SoilColumnView';

const SUBS = ['solubility', 'phosphate', 'mixing', 'column'] as const;
type Sub = (typeof SUBS)[number];

export default function LabTab() {
  const { t } = useI18n();
  const { parts, navigate } = useHashRoute();
  const sub: Sub = (SUBS as readonly string[]).includes(parts[1]) ? (parts[1] as Sub) : 'solubility';
  return (
    <div className="space-y-5">
      <PillNav label="lab" active={sub} onSelect={(id) => navigate('lab', id)} items={SUBS.map((s) => ({ id: s, label: t(`sub.${s}`) }))} />
      {sub === 'solubility' && <SolubilityView />}
      {sub === 'phosphate' && <PhosphateView />}
      {sub === 'mixing' && <MixingTable />}
      {sub === 'column' && <SoilColumnView />}
    </div>
  );
}
