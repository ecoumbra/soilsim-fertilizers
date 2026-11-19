import type { Material } from '../../data/amendments';
import { colorOf } from '../../data/materials';
import type { CompatMode, Effect } from '../../data/compatibility/rules';

const POS: [number, number][] = Array.from({ length: 24 }, (_, i) => [78 + (i % 12) * 14, 152 + Math.floor(i / 12) * 15 + ((i * 7) % 5)]);

function reduced(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

interface Props {
  mode: CompatMode;
  a?: Material;
  b?: Material;
  mixed: boolean;
  effects: Effect[];
  label: string;
  labelA?: string;
  labelB?: string;
}

/** Схема реакційної ємності. Ефекти (газ, осад, злежування…) малюються лише за списком effects правила. */
export function Reactor({ mode, a, b, mixed, effects, label, labelA, labelB }: Props) {
  const calm = reduced();
  const ca = a ? colorOf(a) : 'var(--muted-foreground)';
  const cb = b ? colorOf(b) : 'var(--muted-foreground)';
  const has = (e: Effect) => mixed && effects.includes(e);

  return (
    <svg viewBox="0 0 320 230" role="img" aria-label={label} className="mx-auto w-full max-w-md">
      <defs>
        <clipPath id="beaker">
          <path d="M60 40 H260 V190 a12 12 0 0 1 -12 12 H72 a12 12 0 0 1 -12 -12 Z" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="320" height="230" rx="14" fill="var(--muted)" />
      <path d="M60 40 H260 V190 a12 12 0 0 1 -12 12 H72 a12 12 0 0 1 -12 -12 Z" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <g clipPath="url(#beaker)">
        {mode === 'solution' && (
          <>
            {!mixed && (
              <>
                <rect x="60" y="110" width="100" height="92" fill={ca} opacity="0.35" />
                <rect x="160" y="110" width="100" height="92" fill={cb} opacity="0.35" />
              </>
            )}
            {mixed && <rect x="60" y="110" width="200" height="92" fill="var(--chart-2)" opacity="0.25" />}
            {has('turbidity') && <rect x="60" y="110" width="200" height="92" fill="var(--foreground)" opacity="0.18" />}
            <path d="M60 110 q25 -6 50 0 t50 0 t50 0 t50 0" fill="none" stroke="var(--chart-2)" strokeWidth="2" opacity="0.7" />
          </>
        )}
        {mode === 'dry' &&
          POS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4.5" fill={mixed ? (i % 2 === 0 ? ca : cb) : x < 160 ? ca : cb} opacity="0.9" />
          ))}
        {mode === 'dry' && has('caking') && (
          <>
            <ellipse cx="120" cy="165" rx="30" ry="14" fill="var(--foreground)" opacity="0.25" />
            <ellipse cx="205" cy="170" rx="34" ry="13" fill="var(--foreground)" opacity="0.25" />
          </>
        )}
        {has('moisture') &&
          [100, 140, 180, 220].map((x, i) => (
            <circle key={i} cx={x} cy={mode === 'dry' ? 146 : 124} r="3.2" fill="var(--chart-2)" opacity="0.85" />
          ))}
        {has('precipitate') &&
          Array.from({ length: 14 }, (_, i) => {
            const x = 80 + i * 12.5;
            const y = 190 + (i % 3) * 2;
            return (
              <circle key={i} cx={x} cy={y} r="3.4" fill="var(--foreground)" opacity="0.55">
                {!calm && <animate attributeName="cy" from={120 + (i % 4) * 8} to={y} dur="2.2s" begin={`${(i % 5) * 0.15}s`} fill="freeze" />}
              </circle>
            );
          })}
      </g>
      {has('gas-nh3') && (
        <g>
          {[110, 150, 190, 230].map((x, i) => (
            <path key={i} d={`M${x} 36 q-6 -10 0 -20 q6 -10 0 -20`} fill="none" stroke="var(--destructive)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" transform="translate(0 22)">
              {!calm && <animateTransform attributeName="transform" type="translate" from="0 30" to="0 -4" dur={`${1.6 + i * 0.25}s`} repeatCount="indefinite" />}
            </path>
          ))}
          <text x="160" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--destructive)">
            NH₃ ↑
          </text>
        </g>
      )}
      <text x="110" y="222" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
        {labelA ?? ''}
      </text>
      <text x="210" y="222" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
        {labelB ?? ''}
      </text>
    </svg>
  );
}
