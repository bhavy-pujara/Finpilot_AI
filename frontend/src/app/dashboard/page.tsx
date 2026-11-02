"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  Compass, 
  Bot, 
  SlidersHorizontal, 
  FileText, 
  ShieldCheck, 
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { api, formatCurrency, formatPct, formatNumber } from "@/lib/api";
import { Instrument } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const filteredInstruments = (data?.all_instruments || []).filter((inst: Instrument) =>
    inst.symbol.toLowerCase().includes(search.toLowerCase()) ||
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    (inst.sector && inst.sector.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Workstation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center space-x-2">
            <span>Trading Desk Overview</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              TERMINAL
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time market surveillance, quantitative intelligence & simulated portfolio monitoring
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/paper-trading"
            className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-medium flex items-center space-x-1.5 transition-colors shadow"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Paper Desk</span>
          </Link>
          <Link
            href="/trade-planner"
            className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-medium flex items-center space-x-1.5 transition-colors shadow"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Plan Trade</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Market Indices Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(data?.indian_indices || []).concat(data?.us_indices || []).map((idx: any, i: number) => {
          const isUp = idx.change_pct >= 0;
          return (
            <div key={i} className="bg-[#080B12] rounded-lg border border-slate-800 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                <span>{idx.name}</span>
                <span className="text-[10px] text-slate-400">{idx.status_label}</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-base font-bold font-mono text-white">
                  {idx.currency === "INR" ? `₹${idx.price.toLocaleString()}` : `$${idx.price.toLocaleString()}`}
                </span>
                <span className={`inline-flex items-center font-mono text-xs font-medium ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                  {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isUp ? `+${idx.change_pct.toFixed(2)}%` : `${idx.change_pct.toFixed(2)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated Account Card & Quick Stats */}
      {data?.paper_account && (
        <div className="bg-[#080B12] rounded-lg border border-slate-800 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-xs font-bold font-mono text-white">Simulated Paper Account: {data.paper_account.account_number}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PAPER TRADE
              </span>
            </div>
            <Link href="/paper-trading" className="text-xs font-mono text-blue-400 hover:underline flex items-center space-x-1">
              <span>Open Paper Terminal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 font-mono">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Virtual Equity</span>
              <span className="text-base font-bold text-white">
                {formatCurrency(data.paper_account.total_equity, data.paper_account.currency)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Available Cash</span>
              <span className="text-base font-bold text-slate-300">
                {formatCurrency(data.paper_account.cash_balance, data.paper_account.currency)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Unrealized P&L</span>
              <span className={`text-base font-bold ${data.paper_account.unrealized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {data.paper_account.unrealized_pnl >= 0 ? "+" : ""}
                {formatCurrency(data.paper_account.unrealized_pnl, data.paper_account.currency)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Open Positions</span>
              <span className="text-base font-bold text-cyan-300">
                {data.paper_account.open_positions_count} active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Gainers & Losers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Gainers */}
        <div className="bg-[#080B12] rounded-lg border border-slate-800 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-850">
            <h3 className="text-xs font-bold font-mono text-slate-200 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Top Market Movers (Gainers)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">[DELAYED 15m]</span>
          </div>
          <div className="divide-y divide-slate-850">
            {(data?.top_gainers || []).map((inst: Instrument) => (
              <div key={inst.id} className="py-2.5 flex items-center justify-between font-mono text-xs">
                <div>
                  <Link href={`/markets/${inst.symbol}`} className="font-bold text-slate-200 hover:text-blue-400 transition-colors">
                    {inst.symbol}
                  </Link>
                  <span className="text-[10px] text-slate-400 block">{inst.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold">
                    {formatCurrency(inst.current_price, inst.currency)}
                  </span>
                  <span className="text-emerald-400 text-[11px] block">
                    +{inst.change_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-[#080B12] rounded-lg border border-slate-800 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-850">
            <h3 className="text-xs font-bold font-mono text-slate-200 flex items-center space-x-1.5">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Top Market Movers (Losers)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">[DELAYED 15m]</span>
          </div>
          <div className="divide-y divide-slate-850">
            {(data?.top_losers || []).map((inst: Instrument) => (
              <div key={inst.id} className="py-2.5 flex items-center justify-between font-mono text-xs">
                <div>
                  <Link href={`/markets/${inst.symbol}`} className="font-bold text-slate-200 hover:text-blue-400 transition-colors">
                    {inst.symbol}
                  </Link>
                  <span className="text-[10px] text-slate-400 block">{inst.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold">
                    {formatCurrency(inst.current_price, inst.currency)}
                  </span>
                  <span className="text-rose-400 text-[11px] block">
                    {inst.change_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Stock Screener Table */}
      <div className="bg-[#080B12] rounded-lg border border-slate-800 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold font-mono text-white">Universal Instrument Directory</h3>
            <p className="text-[11px] text-slate-400">Indian (NSE/BSE in ₹) and US (NYSE/NASDAQ in $) Equities</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol or sector..."
              className="w-full bg-[#0F172A] border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0F172A] border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Company Name</th>
                <th className="py-2.5 px-3">Exchange</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">Change</th>
                <th className="py-2.5 px-3 text-right">Day Range</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredInstruments.map((inst: Instrument) => {
                const isUp = inst.change_pct >= 0;
                return (
                  <tr key={inst.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">
                      <Link href={`/markets/${inst.symbol}`} className="hover:text-blue-400 flex items-center space-x-1">
                        <span>{inst.symbol}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-[180px] truncate">
                      {inst.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] border border-slate-700">
                        {inst.exchange_code}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {inst.sector || "General"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-white">
                      {formatCurrency(inst.current_price, inst.currency)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-medium ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                      {isUp ? `+${inst.change_pct.toFixed(2)}%` : `${inst.change_pct.toFixed(2)}%`}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                      {formatCurrency(inst.day_low, inst.currency)} - {formatCurrency(inst.day_high, inst.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/markets/${inst.symbol}`}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400"
                          title="View Chart"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/trade-planner?symbol=${inst.symbol}`}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                          title="Plan Trade"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
