import { useI18n } from '../../i18n';
import { useHashRoute } from '../../hooks/useHashRoute';
import { PillNav } from '../../components/ui/Controls';
import ConverterView from './ConverterView';
import NpkConstructorView from './NpkConstructorView';
import OxideView from './OxideView';

const SUBS = ['converter', 'oxide', 'npk'] as const;
type Sub = (typeof SUBS)[number];

export default function CalculatorTab() {
  const { t } = useI18n();
  const { parts, navigate } = useHashRoute();
  const sub: Sub = (SUBS as readonly string[]).includes(parts[1]) ? (parts[1] as Sub) : 'converter';
  return (
    <div className="space-y-5">
      <PillNav label="calc" active={sub} onSelect={(id) => navigate('calc', id)} items={SUBS.map((s) => ({ id: s, label: t(`sub.${s}`) }))} />
      {sub === 'converter' && <ConverterView />}
      {sub === 'oxide' && <OxideView />}
      {sub === 'npk' && <NpkConstructorView />}
    </div>
  );
}
