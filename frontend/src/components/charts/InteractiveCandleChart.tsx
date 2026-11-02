"use client";

import React, { useState, useMemo } from "react";
import { MarketDataPoint } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface ChartProps {
  candles: MarketDataPoint[];
  symbol: string;
  currency?: string;
  height?: number;
}

export default function InteractiveCandleChart({
  candles,
  symbol,
  currency = "INR",
  height = 360,
}: ChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  // Take the last 60 candles if available
  const displayCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    return candles.slice(-50);
  }, [candles]);

  const { minPrice, maxPrice, maxVol, smaLine, emaLine } = useMemo(() => {
    if (displayCandles.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVol: 1000, smaLine: [], emaLine: [] };
    }

    let min = Infinity;
    let max = -Infinity;
    let maxV = 0;

    displayCandles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxV) maxV = c.volume;
    });

    const padding = (max - min) * 0.05 || 1;
    min = Math.max(0, min - padding);
    max = max + padding;

    // Calculate 20-period SMA
    const sma: (number | null)[] = [];
    const ema: (number | null)[] = [];
    let prevEma: number | null = null;
    const k = 2 / (20 + 1);

    for (let i = 0; i < displayCandles.length; i++) {
      if (i < 19) {
        sma.push(null);
      } else {
        const slice = displayCandles.slice(i - 19, i + 1);
        const sum = slice.reduce((acc, val) => acc + val.close, 0);
        sma.push(sum / 20);
      }

      // EMA
      const c = displayCandles[i].close;
      if (prevEma === null) {
        prevEma = c;
      } else {
        prevEma = c * k + prevEma * (1 - k);
      }
      ema.push(i >= 9 ? prevEma : null);
    }

    return { minPrice: min, maxPrice: max, maxVol: maxV, smaLine: sma, emaLine: ema };
  }, [displayCandles]);

  if (displayCandles.length === 0) {
    return (
      <div className="h-[360px] flex items-center justify-center bg-[#080B12] rounded-lg border border-slate-800 text-slate-400 font-mono text-xs">
        No OHLCV candle data available for {symbol}.
      </div>
    );
  }

  const activeCandle = hoveredIndex !== null ? displayCandles[hoveredIndex] : displayCandles[displayCandles.length - 1];
  const chartHeight = height - 70; // reserve 70px for volume
  const chartWidth = 800; // SVG coordinate units

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / (maxPrice - minPrice)) * chartHeight;
  };

  const candleWidth = Math.max(3, (chartWidth / displayCandles.length) * 0.65);
  const candleGap = chartWidth / displayCandles.length;

  return (
    <div className="bg-[#080B12] rounded-lg border border-slate-800 p-4 select-none">
      {/* Chart Header & Active Tooltip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-850 text-xs font-mono">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-slate-200">{symbol}</span>
          <span className="text-slate-400 text-[11px]">
            {activeCandle ? new Date(activeCandle.timestamp).toLocaleDateString() : ""}
          </span>
          <div className="flex items-center space-x-2 text-[11px]">
            <span>O: <span className="text-slate-200">{activeCandle?.open.toFixed(2)}</span></span>
            <span>H: <span className="text-slate-200">{activeCandle?.high.toFixed(2)}</span></span>
            <span>L: <span className="text-slate-200">{activeCandle?.low.toFixed(2)}</span></span>
            <span>C: <span className={activeCandle && activeCandle.close >= activeCandle.open ? "text-emerald-400" : "text-rose-400"}>
              {activeCandle?.close.toFixed(2)}
            </span></span>
          </div>
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
              showSMA ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "text-slate-400 border-slate-800"
            }`}
          >
            SMA (20)
          </button>
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
              showEMA ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "text-slate-400 border-slate-800"
            }`}
          >
            EMA (20)
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
              showVolume ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "text-slate-400 border-slate-800"
            }`}
          >
            Vol
          </button>
        </div>
      </div>

      {/* SVG Candlestick Chart */}
      <div className="relative mt-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="w-full h-auto cursor-crosshair overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = chartHeight * pct;
            const price = maxPrice - (maxPrice - minPrice) * pct;
            return (
              <g key={idx}>
                <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3,3" />
                <text x={chartWidth - 5} y={y - 4} fill="#64748B" fontSize="9" textAnchor="end" fontFamily="monospace">
                  {price.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Volume separator */}
          {showVolume && (
            <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#334155" strokeWidth="1" />
          )}

          {/* Volume Bars */}
          {showVolume &&
            displayCandles.map((c, i) => {
              const isUp = c.close >= c.open;
              const x = i * candleGap + candleGap / 2;
              const barH = (c.volume / (maxVol || 1)) * 55;
              const y = height - barH;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - candleWidth / 2}
                  y={y}
                  width={candleWidth}
                  height={barH}
                  fill={isUp ? "#10B981" : "#F43F5E"}
                  opacity="0.35"
                />
              );
            })}

          {/* Candlesticks (Wick + Body) */}
          {displayCandles.map((c, i) => {
            const isUp = c.close >= c.open;
            const x = i * candleGap + candleGap / 2;
            const yOpen = getY(c.open);
            const yClose = getY(c.close);
            const yHigh = getY(c.high);
            const yLow = getY(c.low);
            const bodyY = Math.min(yOpen, yClose);
            const bodyH = Math.max(1.5, Math.abs(yOpen - yClose));
            const color = isUp ? "#10B981" : "#F43F5E";

            return (
              <g
                key={`candle-${i}`}
                onMouseEnter={() => setHoveredIndex(i)}
                className="transition-opacity hover:opacity-80"
              >
                {/* High-Low Wick */}
                <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1" />
                {/* Candle Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyY}
                  width={candleWidth}
                  height={bodyH}
                  fill={color}
                  stroke={color}
                  strokeWidth="0.5"
                />
              </g>
            );
          })}

          {/* SMA 20 Overlay Line */}
          {showSMA && (
            <path
              d={smaLine.reduce((acc, val, i) => {
                if (val === null) return acc;
                const x = i * candleGap + candleGap / 2;
                const y = getY(val);
                return acc === "" ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
              }, "")}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.4"
            />
          )}

          {/* EMA 20 Overlay Line */}
          {showEMA && (
            <path
              d={emaLine.reduce((acc, val, i) => {
                if (val === null) return acc;
                const x = i * candleGap + candleGap / 2;
                const y = getY(val);
                return acc === "" ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
              }, "")}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="1.4"
            />
          )}

          {/* Crosshair Vertical Line */}
          {hoveredIndex !== null && (
            <line
              x1={hoveredIndex * candleGap + candleGap / 2}
              y1={0}
              x2={hoveredIndex * candleGap + candleGap / 2}
              y2={height}
              stroke="#94A3B8"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
