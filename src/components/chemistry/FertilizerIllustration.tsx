import type { Group, IllustrationKind } from '../../data/types';

const GROUP_COLOR: Record<Group, string> = {
  nitrogen: 'var(--primary)',
  phosphorus: 'var(--earth)',
  potassium: 'var(--olive)',
  complex: 'var(--chart-2)',
};

const DOTS: [number, number][] = [
  [10, 44], [18, 52], [26, 46], [34, 54], [42, 47], [50, 53], [14, 36], [22, 38], [30, 33],
  [38, 38], [46, 35], [54, 41], [20, 26], [28, 22], [36, 26], [44, 23],
];

/** Умовна SVG-ілюстрація за фізичною формою (не фото). */
export function FertilizerIllustration({ kind, group, size = 64 }: { kind: IllustrationKind; group: Group; size?: number }) {
  const c = GROUP_COLOR[group];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <rect x="2" y="2" width="60" height="60" rx="12" fill="var(--muted)" />
      {kind === 'granules' &&
        [[20, 24, 7], [38, 22, 6], [28, 38, 8], [46, 40, 6], [14, 46, 5], [48, 24, 5]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={c} opacity={0.85} />
        ))}
      {kind === 'crystals' &&
        [[18, 24, 0], [38, 20, 25], [28, 38, -20], [46, 40, 40], [16, 46, 15]].map(([x, y, a], i) => (
          <rect key={i} x={x - 6} y={y - 6} width="12" height="12" rx="1.5" fill={c} opacity={0.85} transform={`rotate(${a} ${x} ${y})`} />
        ))}
      {kind === 'powder' && DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill={c} opacity={0.8} />)}
      {kind === 'liquid' && (
        <>
          <path d="M18 14 H46 V50 a6 6 0 0 1 -6 6 H24 a6 6 0 0 1 -6 -6 Z" fill="none" stroke={c} strokeWidth="2.5" />
          <path d="M18 32 q7 -5 14 0 t14 0 V50 a6 6 0 0 1 -6 6 H24 a6 6 0 0 1 -6 -6 Z" fill={c} opacity={0.6} />
        </>
      )}
      {kind === 'gas' && (
        <>
          <rect x="22" y="22" width="20" height="34" rx="9" fill="none" stroke={c} strokeWidth="2.5" />
          <rect x="28" y="14" width="8" height="8" rx="2" fill={c} />
          <path d="M44 12 q4 4 0 8 M50 10 q5 6 0 12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
