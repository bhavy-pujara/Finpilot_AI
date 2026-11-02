"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  Compass, 
  FileText, 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { api, formatCurrency, formatPct, formatNumber } from "@/lib/api";
import { InstrumentDetailResponse } from "@/types";
import InteractiveCandleChart from "@/components/charts/InteractiveCandleChart";

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params?.symbol as string)?.toUpperCase() || "RELIANCE";

  const [data, setData] = useState<InstrumentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInstrumentDetail(symbol);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load instrument details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [symbol]);

  if (loading && !data) {
    return (
      <div className="h-64 flex items-center justify-center font-mono text-xs text-slate-400">
        <RefreshCw className="w-4 h-4 mr-2 animate-spin text-blue-500" />
        Loading {symbol} instrument metrics & candles...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono space-y-3">
        <div>Error: {error || "Instrument not found."}</div>
        <Link href="/dashboard" className="inline-flex items-center text-blue-400 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const inst = data.instrument;
  const isUp = inst.change_pct >= 0;
  const metrics = data.metrics;
  const indicators = data.indicators;

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-blue-400 inline-flex items-center mb-1 font-mono">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Market Directory
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold font-mono text-white tracking-tight">{inst.symbol}</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              {inst.exchange_code}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono">
              {inst.currency}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">{inst.name} • {inst.sector || "Equities"}</p>
        </div>

        {/* Price & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right mr-2 font-mono">
            <div className="text-2xl font-bold text-white">
              {formatCurrency(inst.current_price, inst.currency)}
            </div>
            <div className={`text-xs font-medium ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {isUp ? `+${inst.change_pct.toFixed(2)}%` : `${inst.change_pct.toFixed(2)}%`}
            </div>
          </div>

          <Link
            href={`/trade-planner?symbol=${inst.symbol}`}
            className="px-3.5 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-medium flex items-center space-x-1.5 transition-colors shadow"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Plan Trade</span>
          </Link>

          <Link
            href={`/paper-trading?symbol=${inst.symbol}`}
            className="px-3.5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-medium flex items-center space-x-1.5 transition-colors shadow"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Paper Order</span>
          </Link>

          <Link
            href={`/assistant?symbol=${inst.symbol}`}
            className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-mono text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Copilot</span>
          </Link>
        </div>
      </div>

      {/* Fundamental Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
        <div className="bg-[#080B12] p-2.5 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">P/E Ratio</span>
          <span className="text-white font-bold">{metrics?.pe_ratio ? metrics.pe_ratio.toFixed(1) : "-"}</span>
        </div>
        <div className="bg-[#080B12] p-2.5 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">P/B Ratio</span>
          <span className="text-white font-bold">{metrics?.pb_ratio ? metrics.pb_ratio.toFixed(1) : "-"}</span>
        </div>
        <div className="bg-[#080B12] p-2.5 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">ROE</span>
          <span className="text-emerald-400 font-bold">{metrics?.roe ? `${metrics.roe.toFixed(1)}%` : "-"}</span>
        </div>
        <div className="bg-[#080B12] p-2.5 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Debt / Equity</span>
          <span className="text-white font-bold">{metrics?.debt_to_equity ? metrics.debt_to_equity.toFixed(2) : "-"}</span>
        </div>
        <div className="bg-[#080B12] p-2.5 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Dividend Yield</span>
          <span className="text-white font-bold">{metrics?.dividend_yield ? `${metrics.dividend_yield.toFixed(2)}%` : "-"}</span>
        </div>
        <div className="bg-[#080B12] p-2.5 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Beta</span>
          <span className="text-cyan-400 font-bold">{metrics?.beta ? metrics.beta.toFixed(2) : "-"}</span>
        </div>
        <div className="bg-[#080B12] p-2.5 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">52W Low</span>
          <span className="text-slate-300 font-bold">{metrics?.week_52_low ? formatCurrency(metrics.week_52_low, inst.currency) : "-"}</span>
        </div>
        <div className="bg-[#080B12] p-2.5 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">52W High</span>
          <span className="text-slate-300 font-bold">{metrics?.week_52_high ? formatCurrency(metrics.week_52_high, inst.currency) : "-"}</span>
        </div>
      </div>

      {/* Interactive Candlestick Chart */}
      <InteractiveCandleChart
        candles={data.candles}
        symbol={inst.symbol}
        currency={inst.currency}
      />

      {/* Quantitative Indicator Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Technical Oscillators */}
        <div className="bg-[#080B12] rounded-lg border border-slate-800 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <h3 className="font-bold text-slate-200">Quantitative Indicators (Calculated on-the-fly)</h3>
            <span className="text-[10px] text-slate-400">NumPy / Pandas</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-850">
              <span className="text-slate-400">RSI (14 Wilder Smoothing)</span>
              <span className={`font-bold ${indicators.rsi_14 && indicators.rsi_14 > 70 ? "text-amber-400" : indicators.rsi_14 && indicators.rsi_14 < 30 ? "text-emerald-400" : "text-white"}`}>
                {indicators.rsi_14 ?? "-"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-850">
              <span className="text-slate-400">SMA 20 vs EMA 20</span>
              <span className="text-slate-300">
                SMA: {indicators.sma_20 ?? "-"} | EMA: {indicators.ema_20 ?? "-"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-850">
              <span className="text-slate-400">MACD (12, 26, 9)</span>
              <span className="text-slate-300">
                Line: {indicators.macd ?? "-"} | Signal: {indicators.macd_signal ?? "-"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-850">
              <span className="text-slate-400">Bollinger Upper / Lower</span>
              <span className="text-slate-300">
                Upper: {indicators.bollinger_upper ?? "-"} | Lower: {indicators.bollinger_lower ?? "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Verified Financial News & Filings */}
        <div className="bg-[#080B12] rounded-lg border border-slate-800 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <h3 className="font-bold text-slate-200">Verified Market News & Regulatory Filings</h3>
            <span className="text-[10px] text-slate-400">Audited Sources</span>
          </div>

          <div className="divide-y divide-slate-850 space-y-1">
            {data.news.length === 0 ? (
              <div className="text-slate-500 py-3">No recent news available.</div>
            ) : (
              data.news.map((n) => (
                <div key={n.id} className="py-2 space-y-1">
                  <div className="font-semibold text-slate-200 hover:text-blue-400 transition-colors">
                    {n.title}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{n.summary}</p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                    <span>Source: {n.source}</span>
                    <span>{new Date(n.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
