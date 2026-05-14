import React from "react";

export const BitcoinIssuanceChart = () => {
  const data = [
    { year: 2009, reward: 50 },
    { year: 2012, reward: 25 },
    { year: 2016, reward: 12.5 },
    { year: 2020, reward: 6.25 },
    { year: 2024, reward: 3.125, current: true },
    { year: 2028, reward: 1.5625 },
    { year: 2032, reward: 0.78 },
    { year: 2036, reward: 0.39 },
  ];

  // Supply data points: [year, supply in millions]
  const supplies = [
    { x: 2009, y: 0 },
    { x: 2012, y: 10.5 },
    { x: 2016, y: 15.75 },
    { x: 2020, y: 18.375 },
    { x: 2024, y: 19.6875 },
    { x: 2028, y: 20.34375 },
    { x: 2032, y: 20.671875 },
    { x: 2036, y: 20.8359375 },
    { x: 2040, y: 20.91796875 },
  ];

  const width = 600;
  const height = 260;
  const padding = { top: 40, right: 20, bottom: 40, left: 40 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Max values
  const maxReward = 50;
  const maxSupply = 21;

  // Scales
  const numBars = data.length;
  const barWidth = innerWidth / numBars;
  
  // Create a mapping from year to X coordinate (center of the bar)
  const getX = (index: number) => padding.left + index * barWidth + barWidth / 2;
  const getBarX = (index: number) => padding.left + index * barWidth + 2; // +2 for gap
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
  // The line starts at the left edge of the first bar, and connects to the left edge of subsequent bars
  let linePath = "";
  supplies.forEach((point, i) => {
    const x = padding.left + i * barWidth;
    const y = getSupplyY(point.y);
    if (i === 0) {
      linePath += `M ${x} ${y} `;
    } else {
      // Create a smooth curve. Simple cubic bezier control points:
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
  const currentX = padding.left + currentIndex * barWidth + barWidth / 2;
  // Current Y is exactly halfway through the epoch
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
            <g key={d.year}>
              <rect
                x={getBarX(i)}
                y={y}
                width={getBarWidth()}
                height={h}
                className={isCurrent ? "fill-accent-warning" : "fill-accent-warning/20"}
              />
              <text
                x={getX(i)}
                y={y - 8}
                fill="currentColor"
                className={isCurrent ? "text-accent-warning font-medium" : "text-content-secondary"}
                textAnchor="middle"
              >
                {d.reward}
              </text>
              <text
                x={getX(i)}
                y={padding.top + innerHeight + 20}
                fill="currentColor"
                className={isCurrent ? "text-accent-warning font-bold" : "text-content-tertiary"}
                textAnchor="middle"
              >
                {d.year}
              </text>
            </g>
          );
        })}

        {/* Current Epoch Vertical Dashed Line */}
        <line
          x1={currentX}
          y1={currentY}
          x2={currentX}
          y2={padding.top + innerHeight}
          stroke="currentColor"
          className="text-accent-warning"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Supply Curve */}
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          className="text-accent-warning"
          strokeWidth="2.5"
        />

        {/* Current Marker Point */}
        <circle
          cx={currentX}
          cy={currentY}
          r="4.5"
          className="fill-surface-base stroke-accent-warning"
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
          halving epochs • ~4y each
        </text>
      </svg>
    </div>
  );
};
