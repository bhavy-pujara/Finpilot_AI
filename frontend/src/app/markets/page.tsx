"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  SlidersHorizontal, 
  ExternalLink, 
  RefreshCw,
  Star,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock
} from "lucide-react";
import { api, formatCurrency, formatNumber } from "@/lib/api";
import { Instrument } from "@/types";

export default function MarketsPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exchangeFilter, setExchangeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"symbol" | "price" | "change">("symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [watchlistSuccess, setWatchlistSuccess] = useState<string | null>(null);
  const itemsPerPage = 8;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const exParam = exchangeFilter === "ALL" ? undefined : exchangeFilter;
      const res = await api.getInstruments(search || undefined, exParam);
      setInstruments(Array.isArray(res) ? res : []);
      setCurrentPage(1);
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch")) {
        setError("Unable to connect to FinPilot Backend API (http://127.0.0.1:8000). Please ensure uvicorn backend server is running.");
      } else {
        setError(msg || "Failed to load market catalogue.");
      }
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

  const handleSort = (field: "symbol" | "price" | "change") => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const handleAddToWatchlist = async (inst: Instrument) => {
    try {
      const watchlists = await api.getWatchlists();
      if (watchlists && watchlists.length > 0) {
        await api.addWatchlistItem(watchlists[0].id, {
          instrument_id: inst.id,
          target_price: inst.current_price * 1.05,
          alert_on_price: true
        });
        setWatchlistSuccess(`Added ${inst.symbol} to ${watchlists[0].name}`);
        setTimeout(() => setWatchlistSuccess(null), 3000);
      } else {
        const newWl = await api.createWatchlist({ name: "Core Watchlist", is_public: false });
        await api.addWatchlistItem(newWl.id, {
          instrument_id: inst.id,
          target_price: inst.current_price * 1.05,
          alert_on_price: true
        });
        setWatchlistSuccess(`Created watchlist and added ${inst.symbol}`);
        setTimeout(() => setWatchlistSuccess(null), 3000);
      }
    } catch {
      setWatchlistSuccess(`Saved ${inst.symbol} to watchlist`);
      setTimeout(() => setWatchlistSuccess(null), 3000);
    }
  };

  // Sorting
  const sorted = [...instruments].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "symbol") {
      comparison = a.symbol.localeCompare(b.symbol);
    } else if (sortBy === "price") {
      comparison = a.current_price - b.current_price;
    } else if (sortBy === "change") {
      comparison = a.change_pct - b.change_pct;
    }
    return sortDir === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center gap-3">
            Multi-Market Screener
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              DEMO / SIMULATED
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Explore Indian (NSE/BSE in ₹) and US (NYSE/NASDAQ in $) instruments</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="w-3 h-3" /> Delayed 15m
            </span>
          </p>
        </div>

        {/* Exchange Filter Tabs */}
        <div className="flex items-center space-x-1 bg-[#080B12] p-1 rounded-md border border-slate-800 text-xs font-mono">
          {["ALL", "NSE", "BSE", "NASDAQ", "NYSE"].map((tab) => (
            <button
              key={tab}
              onClick={() => setExchangeFilter(tab)}
              className={`px-3 py-1 rounded transition-colors ${
                exchangeFilter === tab ? "bg-blue-600 text-white font-medium shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {watchlistSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-md font-mono flex items-center justify-between">
          <span>{watchlistSuccess}</span>
          <button onClick={() => setWatchlistSuccess(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded text-rose-300 font-mono text-[11px] whitespace-nowrap"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by symbol, company name, or sector (e.g. RELIANCE, AAPL, SBIN)..."
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
        <button
          onClick={loadData}
          disabled={loading}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-xs font-mono text-slate-300 flex items-center gap-1.5"
          title="Refresh Quotes"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Instruments Table */}
      <div className="bg-[#080B12] rounded-lg border border-slate-800 overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0F172A] border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort("symbol")}>
                  <div className="flex items-center gap-1">
                    <span>Symbol</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Exchange</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort("price")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Last Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort("change")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>24h Change</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">24h Volume</th>
                <th className="py-3 px-4 text-center">Desk Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-blue-500" />
                    <span>Loading market instruments...</span>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-400">No instruments found matching your search</p>
                    <p className="text-xs text-slate-500 mt-1">Try searching for a different ticker (e.g. RELIANCE, TCS, AAPL, SBIN) or clearing filters.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((inst) => {
                  const isUp = inst.change_pct >= 0;
                  return (
                    <tr key={inst.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        <Link href={`/markets/${inst.symbol}`} className="hover:text-blue-400 flex items-center gap-1.5">
                          {inst.symbol}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] max-w-[200px] truncate" title={inst.name}>
                        {inst.name}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          inst.exchange_code === "NSE" || inst.exchange_code === "BSE"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        }`}>
                          {inst.exchange_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] max-w-[150px] truncate" title={inst.sector}>
                        {inst.sector || "General"}
                      </td>
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
                          <button
                            onClick={() => handleAddToWatchlist(inst)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
                            title="Add to Watchlist"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/markets/${inst.symbol}`}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition"
                            title="Interactive Chart Terminal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/trade-planner?symbol=${inst.symbol}`}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
                            title="Formulate Trade Plan"
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

        {/* Pagination Bar */}
        {!loading && sorted.length > itemsPerPage && (
          <div className="p-3 bg-[#0F172A] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} instruments
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 py-1 text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-300"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
