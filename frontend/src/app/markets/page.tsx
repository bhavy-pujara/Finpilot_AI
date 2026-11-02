"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, TrendingUp, TrendingDown, SlidersHorizontal, ExternalLink, RefreshCw } from "lucide-react";
import { api, formatCurrency, formatNumber } from "@/lib/api";
import { Instrument } from "@/types";

export default function MarketsPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchangeFilter, setExchangeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const exParam = exchangeFilter === "ALL" ? undefined : exchangeFilter;
      const res = await api.getInstruments(search || undefined, exParam);
      setInstruments(res);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [exchangeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white">Multi-Market Screener</h1>
          <p className="text-xs text-slate-400 mt-0.5">Explore Indian (NSE/BSE in ₹) and US (NYSE/NASDAQ in $) instruments</p>
        </div>

        {/* Exchange Filter Tabs */}
        <div className="flex items-center space-x-1 bg-[#080B12] p-1 rounded-md border border-slate-800 text-xs font-mono">
          {["ALL", "NSE", "BSE", "NASDAQ", "NYSE"].map((tab) => (
            <button
              key={tab}
              onClick={() => setExchangeFilter(tab)}
              className={`px-3 py-1 rounded transition-colors ${
                exchangeFilter === tab ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by symbol, company name, or sector..."
            className="w-full bg-[#080B12] border border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono rounded-md shadow"
        >
          Search
        </button>
      </form>

      {/* Instruments Table */}
      <div className="bg-[#080B12] rounded-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0F172A] border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Exchange</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">Last Price</th>
                <th className="py-3 px-4 text-right">24h Change</th>
                <th className="py-3 px-4 text-right">24h Volume</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-4 h-4 mx-auto mb-2 animate-spin text-blue-500" />
                    Loading market instruments...
                  </td>
                </tr>
              ) : instruments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No instruments found matching your search.
                  </td>
                </tr>
              ) : (
                instruments.map((inst) => {
                  const isUp = inst.change_pct >= 0;
                  return (
                    <tr key={inst.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        <Link href={`/markets/${inst.symbol}`} className="hover:text-blue-400">
                          {inst.symbol}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px]">{inst.name}</td>
                      <td className="py-3 px-4 text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] border border-slate-700">
                          {inst.exchange_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{inst.sector || "General"}</td>
                      <td className="py-3 px-4 text-right font-semibold text-white">
                        {formatCurrency(inst.current_price, inst.currency)}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                        {isUp ? `+${inst.change_pct.toFixed(2)}%` : `${inst.change_pct.toFixed(2)}%`}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {formatNumber(inst.volume_24h)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/markets/${inst.symbol}`}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400"
                            title="Interactive Chart"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/trade-planner?symbol=${inst.symbol}`}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                            title="Trade Planner"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
