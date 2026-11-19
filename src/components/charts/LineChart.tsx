export interface Series {
  id: string;
  label: string;
  color: string;
  dash?: string;
  points: [number, number][];
  dots?: boolean;
}

interface Props {
  series: Series[];
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
  xLabel: string;
  yLabel: string;
  label: string;
  vLine?: number;
  hLine?: number;
  fmtY?: (v: number) => string;
  fmtX?: (v: number) => string;
}

const W = 420;
const H = 240;
const M = { l: 48, r: 14, t: 14, b: 40 };

/** Простий SVG-графік без сторонніх бібліотек. Легенда й дані дублюються в HTML поза графіком. */
export function LineChart({ series, xDomain, yDomain, xTicks, yTicks, xLabel, yLabel, label, vLine, hLine, fmtY, fmtX }: Props) {
  const sx = (x: number) => M.l + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * (W - M.l - M.r);
  const sy = (y: number) => H - M.b - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * (H - M.t - M.b);
  const fy = fmtY ?? ((v: number) => String(v));
  const fx = fmtX ?? ((v: number) => String(v));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="w-full max-w-xl">
      <rect x="0" y="0" width={W} height={H} rx="10" fill="var(--card)" />
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke="var(--border)" strokeWidth="1" />
          <text x={M.l - 6} y={sy(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">{fy(t)}</text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line x1={sx(t)} x2={sx(t)} y1={M.t} y2={H - M.b} stroke="var(--border)" strokeWidth="1" opacity="0.6" />
          <text x={sx(t)} y={H - M.b + 16} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">{fx(t)}</text>
        </g>
      ))}
      <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke="var(--foreground)" strokeWidth="1.2" />
      <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} stroke="var(--foreground)" strokeWidth="1.2" />
      <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--foreground)">{xLabel}</text>
      <text x="12" y={(M.t + H - M.b) / 2} textAnchor="middle" fontSize="12" fill="var(--foreground)" transform={`rotate(-90 12 ${(M.t + H - M.b) / 2})`}>{yLabel}</text>
      {hLine !== undefined && hLine >= yDomain[0] && hLine <= yDomain[1] && (
        <line x1={M.l} x2={W - M.r} y1={sy(hLine)} y2={sy(hLine)} stroke="var(--destructive)" strokeWidth="1.6" strokeDasharray="6 4" />
      )}
      {vLine !== undefined && vLine >= xDomain[0] && vLine <= xDomain[1] && (
        <line x1={sx(vLine)} x2={sx(vLine)} y1={M.t} y2={H - M.b} stroke="var(--foreground)" strokeWidth="1.6" strokeDasharray="4 3" />
      )}
      {series.map((s) => (
        <g key={s.id}>
          <polyline
            fill="none"
            stroke={s.color}
            strokeWidth="2.4"
            strokeDasharray={s.dash}
            strokeLinejoin="round"
            points={s.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')}
          />
          {s.dots && s.points.map(([x, y], i) => <circle key={i} cx={sx(x)} cy={sy(y)} r="3.6" fill={s.color} />)}
        </g>
      ))}
    </svg>
  );
}
