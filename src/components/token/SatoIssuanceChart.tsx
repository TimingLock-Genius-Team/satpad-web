"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  buildBondingCurveChartModel,
  formatCompactTokenAmount,
  formatOkbAmount,
  type BondingCurveChartModel,
} from "@/lib/bonding-curve-chart";
import type { ApiTokenListItem } from "@/lib/api-types";

interface SatoIssuanceChartProps {
  curve?: ApiTokenListItem["curve"];
  reserveOkbWei?: string | null;
  marketPriceOkbWei?: string | null;
  mintedAmount?: string;
  totalAmount?: string;
}

type SatoIssuancePoint = {
  reserveOkb: number;
  supplyTokens: number;
  issuancePerOkb: number;
  isCurrent?: boolean;
};

function issuancePerOkb(priceOkb: number): number {
  return priceOkb > 0 && Number.isFinite(priceOkb) ? 1 / priceOkb : 0;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number; payload?: SatoIssuancePoint }[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-surface-elevated border border-border p-3 rounded-lg text-xs font-mono shadow-xl min-w-[160px]">
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
        <span className="text-content-secondary">reserve</span>
        <span className="text-content-primary text-right">
          {formatOkbAmount(data.reserveOkb)} OKB
        </span>

        <span className="text-content-secondary">issuance</span>
        <span className="text-accent-primary text-right">
          {formatCompactTokenAmount(data.issuancePerOkb)} / OKB
        </span>

        <span className="text-content-secondary">supply</span>
        <span className="text-accent-primary text-right">
          {formatCompactTokenAmount(data.supplyTokens)}
        </span>
      </div>
    </div>
  );
}

function CustomBarLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  payload?: SatoIssuancePoint;
}) {
  const { x = 0, y = 0, width = 0, value = 0, payload } = props;
  if (!payload?.isCurrent) return null;

  const label = formatCompactTokenAmount(value);

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#00ff88"
      textAnchor="middle"
      fontSize={11}
      fontFamily="monospace"
      fontWeight={600}
    >
      {label}
    </text>
  );
}

function CurrentDot(props: {
  cx?: number;
  cy?: number;
  payload?: SatoIssuancePoint;
}) {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload?.isCurrent) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill="#0a0a0a"
      stroke="#00ff88"
      strokeWidth={2.5}
    />
  );
}

function buildIssuanceData(model: BondingCurveChartModel): SatoIssuancePoint[] {
  const sampled = model.points.map((point) => ({
    reserveOkb: point.reserveOkb,
    supplyTokens: point.supplyTokens,
    issuancePerOkb: issuancePerOkb(point.priceOkb),
  }));

  return [
    ...sampled,
    {
      reserveOkb: model.current.reserveOkb,
      supplyTokens: model.current.supplyTokens,
      issuancePerOkb: issuancePerOkb(model.current.priceOkb),
      isCurrent: true,
    },
  ].sort((a, b) => a.reserveOkb - b.reserveOkb);
}

export const SatoIssuanceChart = ({
  curve,
  reserveOkbWei,
  marketPriceOkbWei,
  mintedAmount,
  totalAmount,
}: SatoIssuanceChartProps) => {
  const model = useMemo(
    () => buildBondingCurveChartModel({
      curve,
      reserveOkbWei,
      marketPriceOkbWei,
      mintedAmount,
      totalAmount,
      pointCount: 9,
    }),
    [curve, reserveOkbWei, marketPriceOkbWei, mintedAmount, totalAmount]
  );
  const chartData = useMemo(() => buildIssuanceData(model), [model]);
  const maxIssuancePerOkb = Math.max(...chartData.map((point) => point.issuancePerOkb), 1);
  const currentIssuance = issuancePerOkb(model.current.priceOkb);
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((tick) => model.maxReserveOkb * tick);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full h-[260px] bg-surface-base/50 rounded-xl overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 24, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="reserveOkb"
              type="number"
              domain={[0, model.maxReserveOkb]}
              tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              ticks={xTicks}
              tickFormatter={(v) => formatOkbAmount(Number(v))}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[0, model.maxSupplyTokens]}
              tick={{ fill: "#64748B", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              ticks={[0, model.maxSupplyTokens]}
              tickFormatter={(v) => formatCompactTokenAmount(Number(v))}
              width={35}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, maxIssuancePerOkb * 1.1]}
              tick={false}
              axisLine={false}
              width={1}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.15)", strokeDasharray: "2 4" }}
            />

            <ReferenceLine
              yAxisId="left"
              y={model.maxSupplyTokens}
              stroke="rgba(100,116,139,0.5)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />

            <ReferenceLine
              yAxisId="left"
              y={0}
              stroke="rgba(100,116,139,0.5)"
              strokeWidth={1}
            />

            <ReferenceLine
              yAxisId="left"
              x={model.current.reserveOkb}
              stroke="#00ff88"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />

            <Bar
              dataKey="issuancePerOkb"
              yAxisId="right"
              barSize={18}
              radius={[2, 2, 0, 0]}
              label={<CustomBarLabel />}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isCurrent ? "#00ff88" : "rgba(0,255,136,0.12)"}
                />
              ))}
            </Bar>

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="supplyTokens"
              stroke="#00ff88"
              strokeWidth={2.5}
              dot={<CurrentDot />}
              activeDot={{ r: 5, fill: "#0a0a0a", stroke: "#00ff88", strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-content-tertiary font-mono text-center uppercase tracking-wider">
        cumulative OKB · now {formatCompactTokenAmount(currentIssuance)} tokens/OKB
      </p>
    </div>
  );
};
