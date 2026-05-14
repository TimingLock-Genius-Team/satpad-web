import React from "react";

export const SatoIssuanceChart = () => {
  const data = [
    { label: "29k", reward: 29000 },
    { label: "", reward: 14500 },
    { label: "6k", reward: 6000 },
    { label: "", reward: 2500 },
    { label: "1k", reward: 1000, current: true },
    { label: "", reward: 500 },
    { label: "321", reward: 321 },
    { label: "", reward: 100 },
  ];

  // Supply data points: [supply in millions]
  const supplies = [
    { y: 0 },
    { y: 10.5 },
    { y: 15.75 },
    { y: 18.375 },
    { y: 19.6875 },
    { y: 20.34375 },
    { y: 20.671875 },
    { y: 20.8359375 },
    { y: 20.91796875 },
  ];

  const xAxisTicks = [
    { index: 0, label: "0" },
    { index: 2, label: "750" },
    { index: 4, label: "1500", current: true },
    { index: 6, label: "2250" },
    { index: 8, label: "∞" },
  ];

  const width = 600;
  const height = 260;
  const padding = { top: 40, right: 20, bottom: 40, left: 40 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Max values
  const maxReward = 29000;
  const maxSupply = 21;

  // Scales
  const numBars = data.length;
  const barWidth = innerWidth / numBars;
  
  // Create a mapping from index to X coordinate
  const getTickX = (index: number) => padding.left + index * barWidth;
  const getBarX = (index: number) => padding.left + index * barWidth + 2; // +2 for gap
  const getBarCenterX = (index: number) => padding.left + index * barWidth + barWidth / 2;
  const getBarWidth = () => barWidth - 4; // -4 for gap

  const getRewardY = (reward: number) => {
    // Let's make the max reward height about 35% of the inner height
    const barMaxHeight = innerHeight * 0.35;
    const h = (reward / maxReward) * barMaxHeight;
    return padding.top + innerHeight - h;
  };

  const getSupplyY = (supply: number) => {
    // Leave some padding at the top for the 21m label
    const maxCurveHeight = innerHeight * 0.9;
    return padding.top + innerHeight - (supply / maxSupply) * maxCurveHeight;
  };

  // Generate SVG path for the supply line
  let linePath = "";
  supplies.forEach((point, i) => {
    const x = padding.left + i * barWidth;
    const y = getSupplyY(point.y);
    if (i === 0) {
      linePath += `M ${x} ${y} `;
    } else {
      // Create a smooth curve
      const prevX = padding.left + (i - 1) * barWidth;
      const prevY = getSupplyY(supplies[i - 1].y);
      const cp1X = prevX + barWidth / 2;
      const cp1Y = prevY;
      const cp2X = x - barWidth / 2;
      const cp2Y = y;
      linePath += `C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x} ${y} `;
    }
  });

  const currentIndex = data.findIndex(d => d.current);
  const currentX = getBarCenterX(currentIndex);
  // Current Y is halfway through the epoch
  const currentSupply = (supplies[currentIndex].y + supplies[currentIndex + 1].y) / 2;
  const currentY = getSupplyY(currentSupply);

  return (
    <div className="w-full relative overflow-hidden bg-surface-base border border-border/50 rounded-card" style={{ paddingBottom: '45%' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full text-xs font-mono"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background Grids */}
        {/* 21m dashed line */}
        <line
          x1={padding.left}
          y1={getSupplyY(21)}
          x2={width - padding.right}
          y2={getSupplyY(21)}
          stroke="currentColor"
          className="text-content-tertiary"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text
          x={padding.left - 8}
          y={getSupplyY(21)}
          fill="currentColor"
          className="text-content-secondary"
          textAnchor="end"
          alignmentBaseline="middle"
        >
          21m
        </text>

        {/* 0 line */}
        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={width - padding.right}
          y2={padding.top + innerHeight}
          stroke="currentColor"
          className="text-content-tertiary"
          strokeWidth="1.5"
        />
        <text
          x={padding.left - 8}
          y={padding.top + innerHeight}
          fill="currentColor"
          className="text-content-secondary"
          textAnchor="end"
          alignmentBaseline="middle"
        >
          0
        </text>
        
        {/* Y Axis line */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerHeight}
          stroke="currentColor"
          className="text-content-tertiary"
          strokeWidth="1.5"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const y = getRewardY(d.reward);
          const h = padding.top + innerHeight - y;
          const isCurrent = d.current;
          
          return (
            <g key={i}>
              <rect
                x={getBarX(i)}
                y={y}
                width={getBarWidth()}
                height={h}
                className={isCurrent ? "fill-accent-primary" : "fill-accent-primary/20"}
              />
              {d.label && (
                <text
                  x={getBarCenterX(i)}
                  y={y - 8}
                  fill="currentColor"
                  className={isCurrent ? "text-accent-primary font-medium" : "text-content-secondary"}
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}

        {/* X Axis Ticks */}
        {xAxisTicks.map((tick) => {
          const x = getTickX(tick.index);
          const y = padding.top + innerHeight + 20;
          
          return (
            <text
              key={tick.label}
              x={x}
              y={y}
              fill="currentColor"
              className={tick.current ? "text-accent-primary font-bold" : "text-content-tertiary"}
              textAnchor={tick.index === 0 ? "start" : tick.index === numBars ? "end" : "middle"}
            >
              {tick.label}
            </text>
          );
        })}

        {/* Current Epoch Vertical Dashed Line */}
        <line
          x1={currentX}
          y1={currentY}
          x2={currentX}
          y2={padding.top + innerHeight}
          stroke="currentColor"
          className="text-accent-primary"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Supply Curve */}
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          className="text-accent-primary"
          strokeWidth="2.5"
        />

        {/* Current Marker Point */}
        <circle
          cx={currentX}
          cy={currentY}
          r="4.5"
          className="fill-surface-base stroke-accent-primary"
          strokeWidth="2.5"
        />

        {/* Footer Text */}
        <text
          x={padding.left + innerWidth / 2}
          y={height - 5}
          fill="currentColor"
          className="text-content-tertiary font-mono text-xs"
          textAnchor="middle"
        >
          cumulative eth (0 to ∞)
        </text>
      </svg>
    </div>
  );
};
