"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  AreaSeries,
  HistogramSeries,
  LineSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type AreaData,
  type HistogramData,
  type LineData,
  type Time,
} from "lightweight-charts";
import { cn } from "@/utils/cn";
import {
  generateMockChartData,
  generateBondingCurveData,
  type ChartTimeframe,
} from "@/types/chart";

const TIMEFRAMES: ChartTimeframe[] = ["1m", "5m", "1h", "1d"];

interface TokenChartProps {
  currentPrice: number;
  progressPercent: number;
  className?: string;
}

const CHART_COLORS = {
  bg: "transparent",
  grid: "rgba(30, 34, 48, 0.4)",
  text: "#64748B",
  crosshair: "rgba(160, 170, 191, 0.2)",
  line: "#00FF88",
  areaTop: "rgba(0, 255, 136, 0.2)",
  areaBottom: "rgba(0, 255, 136, 0)",
  volumeUp: "#00FF88",
  volumeDown: "#EF4444",
  curveLine: "#64748B",
};

export function TokenChart({ currentPrice, progressPercent, className }: TokenChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const curveSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [timeframe, setTimeframe] = useState<ChartTimeframe>("1h");
  const [showCurve, setShowCurve] = useState(true);

  const initChart = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: CHART_COLORS.bg },
        textColor: CHART_COLORS.text,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: CHART_COLORS.grid, style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: CHART_COLORS.crosshair,
          labelBackgroundColor: "#121318",
        },
        horzLine: {
          color: CHART_COLORS.crosshair,
          labelBackgroundColor: "#121318",
        },
      },
      leftPriceScale: {
        visible: true,
        borderColor: "transparent",
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        borderColor: "transparent",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
        },
      },
      localization: {
        priceFormatter: (price: number) => {
          if (price < 0.001) {
            return price.toExponential(1);
          }
          return price.toString();
        },
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      priceScaleId: "left",
      lineColor: CHART_COLORS.line,
      topColor: CHART_COLORS.areaTop,
      bottomColor: CHART_COLORS.areaBottom,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: "#00FF88",
      crosshairMarkerBackgroundColor: "#00FF88",
    });
    areaSeriesRef.current = areaSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      priceLineVisible: false,
      lastValueVisible: false,
    });
    volumeSeriesRef.current = volumeSeries;

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });
  }, []);

  const updateData = useCallback(() => {
    const areaSeries = areaSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    if (!areaSeries || !volumeSeries) return;

    const candles = generateMockChartData(currentPrice, timeframe);

    const areaData: AreaData[] = candles.map((c) => ({
      time: c.time as Time,
      value: c.close,
    }));

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? CHART_COLORS.volumeUp : CHART_COLORS.volumeDown,
    }));

    areaSeries.setData(areaData);
    volumeSeries.setData(volumeData);
  }, [currentPrice, timeframe]);

  const updateCurve = useCallback(() => {
    const curveSeries = curveSeriesRef.current;
    if (!curveSeries || !showCurve) return;

    const curveData = generateBondingCurveData(currentPrice, progressPercent, timeframe);
    const lineData: LineData[] = curveData.map((d) => ({
      time: d.time as Time,
      value: d.value,
    }));
    curveSeries.setData(lineData);
  }, [currentPrice, progressPercent, timeframe, showCurve]);

  useEffect(() => {
    initChart();

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        chartRef.current.applyOptions({ width, height });
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [initChart]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (showCurve) {
      if (!curveSeriesRef.current) {
        const curveSeries = chart.addSeries(LineSeries, {
          priceScaleId: "left",
          color: CHART_COLORS.curveLine,
          lineWidth: 2,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        curveSeriesRef.current = curveSeries;
      }
      updateCurve();
    } else {
      if (curveSeriesRef.current) {
        chart.removeSeries(curveSeriesRef.current);
        curveSeriesRef.current = null;
      }
    }
  }, [showCurve, updateCurve]);

  return (
    <div className={cn("bg-[#121318] rounded-xl border border-border p-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 bg-[#1A1D24] p-1 rounded-lg border border-border/50">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                timeframe === tf
                  ? "bg-[#252A36] text-content-primary"
                  : "text-content-tertiary hover:text-content-secondary"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-content-secondary cursor-pointer select-none">
          <div
            onClick={() => setShowCurve(!showCurve)}
            className={cn(
              "w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer",
              showCurve ? "bg-accent-primary text-surface-base" : "bg-transparent border border-border text-transparent"
            )}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" className="w-3 h-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          Theoretical curve
        </label>
      </div>
      <div className="relative w-full h-[360px]">
        <div ref={containerRef} className="w-full h-full" />
        <div className="absolute left-0 bottom-[18%] text-[10px] font-mono text-content-tertiary pointer-events-none bg-[#121318] pl-1 pr-2 z-10">
          VOL
        </div>
      </div>
    </div>
  );
}
