export type Pattern = 'older-pale' | 'young-pale' | 'margin' | 'purple' | 'interveinal' | 'roots';

export const PATTERN_BY_SCENARIO: Record<string, Pattern> = {
  'n-def-wheat': 'older-pale',
  'k-def-maize': 'margin',
  'p-def-acid': 'purple',
  'as-acidification': 'roots',
  'nitrate-leaching': 'older-pale',
  'chloride-sensitive': 'margin',
  'young-yellow': 'young-pale',
  'p-def-calcareous': 'purple',
  'mg-k-antagonism': 'interveinal',
};

const GREEN = 'oklch(0.62 0.15 140)';
const PALE = 'oklch(0.85 0.14 105)';
const PURPLE = 'oklch(0.5 0.14 320)';
const BROWN = 'oklch(0.45 0.08 60)';

/** Схематична ілюстрація симптому (не фото): які листки уражені. */
export function SymptomLeaf({ pattern, label }: { pattern: Pattern; label: string }) {
  const lower = pattern === 'older-pale' ? PALE : pattern === 'purple' ? PURPLE : pattern === 'interveinal' ? PALE : GREEN;
  const upper = pattern === 'young-pale' ? PALE : GREEN;
  const leaf = (x: number, y: number, flip: number, fill: string, stroke?: string, veins?: boolean) => (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <path d="M0 0 C 18 -12 46 -10 58 4 C 46 18 18 16 0 0 Z" fill={fill} stroke={stroke ?? 'var(--foreground)'} strokeWidth={stroke ? 3 : 1} strokeDasharray={stroke ? '3 2' : undefined} opacity="0.95" />
      {veins && <path d="M4 2 C 20 2 40 2 54 4 M16 2 L26 -6 M26 2 L38 -6 M16 2 L26 10 M26 2 L38 10" stroke={GREEN} strokeWidth="1.6" fill="none" />}
    </g>
  );
  return (
    <svg viewBox="0 0 200 190" role="img" aria-label={label} className="mx-auto w-full max-w-[14rem]">
      <rect x="0" y="0" width="200" height="190" rx="12" fill="var(--muted)" />
      {pattern === 'roots' ? (
        <>
          <line x1="100" y1="20" x2="100" y2="110" stroke={GREEN} strokeWidth="5" />
          <path d="M100 30 C 130 24 150 34 160 44 M100 40 C 70 32 50 40 40 52" fill="none" stroke={GREEN} strokeWidth="4" />
          <rect x="0" y="110" width="200" height="80" fill="oklch(0.5 0.07 60)" opacity="0.35" />
          <path d="M100 110 L92 140 M100 110 L108 138 M100 110 L84 130 M100 110 L118 128" stroke={BROWN} strokeWidth="5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1="100" y1="170" x2="100" y2="20" stroke={GREEN} strokeWidth="5" />
          {leaf(100, 130, 1, lower, pattern === 'margin' ? BROWN : undefined, pattern === 'interveinal')}
          {leaf(100, 110, -1, lower, pattern === 'margin' ? BROWN : undefined, pattern === 'interveinal')}
          {leaf(100, 70, 1, upper)}
          {leaf(100, 48, -1, upper)}
        </>
      )}
    </svg>
  );
}
