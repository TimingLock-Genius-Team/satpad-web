"use client";

import React from "react";
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

const MAX_SUPPLY = 21;

const chartData = [
  { epoch: 0, reward: 29000, supply: 0, showLabel: true, label: "29k" },
  { epoch: 1, reward: 14500, supply: 10.5 },
  { epoch: 2, reward: 6000, supply: 15.75, showLabel: true, label: "6k" },
  { epoch: 3, reward: 2500, supply: 18.375 },
  { epoch: 4, reward: 1000, supply: 19.6875, isCurrent: true, showLabel: true, label: "1k" },
  { epoch: 5, reward: 500, supply: 20.34375 },
  { epoch: 6, reward: 321, supply: 20.671875, showLabel: true, label: "321" },
  { epoch: 7, reward: 100, supply: 20.8359375 },
  { epoch: 8, supply: 20.91796875 },
];

const xTickLabels: Record<number, string> = {
  0: "0",
  2: "750",
  4: "1500",
  6: "2250",
  8: "\u221E",
};

const currentPoint = chartData.find((d) => d.isCurrent);
const currentEpoch = currentPoint?.epoch ?? 4;

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number; payload?: (typeof chartData)[number] }[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-[#111] border border-[#333] p-3 rounded-lg text-xs font-mono shadow-xl min-w-[160px]">
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
        <span className="text-content-secondary">epoch</span>
        <span className="text-content-primary text-right">
          {xTickLabels[data.epoch] ?? data.epoch}
        </span>

        {data.reward != null && (
          <>
            <span className="text-content-secondary">reward</span>
            <span className="text-accent-primary text-right">
              {data.reward.toLocaleString()}
            </span>
          </>
        )}

        <span className="text-content-secondary">supply</span>
        <span className="text-accent-primary text-right">
          {data.supply.toFixed(1)}m
        </span>
      </div>
    </div>
  );
}

function CustomBarLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  index?: number;
}) {
  const { x = 0, y = 0, width = 0, index = 0 } = props;
  const entry = chartData[index];
  if (!entry?.showLabel) return null;

  const isCurrent = entry.isCurrent;

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={isCurrent ? "#00ff88" : "#64748B"}
      textAnchor="middle"
      fontSize={11}
      fontFamily="monospace"
      fontWeight={isCurrent ? 600 : 400}
    >
      {entry.label}
    </text>
  );
}

const CurrentDot = (props: {
  cx?: number;
  cy?: number;
  index?: number;
}) => {
  const { cx = 0, cy = 0, index } = props;
  if (index !== chartData.findIndex((d) => d.isCurrent)) return null;
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
};

export const SatoIssuanceChart = () => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full h-[260px] bg-[#0a0a0a]/50 rounded-xl overflow-hidden">
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
              dataKey="epoch"
              type="number"
              domain={[-0.5, 8]}
              tick={{ fill: "#64748B", fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              ticks={[0, 2, 4, 6, 8]}
              tickFormatter={(v) => xTickLabels[v] ?? String(v)}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[0, MAX_SUPPLY]}
              tick={{ fill: "#64748B", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              ticks={[0, 21]}
              tickFormatter={(v) => (v === 0 ? "0" : `${v}m`)}
              width={35}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 32000]}
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
              y={MAX_SUPPLY}
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
              x={currentEpoch}
              stroke="#00ff88"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />

            <Bar
              dataKey="reward"
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
              dataKey="supply"
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
        cumulative eth (0 to ∞)
      </p>
    </div>
  );
};
