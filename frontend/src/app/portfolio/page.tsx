"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  TrendingUp, 
  PieChart, 
  ShieldAlert, 
  Grid, 
  RefreshCw, 
  Layers, 
  ArrowUpRight 
} from "lucide-react";
import { api, formatCurrency, formatPct } from "@/lib/api";

export default function PortfolioPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await api.getPortfolioSummary();
      setData(res);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <span>Portfolio Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Asset allocation, sector concentration analysis, equity curve history, and correlation matrix
          </p>
        </div>

        <button
          onClick={loadSummary}
          className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Portfolio"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Top Portfolio Metric Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-[#080B12] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Total Portfolio Equity</span>
            <span className="text-xl font-bold text-white block">
              {formatCurrency(data.total_equity, data.currency)}
            </span>
            <span className="text-[10px] text-slate-500">
              Cash: {formatCurrency(data.cash_balance, data.currency)}
            </span>
          </div>

          <div className="bg-[#080B12] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Unrealized P&L</span>
            <span className={`text-xl font-bold block ${data.total_unrealized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {data.total_unrealized_pnl >= 0 ? "+" : ""}{formatCurrency(data.total_unrealized_pnl, data.currency)}
            </span>
            <span className="text-[10px] text-slate-500">
              Open Positions
            </span>
          </div>

          <div className="bg-[#080B12] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Realized P&L</span>
            <span className={`text-xl font-bold block ${data.total_realized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {data.total_realized_pnl >= 0 ? "+" : ""}{formatCurrency(data.total_realized_pnl, data.currency)}
            </span>
            <span className="text-[10px] text-slate-500">
              Locked Gains/Losses
            </span>
          </div>

          <div className="bg-[#080B12] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Diversification Score</span>
            <span className="text-base font-bold text-cyan-300 block">
              HHI: {data.concentration_hhi}
            </span>
            <span className="text-[10px] text-slate-400">
              {data.diversification_score}
            </span>
          </div>
        </div>
      )}

      {/* Allocations Grid: Asset Class vs Sector */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Asset Allocation */}
          <div className="bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="font-bold text-slate-200">Asset Class Allocation</span>
              <span className="text-[10px] text-slate-400">Macro Allocation</span>
            </div>

            <div className="space-y-3">
              {data.asset_allocations.map((a: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{a.asset_class}</span>
                    <span className="text-white font-bold">{a.percentage.toFixed(1)}% ({formatCurrency(a.value, data.currency)})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      style={{ width: `${Math.min(100, a.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Allocation */}
          <div className="bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="font-bold text-slate-200">Sector Exposure Breakdown</span>
              <span className="text-[10px] text-slate-400">Concentration Risk</span>
            </div>

            <div className="space-y-3">
              {data.sector_allocations.map((s: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{s.sector}</span>
                    <span className="text-white font-bold">{s.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.percentage > 30 ? "bg-rose-500" : s.percentage > 20 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(100, s.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pairwise Correlation Heatmap Matrix */}
      {data?.correlation_matrix && data.correlation_matrix.symbols && data.correlation_matrix.symbols.length > 0 && (
        <div className="bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div>
              <span className="font-bold text-slate-200 block">Pairwise Asset Correlation Heatmap</span>
              <span className="text-[11px] text-slate-400">Calculated with historical daily return series via Pandas</span>
            </div>
            <span className="text-[10px] text-slate-500">Values range from -1.0 to +1.0</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-slate-400 text-[10px]">Symbol</th>
                  {data.correlation_matrix.symbols.map((sym: string) => (
                    <th key={sym} className="py-2 px-3 text-slate-300 font-bold text-xs">{sym}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {data.correlation_matrix.matrix.map((row: number[], rIdx: number) => {
                  const rowSym = data.correlation_matrix.symbols[rIdx];
                  return (
                    <tr key={rIdx}>
                      <td className="py-2.5 px-3 text-left font-bold text-white">{rowSym}</td>
                      {row.map((val: number, cIdx: number) => {
                        const isSelf = rIdx === cIdx;
                        const isHigh = val > 0.7 && !isSelf;
                        const isNeg = val < 0;
                        return (
                          <td
                            key={cIdx}
                            className={`py-2.5 px-3 font-semibold ${
                              isSelf
                                ? "bg-slate-850 text-slate-400"
                                : isHigh
                                ? "bg-rose-500/10 text-rose-300"
                                : isNeg
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "text-slate-300"
                            }`}
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
