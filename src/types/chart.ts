export interface ChartCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ChartTimeframe = "1m" | "5m" | "1h" | "1d";

const INTERVAL_MS: Record<ChartTimeframe, number> = {
  "1m": 60 * 1000,
  "5m": 5 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
};

const CANDLE_COUNT: Record<ChartTimeframe, number> = {
  "1m": 120,
  "5m": 100,
  "1h": 72,
  "1d": 60,
};

export function generateMockChartData(
  currentPrice: number,
  timeframe: ChartTimeframe
): ChartCandle[] {
  const interval = INTERVAL_MS[timeframe];
  const count = CANDLE_COUNT[timeframe];
  const now = Date.now();
  const candles: ChartCandle[] = [];

  // Start price is lower, following a curve
  const startPrice = currentPrice * 0.15;

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    
    // Base trend follows a smooth curve (like x^1.5)
    const theoreticalPrice = startPrice + (currentPrice - startPrice) * Math.pow(t, 1.5);
    
    // Add small random noise around theoretical price to make it look realistic but smooth
    const noise = (Math.random() - 0.5) * currentPrice * 0.03 * (0.2 + t * 0.8);
    const close = Math.max(theoreticalPrice + noise, 0);
    
    const open = i === 0 ? startPrice : candles[i - 1].close;
    const high = Math.max(open, close) + Math.random() * currentPrice * 0.01;
    const low = Math.min(open, close) - Math.random() * currentPrice * 0.01;
    
    // Random volume
    const volume = Math.random() * 1000000;

    candles.push({
      time: Math.floor((now - (count - i) * interval) / 1000) as unknown as number,
      open,
      high,
      low,
      close: i === count - 1 ? currentPrice : close, // snap last point to exact price
      volume,
    });
  }

  return candles;
}

export function generateBondingCurveData(
  currentPrice: number,
  _progressPercent: number,
  timeframe: ChartTimeframe
): { time: number; value: number }[] {
  const interval = INTERVAL_MS[timeframe];
  const count = CANDLE_COUNT[timeframe];
  const now = Date.now();
  const lines: { time: number; value: number }[] = [];

  const startPrice = 0;
  const endPrice = currentPrice;

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const price = startPrice + (endPrice - startPrice) * Math.pow(t, 1.5);

    lines.push({
      time: Math.floor((now - (count - i) * interval) / 1000) as unknown as number,
      value: Math.max(price, 0),
    });
  }

  return lines;
}
