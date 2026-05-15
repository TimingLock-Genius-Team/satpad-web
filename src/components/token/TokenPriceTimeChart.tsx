"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatOkbPrice, weiToUnits } from "@/lib/bonding-curve-chart";
import { timestampMs } from "@/lib/time-display";
import type { ApiChartPoint } from "@/lib/api-types";

type PricePoint = {
  ts: number;
  priceOkb: number;
};

interface TokenPriceTimeChartProps {
  points?: ApiChartPoint["points"];
  currentPriceOkbWei?: string | null;
}

function buildPriceData(
  points: ApiChartPoint["points"] | undefined,
  currentPriceOkbWei: string | null | undefined
): PricePoint[] {
  const mapped = (points ?? [])
    .map((point) => ({
      ts: timestampMs(point.ts),
      priceOkb: weiToUnits(point.priceOkb),
    }))
    .filter((point) => Number.isFinite(point.ts) && Number.isFinite(point.priceOkb));

  if (mapped.length > 0) return mapped;

  return [
    {
      ts: Date.now(),
      priceOkb: weiToUnits(currentPriceOkbWei),
    },
  ];
}

function formatTime(ts: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: number;
}) {
  const price = payload?.[0]?.value;
  if (!active || price == null || label == null) return null;

  return (
    <div className="bg-[#111] border border-[#333] p-3 rounded-lg text-xs font-mono shadow-xl min-w-[160px]">
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
        <span className="text-content-secondary">time</span>
        <span className="text-content-primary text-right">{formatTime(label)}</span>

        <span className="text-content-secondary">price</span>
        <span className="text-accent-primary text-right">{formatOkbPrice(price)} OKB</span>
      </div>
    </div>
  );
}

export function TokenPriceTimeChart({ points, currentPriceOkbWei }: TokenPriceTimeChartProps) {
  const data = buildPriceData(points, currentPriceOkbWei);
  const maxPrice = Math.max(...data.map((point) => point.priceOkb), 0);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full h-[260px] bg-[#0a0a0a]/50 rounded-xl overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 24, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="ts"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(value) => formatTime(Number(value))}
            />
            <YAxis
              dataKey="priceOkb"
              domain={[0, maxPrice > 0 ? maxPrice * 1.1 : 1]}
              tick={{ fill: "#64748B", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatOkbPrice(Number(value))}
              width={58}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)", strokeDasharray: "2 4" }} />
            <Line
              type="monotone"
              dataKey="priceOkb"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={data.length === 1}
              activeDot={{ r: 5, fill: "#0a0a0a", stroke: "#f59e0b", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-content-tertiary font-mono text-center uppercase tracking-wider">
        time -&gt; price from backend chart data
      </p>
    </div>
  );
}
