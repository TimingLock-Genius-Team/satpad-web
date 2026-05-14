"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface BondingCurvePoint {
  cumEth: number;
  supply: number;
  price: number;
}

interface BondingCurveChartProps {
  currentSupply: number;
  forwardSupply: number;
  drift: number;
  currentPrice: number;
  burnPrice: number;
  mintPrice: number;
}

const MAX_SUPPLY = 21;
const MAX_ETH = 3000;
const POINTS = 100;

function generateBondingCurveData(
  currentSupply: number,
  currentPrice: number
): BondingCurvePoint[] {
  const rate = 0.0018;
  const pricePower = 4.5;

  const targetCumEth =
    currentSupply >= MAX_SUPPLY
      ? MAX_ETH
      : -Math.log(1 - currentSupply / MAX_SUPPLY) / rate;

  const priceCoeff =
    targetCumEth > 0 ? currentPrice / Math.pow(targetCumEth / MAX_ETH, pricePower) : 1;

  const data: BondingCurvePoint[] = [];

  for (let i = 0; i < POINTS; i++) {
    const t = i / (POINTS - 1);
    const cumEth = t * MAX_ETH;
    const supply = MAX_SUPPLY * (1 - Math.exp(-rate * cumEth));
    const price = priceCoeff * Math.pow(cumEth / MAX_ETH, pricePower);

    data.push({
      cumEth: Math.round(cumEth),
      supply: Math.round(supply * 100) / 100,
      price: Math.round(price * 100) / 100,
    });
  }

  return data;
}

function cumEthForSupply(supply: number): number {
  if (supply <= 0) return 0;
  if (supply >= MAX_SUPPLY) return MAX_ETH;
  const rate = 0.0018;
  return -Math.log(1 - supply / MAX_SUPPLY) / rate;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number; payload?: BondingCurvePoint }[];
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const cumEth = payload[0]?.payload?.cumEth;
  const supply = payload.find((p: { dataKey?: string | number; value?: number }) => p.dataKey === "supply")?.value;
  const price = payload.find((p: { dataKey?: string | number; value?: number }) => p.dataKey === "price")?.value;
  const pctOfCap =
    supply != null ? ((supply / MAX_SUPPLY) * 100).toFixed(2) : "0";

  return (
    <div className="bg-[#111] border border-[#333] p-4 rounded-lg text-xs font-mono shadow-xl min-w-[180px]">
      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
        <span className="text-content-secondary">cum. eth</span>
        <span className="text-content-primary text-right">
          {cumEth?.toLocaleString()}
        </span>

        <span className="text-content-secondary">supply</span>
        <span className="text-accent-primary text-right">
          {typeof supply === "number" ? `${supply.toFixed(1)}m` : "-"}
        </span>

        <span className="text-content-secondary">price</span>
        <span className="text-accent-warning text-right">
          {typeof price === "number" ? `$${price.toFixed(2)}` : "-"}
        </span>

        <span className="text-content-secondary">% of cap</span>
        <span className="text-content-primary text-right">{pctOfCap}%</span>
      </div>
    </div>
  );
}

export function BondingCurveChart({
  currentSupply,
  forwardSupply,
  drift,
  currentPrice,
  burnPrice,
  mintPrice,
}: BondingCurveChartProps) {
  const data = useMemo(
    () => generateBondingCurveData(currentSupply, currentPrice),
    [currentSupply, currentPrice]
  );

  const currentCumEth = useMemo(
    () => cumEthForSupply(currentSupply),
    [currentSupply]
  );
  const forwardCumEth = useMemo(
    () => cumEthForSupply(forwardSupply),
    [forwardSupply]
  );

  const defaultIndex = useMemo(() => {
    return data.findIndex((d) => d.cumEth >= currentCumEth);
  }, [data, currentCumEth]);

  return (
    <div className="flex flex-col border border-border p-6 rounded-card bg-surface shadow-sm font-sans">
      <div className="flex justify-between items-start xl:items-center flex-col xl:flex-row gap-4 mb-6 w-full">
        <div className="flex gap-6 items-center font-mono text-sm">
          <span className="text-content-secondary">curve</span>
          <div className="flex items-center gap-2 text-accent-primary">
            <div className="w-4 h-[2px] bg-accent-primary" />
            supply
          </div>
          <div className="flex items-center gap-2 text-accent-warning">
            <div className="w-4 h-[2px] bg-accent-warning" />
            price
          </div>
        </div>

        <div className="flex items-center gap-x-4 font-mono text-sm whitespace-nowrap overflow-x-auto">
          <div className="text-content-secondary shrink-0">
            supply{" "}
            <span className="text-accent-primary">
              {currentSupply.toFixed(1)}m
            </span>{" "}
            of{" "}
            <span className="text-content-primary">
              {forwardSupply.toFixed(1)}m
            </span>{" "}
            forward{" "}
            <span className="text-content-tertiary">
              (drift{" "}
              <span className="text-accent-danger">
                {drift.toLocaleString()}k
              </span>
              )
            </span>
          </div>
          <div className="text-content-secondary shrink-0">
            price{" "}
            <span className="text-accent-danger">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="border border-border/50 px-3 py-1.5 rounded-md bg-surface-base text-content-secondary text-xs shrink-0">
            burn{" "}
            <span className="text-accent-danger">${burnPrice.toFixed(4)}</span>{" "}
            <span className="text-content-tertiary">/</span> mint{" "}
            <span className="text-accent-primary">${mintPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-[400px] mb-6 bg-[#0a0a0a] rounded-xl border border-border/50 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 40, left: 20, bottom: 30 }}
          >
            <defs>
              <linearGradient
                id="supplyGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 4"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="cumEth"
              type="number"
              domain={[0, MAX_ETH]}
              tick={{ fill: "#64748B", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              label={{
                value: "cumulative eth",
                position: "insideBottom",
                offset: -8,
                fill: "#64748B",
                fontSize: 12,
              }}
              ticks={[0, 500, 1000, 1500, 2000, 2500, 3000]}
              tickFormatter={(v) => (v === 3000 ? "∞" : String(v))}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[0, MAX_SUPPLY]}
              tick={{ fill: "#64748B", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              ticks={[0, 5, 10, 15, 20, 21]}
              tickFormatter={(v) => (v === 0 ? "0" : `${v}m`)}
              width={45}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, "auto"]}
              tick={{ fill: "#f59e0b", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(v) =>
                v === 0 ? "$0" : `$${Number(v).toFixed(2)}`
              }
              width={55}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.15)", strokeDasharray: "2 4" }}
              defaultIndex={defaultIndex !== -1 ? defaultIndex : undefined}
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="supply"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#supplyGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#0a0a0a", stroke: "#10b981", strokeWidth: 2 }}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="price"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#0a0a0a", stroke: "#f59e0b", strokeWidth: 2 }}
            />

            <ReferenceLine
              yAxisId="left"
              x={currentCumEth}
              stroke="#10b981"
              strokeWidth={1}
              strokeDasharray="2 4"
              opacity={0.3}
            />

            <ReferenceLine
              yAxisId="left"
              x={forwardCumEth}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-content-tertiary max-w-3xl leading-relaxed font-mono">
        21m pure-math asymptote that the curve approaches but never touches.
        minting continues indefinitely; price grows exponentially with
        cumulative eth.
      </p>
    </div>
  );
}
