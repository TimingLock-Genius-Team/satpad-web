"use client";

import { useMemo } from "react";
import { cn } from "@/utils/cn";
import {
  buildBondingCurveChartModel,
  formatCompactTokenAmount,
  formatOkbAmount,
  formatOkbPrice,
  weiToUnits,
  type BondingCurveChartModel,
} from "@/lib/bonding-curve-chart";
import type { ApiTokenListItem } from "@/lib/api-types";

interface TokenChartProps {
  curve?: ApiTokenListItem["curve"];
  reserveOkbWei?: string | null;
  marketPriceOkbWei?: string | null;
  burnPriceOkbWei?: string | null;
  mintPriceOkbWei?: string | null;
  mintedAmount?: string;
  totalAmount?: string;
  progressPercent: number;
  className?: string;
}

const CHART_COLORS = {
  supply: "#38E8A2",
  price: "#F5B942",
  current: "#EC4899",
  grid: "rgba(148, 163, 184, 0.18)",
  border: "rgba(148, 163, 184, 0.28)",
  text: "#8B93A7",
};

const CHART = {
  width: 900,
  height: 360,
  left: 58,
  right: 64,
  top: 30,
  bottom: 44,
};

function createLinePath(points: Array<{ x: number; y: number }>): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
}

function buildSvg(model: BondingCurveChartModel) {
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const xScale = (reserveOkb: number) => CHART.left + (reserveOkb / model.maxReserveOkb) * plotWidth;
  const supplyY = (supplyTokens: number) => CHART.top + (1 - supplyTokens / model.maxSupplyTokens) * plotHeight;
  const priceY = (priceOkb: number) => CHART.top + (1 - priceOkb / model.maxPriceOkb) * plotHeight;
  const supplyPoints = model.points.map((point) => ({ x: xScale(point.reserveOkb), y: supplyY(point.supplyTokens) }));
  const pricePoints = model.points.map((point) => ({ x: xScale(point.reserveOkb), y: priceY(point.priceOkb) }));
  const currentX = xScale(model.current.reserveOkb);
  const currentSupplyY = supplyY(model.current.supplyTokens);
  const currentPriceY = priceY(model.current.priceOkb);
  const baseline = CHART.height - CHART.bottom;

  return {
    plotWidth,
    plotHeight,
    baseline,
    xScale,
    supplyY,
    priceY,
    supplyPath: createLinePath(supplyPoints),
    supplyAreaPath: `${createLinePath(supplyPoints)} L${xScale(model.maxReserveOkb).toFixed(2)} ${baseline} L${CHART.left} ${baseline} Z`,
    pricePath: createLinePath(pricePoints),
    currentX,
    currentSupplyY,
    currentPriceY,
  };
}

function LegendDot({ color }: { color: string }) {
  return <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: color }} />;
}

export function TokenChart({
  curve,
  reserveOkbWei,
  marketPriceOkbWei,
  burnPriceOkbWei,
  mintPriceOkbWei,
  mintedAmount,
  totalAmount,
  progressPercent,
  className,
}: TokenChartProps) {
  const model = useMemo(() => buildBondingCurveChartModel({
    curve,
    reserveOkbWei,
    marketPriceOkbWei,
    mintedAmount,
    totalAmount,
  }), [curve, reserveOkbWei, marketPriceOkbWei, mintedAmount, totalAmount]);
  const svg = useMemo(() => buildSvg(model), [model]);
  const burnPrice = burnPriceOkbWei ? formatOkbPrice(weiToUnits(burnPriceOkbWei)) : "--";
  const mintPrice = mintPriceOkbWei ? formatOkbPrice(weiToUnits(mintPriceOkbWei)) : "--";
  const driftTokens = Math.max(model.maxSupplyTokens - model.current.supplyTokens, 0);
  const xTicks = [0, 0.25, 0.5, 0.75, 1];
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className={cn("bg-[#0D0F13] rounded-xl border border-border p-4 md:p-5", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3 text-xs font-mono">
        <div className="flex items-center gap-4 text-content-secondary">
          <span>curve</span>
          <span className="flex items-center gap-2"><LegendDot color={CHART_COLORS.supply} /> supply</span>
          <span className="flex items-center gap-2"><LegendDot color={CHART_COLORS.price} /> price</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-content-tertiary">
          <span>
            supply <span className="text-accent-primary">{formatCompactTokenAmount(model.current.supplyTokens)}</span> of{" "}
            <span className="text-content-secondary">{formatCompactTokenAmount(model.maxSupplyTokens)}</span> forward
            <span className="text-pink-400"> (drift {formatCompactTokenAmount(driftTokens)})</span>
          </span>
          <span>price <span className="text-pink-400">{formatOkbPrice(model.current.priceOkb)} OKB</span></span>
          <span className="border border-border/70 px-2 py-1 text-content-secondary">
            burn <span className="text-pink-400">{burnPrice}</span> / mint <span className="text-accent-primary">{mintPrice}</span>
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border/40 bg-[#0B0D10]">
        <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="block h-[360px] w-full" role="img" aria-label="Bonding curve supply and price chart">
          <defs>
            <linearGradient id="supplyFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.supply} stopOpacity="0.22" />
              <stop offset="100%" stopColor={CHART_COLORS.supply} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <rect x={CHART.left} y={CHART.top} width={svg.plotWidth} height={svg.plotHeight} fill="transparent" stroke={CHART_COLORS.border} />

          {yTicks.map((tick) => {
            const y = CHART.top + tick * svg.plotHeight;
            const supplyLabel = formatCompactTokenAmount(model.maxSupplyTokens * (1 - tick));
            const priceLabel = formatOkbPrice(model.maxPriceOkb * (1 - tick));
            return (
              <g key={`y-${tick}`}>
                <line x1={CHART.left} x2={CHART.width - CHART.right} y1={y} y2={y} stroke={CHART_COLORS.grid} strokeDasharray={tick === 0 ? "0" : "3 5"} />
                <text x={CHART.left - 8} y={y + 4} textAnchor="end" fill={CHART_COLORS.supply} fontSize="12" fontFamily="monospace">{supplyLabel}</text>
                <text x={CHART.width - CHART.right + 8} y={y + 4} textAnchor="start" fill={CHART_COLORS.price} fontSize="12" fontFamily="monospace">{priceLabel}</text>
              </g>
            );
          })}

          {xTicks.map((tick) => {
            const x = CHART.left + tick * svg.plotWidth;
            return (
              <g key={`x-${tick}`}>
                <line x1={x} x2={x} y1={CHART.top} y2={svg.baseline} stroke={CHART_COLORS.grid} strokeDasharray="2 6" opacity={tick === 0 || tick === 1 ? 0 : 1} />
                <text x={x} y={CHART.height - 15} textAnchor="middle" fill={CHART_COLORS.text} fontSize="11" fontFamily="monospace">
                  {formatOkbAmount(model.maxReserveOkb * tick)}
                </text>
              </g>
            );
          })}

          <path d={svg.supplyAreaPath} fill="url(#supplyFill)" />
          <path d={svg.supplyPath} fill="none" stroke={CHART_COLORS.supply} strokeWidth="2.5" />
          <path d={svg.pricePath} fill="none" stroke={CHART_COLORS.price} strokeWidth="2.2" />

          <line x1={svg.currentX} x2={svg.currentX} y1={CHART.top} y2={svg.baseline} stroke={CHART_COLORS.grid} strokeDasharray="3 5" />
          <circle cx={svg.currentX} cy={svg.currentSupplyY} r="6" fill="#0B0D10" stroke={CHART_COLORS.supply} strokeWidth="2.5" />
          <circle cx={svg.currentX} cy={svg.currentPriceY} r="5" fill={CHART_COLORS.current} stroke="#0B0D10" strokeWidth="2" />
          <circle cx={svg.xScale(model.maxReserveOkb)} cy={svg.supplyY(model.maxSupplyTokens * 0.999)} r="3" fill={CHART_COLORS.price} />
          <text x={CHART.width - CHART.right + 6} y={CHART.top + 5} fill={CHART_COLORS.price} fontSize="13" fontFamily="monospace">∞</text>

          <text x={CHART.width / 2} y={CHART.height - 3} textAnchor="middle" fill={CHART_COLORS.text} fontSize="11" fontFamily="monospace">
            cumulative OKB
          </text>
        </svg>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-content-tertiary font-mono">
        {formatCompactTokenAmount(model.maxSupplyTokens)} pure-math asymptote that the curve approaches but never touches.
        Minting continues indefinitely; price grows exponentially with cumulative OKB. Current progress: {progressPercent.toFixed(1)}%.
      </p>
    </div>
  );
}
