const MAX_SUPPLY = 21_000_000;
const CHART = { W: 360, H: 180, TOP: 20, RIGHT: 20, BOTTOM: 40, LEFT: 50 };

interface CurveThreshold {
  fraction: number;
  label: string;
  supply: number;
  reserveOkb: number;
  isGrad: boolean;
}

function computeThresholds(curveS: number): { thresholds: CurveThreshold[]; gradReserve: number } {
  const s = Math.max(1, Math.min(100, curveS));
  const items: Omit<CurveThreshold, "isGrad">[] = [
    { fraction: 0.10, label: "10%", supply: 0.10 * MAX_SUPPLY, reserveOkb: -s * Math.log(0.90) },
    { fraction: 0.20, label: "20%", supply: 0.20 * MAX_SUPPLY, reserveOkb: -s * Math.log(0.80) },
    { fraction: 0.50, label: "50%", supply: 0.50 * MAX_SUPPLY, reserveOkb: -s * Math.log(0.50) },
    { fraction: 0.80, label: "80%", supply: 0.80 * MAX_SUPPLY, reserveOkb: -s * Math.log(0.20) },
    { fraction: 0.90, label: "90%", supply: 0.90 * MAX_SUPPLY, reserveOkb: -s * Math.log(0.10) },
    { fraction: 0.99, label: "99%", supply: 0.99 * MAX_SUPPLY, reserveOkb: -s * Math.log(0.01) },
  ];
  const gradReserve = items[3].reserveOkb;
  const thresholds: CurveThreshold[] = items.map((t) => ({ ...t, isGrad: t.fraction === 0.80 }));
  return { thresholds, gradReserve };
}

export function CurvePreview({ curveS }: { curveS: number }) {
  const { thresholds, gradReserve } = computeThresholds(curveS);
  const maxReserve = gradReserve * 1.3;
  const plotW = CHART.W - CHART.LEFT - CHART.RIGHT;
  const plotH = CHART.H - CHART.TOP - CHART.BOTTOM;
  const s = Math.max(1, Math.min(100, curveS));

  const xScale = (r: number) => CHART.LEFT + (r / maxReserve) * plotW;
  const yScale = (supply: number) => CHART.TOP + (1 - supply / MAX_SUPPLY) * plotH;

  const curvePath = Array.from({ length: 60 }, (_, i) => {
    const r = (i / 59) * maxReserve;
    const supply = MAX_SUPPLY * (1 - Math.exp(-r / s));
    return `${i === 0 ? "M" : "L"} ${xScale(r).toFixed(1)} ${yScale(supply).toFixed(1)}`;
  }).join(" ");

  const areaPath = `${curvePath} L ${xScale(maxReserve).toFixed(1)} ${CHART.H - CHART.BOTTOM} L ${CHART.LEFT} ${CHART.H - CHART.BOTTOM} Z`;

  const gradX = xScale(gradReserve);

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-surface rounded-xl border border-border/50 overflow-hidden">
      <div className="px-4 pt-4">
        <p className="text-[11px] text-content-tertiary mb-3">
          Supply vs cumulative OKB &mdash; S = <span className="text-content-primary font-mono">{s}</span>
        </p>
        <svg viewBox={`0 0 ${CHART.W} ${CHART.H}`} className="w-full h-auto" role="img" aria-label="Bonding curve preview">
          <defs>
            <linearGradient id="cpFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--accent-primary))" stopOpacity="0.12" />
              <stop offset="100%" stopColor="rgb(var(--accent-primary))" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {yTicks.map((t) => {
            const y = CHART.TOP + t * plotH;
            return (
              <g key={`y-${t}`}>
                <line x1={CHART.LEFT} x2={CHART.W - CHART.RIGHT} y1={y} y2={y} stroke="rgb(var(--border-default))" strokeDasharray="3 4" />
                <text x={CHART.LEFT - 6} y={y + 3} textAnchor="end" fill="rgb(var(--text-tertiary))" fontSize="6" fontFamily="monospace">
                  {Number((MAX_SUPPLY * (1 - t) / 1_000_000).toFixed(2))}M
                </text>
              </g>
            );
          })}
          {xTicks.map((t) => {
            const x = CHART.LEFT + t * plotW;
            return (
              <g key={`x-${t}`}>
                <line x1={x} x2={x} y1={CHART.TOP} y2={CHART.H - CHART.BOTTOM} stroke="rgb(var(--border-default))" strokeDasharray="3 4" />
                <text x={x} y={CHART.H - 18} textAnchor="middle" fill="rgb(var(--text-tertiary))" fontSize="6" fontFamily="monospace">
                  {(maxReserve * t).toFixed(1)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#cpFill)" />
          <path d={curvePath} fill="none" stroke="rgb(var(--accent-primary))" strokeWidth="2" strokeLinecap="round" />

          <line x1={gradX} x2={gradX} y1={CHART.TOP} y2={CHART.H - CHART.BOTTOM} stroke="rgb(var(--accent-primary))" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          <text x={gradX} y={CHART.TOP - 6} textAnchor="middle" fill="rgb(var(--accent-primary))" fontSize="8" fontFamily="monospace" fontWeight="600">
            grad
          </text>

          {thresholds.map((t) => {
            const cx = xScale(t.reserveOkb);
            const cy = yScale(t.supply);
            const r = t.isGrad ? 3.5 : 2.5;
            const fill = t.isGrad ? "rgb(var(--accent-primary))" : "rgb(var(--surface-base))";
            const stroke = t.isGrad ? "rgb(var(--accent-primary))" : "rgb(var(--content-secondary))";
            return (
              <g key={t.label}>
                <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth="1.5" />
              </g>
            );
          })}

          <text x={CHART.W / 2} y={CHART.H - 4} textAnchor="middle" fill="rgb(var(--text-tertiary))" fontSize="8" fontFamily="monospace">OKB</text>
          <text x={12} y={CHART.H / 2} textAnchor="middle" fill="rgb(var(--text-tertiary))" fontSize="8" fontFamily="monospace" transform={`rotate(-90 12 ${CHART.H / 2})`}>tokens</text>
        </svg>
      </div>

      <div className="border-t border-border/40 px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
          {thresholds.map((t) => (
            <div key={t.label} className="flex justify-between items-baseline gap-2">
              <span className={t.isGrad ? "text-accent-primary text-xs font-semibold" : "text-content-tertiary text-xs"}>
                {t.label}{t.isGrad ? " grad" : ""}
              </span>
              <span className="font-mono text-xs text-content-primary">
                {t.reserveOkb.toFixed(4)} OKB
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-content-tertiary leading-relaxed">
          Lower S = steeper curve, faster price growth. Higher S = flatter curve, more gradual.
        </p>
      </div>
    </div>
  );
}