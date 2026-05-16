"use client";

import { useCallback, useId, useMemo, useRef } from "react";
import { formatEther, parseEther } from "viem";
import {
  grossWeiToReserveWei,
  maxLaunchReserveWei,
  minGrossWeiForReserveWei,
} from "@/lib/launch-buy-limits";

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

function tryParseEtherInput(raw: string): bigint | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  try {
    return parseEther(trimmed as `${bigint}`);
  } catch {
    return null;
  }
}

function formatEtherTrim(wei: bigint): string {
  return formatEther(wei).replace(/\.?0+$/, "");
}

function weiFromMaxReserveEther(maxReserveEther: number): bigint {
  const s = maxReserveEther.toFixed(18);
  try {
    return parseEther(s as `${bigint}`);
  } catch {
    const fractional = BigInt(Math.floor(maxReserveEther * 1e12));
    return fractional * BigInt(1e6);
  }
}

/** View-box X coordinate from PointerEvent.clientX/Y for a uniform-fit SVG chart. */
function clientToViewBoxX(svg: SVGSVGElement, clientX: number): number {
  const rect = svg.getBoundingClientRect();
  if (rect.width <= 0) return CHART.LEFT;
  return ((clientX - rect.left) / rect.width) * CHART.W;
}

export function CurvePreview({
  curveS,
  feeBps,
  launchBuyNative,
  onLaunchBuyNativeChange,
}: {
  curveS: number;
  feeBps: number;
  launchBuyNative: string;
  onLaunchBuyNativeChange: (decimalNativeAmount: string) => void;
}) {
  const gradId = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement | null>(null);

  const sLimit = Math.max(1, Math.min(100, curveS || 1));
  const { thresholds, gradReserve } = computeThresholds(sLimit);

  const maxReserve = gradReserve * 1.3;
  const reserveAtHalfSupply = useMemo(() => sLimit * Math.LN2, [sLimit]);
  const reserveHalfWei = useMemo(() => maxLaunchReserveWei(sLimit), [sLimit]);
  const maxReserveWei = useMemo(() => weiFromMaxReserveEther(maxReserve), [maxReserve]);

  const plotW = CHART.W - CHART.LEFT - CHART.RIGHT;
  const plotH = CHART.H - CHART.TOP - CHART.BOTTOM;

  const xScale = (r: number) => CHART.LEFT + (r / maxReserve) * plotW;
  const yScale = (supply: number) => CHART.TOP + (1 - supply / MAX_SUPPLY) * plotH;

  const { curvePath, curvePathHalf, areaPath } = useMemo(() => {
    const plotWCurve = CHART.W - CHART.LEFT - CHART.RIGHT;
    const plotHCurve = CHART.H - CHART.TOP - CHART.BOTTOM;
    const xS = (r: number) => CHART.LEFT + (r / maxReserve) * plotWCurve;
    const yS = (supply: number) => CHART.TOP + (1 - supply / MAX_SUPPLY) * plotHCurve;
    const main = Array.from({ length: 60 }, (_, i) => {
      const r = (i / 59) * maxReserve;
      const supply = MAX_SUPPLY * (1 - Math.exp(-r / sLimit));
      return `${i === 0 ? "M" : "L"} ${xS(r).toFixed(1)} ${yS(supply).toFixed(1)}`;
    }).join(" ");
    const steps = 32;
    const half = Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1);
      const r = reserveAtHalfSupply * t;
      const supply = MAX_SUPPLY * (1 - Math.exp(-r / sLimit));
      return `${i === 0 ? "M" : "L"} ${xS(r).toFixed(1)} ${yS(supply).toFixed(1)}`;
    }).join(" ");
    const area = `${main} L ${xS(maxReserve).toFixed(1)} ${CHART.H - CHART.BOTTOM} L ${CHART.LEFT} ${CHART.H - CHART.BOTTOM} Z`;
    return { curvePath: main, curvePathHalf: half, areaPath: area };
  }, [maxReserve, sLimit, reserveAtHalfSupply]);

  const gradX = xScale(gradReserve);
  const halfEndX = xScale(reserveAtHalfSupply);

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xTicks = [0, 0.25, 0.5, 0.75, 1];

  const parsedGrossWei = useMemo(() => tryParseEtherInput(launchBuyNative), [launchBuyNative]);

  const reserveWeiFromStore = useMemo(() => {
    if (parsedGrossWei === null || parsedGrossWei <= BigInt(0)) return BigInt(0);
    const r = grossWeiToReserveWei(parsedGrossWei, feeBps);
    return r > reserveHalfWei ? reserveHalfWei : r;
  }, [parsedGrossWei, feeBps, reserveHalfWei]);

  const reserveEtherActive = Number(formatEther(reserveWeiFromStore));

  const activeSupplyMinted =
    reserveWeiFromStore > BigInt(0) ? MAX_SUPPLY * (1 - Math.exp(-reserveEtherActive / sLimit)) : 0;

  const handleCx = reserveWeiFromStore > BigInt(0) ? xScale(reserveEtherActive) : CHART.LEFT;
  const handleCy = reserveWeiFromStore > BigInt(0) ? yScale(activeSupplyMinted) : yScale(0);

  const pctStr = ((100 * activeSupplyMinted) / MAX_SUPPLY).toFixed(2);
  const cumStr = reserveEtherActive.toFixed(4);
  const ttW = 152;
  const ttH = 32;
  const ttCx = Math.min(CHART.W - CHART.RIGHT - ttW / 2, Math.max(CHART.LEFT + ttW / 2, handleCx));
  const ttY = Math.max(CHART.TOP + 2, handleCy - ttH - 8);

  const applyReserveWei = useCallback(
    (targetReserveWei: bigint) => {
      const clampedWei = targetReserveWei < BigInt(0) ? BigInt(0) : targetReserveWei > reserveHalfWei ? reserveHalfWei : targetReserveWei;
      if (clampedWei <= BigInt(0)) {
        onLaunchBuyNativeChange("");
        return;
      }
      const gross = minGrossWeiForReserveWei(clampedWei, feeBps);
      onLaunchBuyNativeChange(formatEtherTrim(gross));
    },
    [feeBps, onLaunchBuyNativeChange, reserveHalfWei]
  );

  const reserveWeiFromSvgX = useCallback(
    (svgXView: number) => {
      const gx = Math.min(Math.max(0, svgXView - CHART.LEFT), plotW);
      const prec = BigInt(1_000_000);
      const gxWei = BigInt(Math.floor(Math.max(0, Number.isFinite(gx) ? gx : 0) * Number(prec)));
      const denom = BigInt(plotW * 1_000_000);
      let reserveWeiGuess = denom > BigInt(0) ? (gxWei * maxReserveWei) / denom : BigInt(0);
      if (reserveWeiGuess > reserveHalfWei) reserveWeiGuess = reserveHalfWei;
      return reserveWeiGuess;
    },
    [maxReserveWei, plotW, reserveHalfWei]
  );

  const onPointerBand = useCallback(
    (e: React.PointerEvent<SVGSVGElement | SVGRectElement>) => {
      if (!svgRef.current) return;
      const vbX = clientToViewBoxX(svgRef.current, e.clientX);
      applyReserveWei(reserveWeiFromSvgX(vbX));
      e.preventDefault();
    },
    [applyReserveWei, reserveWeiFromSvgX]
  );

  return (
    <div className="bg-surface rounded-xl border border-border/50 overflow-hidden">
      <div className="px-4 pt-4">
        <p className="text-[11px] text-content-tertiary mb-3">
          Supply vs cumulative OKB &mdash; S = <span className="text-content-primary font-mono">{sLimit}</span>
        </p>
        <p className="text-[10px] text-content-tertiary mb-2 leading-relaxed">
          Drag inside the shaded 0–{50}% region (mint cap) — synced with Amount (native) below. Curve shape updates when S
          changes. 输入金额为含费的 gross native；图示横坐标为入账曲线的累计净值 OKB。
        </p>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART.W} ${CHART.H}`}
          className="w-full h-auto cursor-crosshair touch-none select-none"
          role="img"
          aria-label="Bonding curve preview — drag launch buy region"
          style={{ touchAction: "none" }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
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
                  {Number(((MAX_SUPPLY * (1 - t)) / 1_000_000).toFixed(2))}M
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

          {/* 0–50% cumulative reserve band (interaction + visual guide) */}
          <rect
            x={CHART.LEFT}
            y={CHART.TOP}
            width={halfEndX - CHART.LEFT}
            height={CHART.H - CHART.BOTTOM - CHART.TOP}
            fill="rgb(var(--accent-danger))"
            fillOpacity={0.08}
            stroke="rgb(var(--accent-danger))"
            strokeOpacity={0.45}
            strokeWidth={1}
          />

          <path d={areaPath} fill={`url(#${gradId})`} />
          <path d={curvePath} fill="none" stroke="rgb(var(--accent-primary))" strokeWidth="2" strokeLinecap="round" />
          <path
            d={curvePathHalf}
            fill="none"
            stroke="rgb(var(--content-primary))"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.12}
            pointerEvents="none"
          />

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
                <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth="1.5" pointerEvents="none" />
              </g>
            );
          })}

          {/* Interaction strip over 0–50% reserve */}
          <rect
            x={CHART.LEFT}
            y={CHART.TOP}
            width={halfEndX - CHART.LEFT}
            height={CHART.H - CHART.BOTTOM - CHART.TOP}
            fill="transparent"
            onPointerDown={(e) => {
              const el = e.currentTarget;
              el.setPointerCapture(e.pointerId);
              onPointerBand(e);
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              onPointerBand(e);
            }}
            onPointerUp={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
              }
            }}
          />

          {reserveWeiFromStore > BigInt(0) && (
            <g pointerEvents="none">
              <line
                x1={handleCx}
                x2={handleCx}
                y1={CHART.H - CHART.BOTTOM}
                y2={handleCy}
                stroke="rgb(var(--content-tertiary))"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity={0.7}
              />
              <circle cx={handleCx} cy={handleCy} r={5} fill="rgb(var(--surface-base))" stroke="rgb(var(--accent-primary))" strokeWidth={2} />
              <rect
                x={ttCx - ttW / 2}
                y={ttY}
                width={ttW}
                height={ttH}
                rx={4}
                fill="rgb(var(--surface-highlight))"
                stroke="rgb(var(--border-default))"
                strokeOpacity={0.8}
              />
              <text x={ttCx} y={ttY + 13} textAnchor="middle" fontSize="8" fontFamily="monospace">
                <tspan fill="rgb(var(--accent-primary))">{pctStr}%</tspan>
                <tspan fill="rgb(var(--text-tertiary))"> supply</tspan>
              </text>
              <text x={ttCx} y={ttY + 26} textAnchor="middle" fontSize="8" fontFamily="monospace">
                <tspan fill="rgb(var(--text-tertiary))">cum. </tspan>
                <tspan fill="rgb(var(--accent-primary))">{cumStr}</tspan>
                <tspan fill="rgb(var(--text-tertiary))"> OKB (reserve)</tspan>
              </text>
            </g>
          )}

          <text x={CHART.W / 2} y={CHART.H - 4} textAnchor="middle" fill="rgb(var(--text-tertiary))" fontSize="8" fontFamily="monospace">
            OKB
          </text>
          <text
            x={12}
            y={CHART.H / 2}
            textAnchor="middle"
            fill="rgb(var(--text-tertiary))"
            fontSize="8"
            fontFamily="monospace"
            transform={`rotate(-90 12 ${CHART.H / 2})`}
          >
            tokens
          </text>
        </svg>
      </div>

      <div className="border-t border-border/40 px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
          {thresholds.map((t) => (
            <div key={t.label} className="flex justify-between items-baseline gap-2">
              <span className={t.isGrad ? "text-accent-primary text-xs font-semibold" : "text-content-tertiary text-xs"}>
                {t.label}
                {t.isGrad ? " grad" : ""}
              </span>
              <span className="font-mono text-xs text-content-primary">{t.reserveOkb.toFixed(4)} OKB</span>
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
