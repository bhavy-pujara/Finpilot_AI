"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  CheckCircle2, 
  RefreshCw, 
  Trash2, 
  Edit3 
} from "lucide-react";
import { api, formatCurrency, formatPct, formatDate } from "@/lib/api";
import { JournalEntry, JournalAnalytics, Instrument } from "@/types";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [analytics, setAnalytics] = useState<JournalAnalytics | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showForm, setShowForm] = useState(false);
  const [instId, setInstId] = useState(1);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [entryPrice, setEntryPrice] = useState(2940.0);
  const [exitPrice, setExitPrice] = useState(3050.0);
  const [quantity, setQuantity] = useState(25);
  const [strategyTag, setStrategyTag] = useState("Breakout");
  const [emotionalState, setEmotionalState] = useState("Disciplined");
  const [rationale, setRationale] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [rating, setRating] = useState(5);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eList, aData, iList] = await Promise.all([
        api.getJournalEntries(),
        api.getJournalAnalytics(),
        api.getInstruments(),
      ]);
      setEntries(eList);
      setAnalytics(aData);
      setInstruments(iList);
      if (iList.length > 0) setInstId(iList[0].id);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createJournalEntry({
        instrument_id: instId,
        trade_type: "PAPER",
        side,
        entry_date: new Date().toISOString(),
        exit_date: new Date().toISOString(),
        entry_price: entryPrice,
        exit_price: exitPrice,
        quantity,
        strategy_tag: strategyTag,
        emotional_state: emotionalState,
        rationale: rationale || "Followed trading plan setup with strictly defined stop loss.",
        mistakes,
        lessons_learned: lessonsLearned,
        rating,
      });
      setShowForm(false);
      setRationale("");
      setMistakes("");
      setLessonsLearned("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save journal entry.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return;
    try {
      await api.deleteJournalEntry(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Trading Journal & Psychology Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log execution discipline, track mistake patterns, and measure mathematical expectancy
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-medium flex items-center space-x-1.5 transition-colors shadow self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Completed Trade</span>
        </button>
      </div>

      {/* Analytics Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Win Rate</span>
            <span className="text-xl font-bold text-emerald-400 block">
              {analytics.win_rate_pct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500">
              {analytics.winning_trades}W / {analytics.losing_trades}L ({analytics.total_trades} total)
            </span>
          </div>

          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Profit Factor</span>
            <span className="text-xl font-bold text-white block">
              {analytics.profit_factor.toFixed(2)}x
            </span>
            <span className="text-[10px] text-slate-500">Gross Wins / Gross Losses</span>
          </div>

          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Average Win</span>
            <span className="text-lg font-bold text-emerald-400 block">
              +₹{analytics.average_win.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Per winning trade</span>
          </div>

          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Average Loss</span>
            <span className="text-lg font-bold text-rose-400 block">
              -₹{analytics.average_loss.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Per losing trade</span>
          </div>

          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Expectancy</span>
            <span className={`text-lg font-bold block ${analytics.expectancy >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {analytics.expectancy >= 0 ? "+" : ""}₹{analytics.expectancy.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Expected return / trade</span>
          </div>
        </div>
      )}

      {/* Log Trade Form (Collapsible) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#080B12] rounded-xl border border-blue-500/30 p-5 space-y-4 font-mono text-xs">
          <div className="font-bold text-slate-200 border-b border-slate-850 pb-2 flex items-center justify-between">
            <span>Log Trade Execution & Reflection</span>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400">Instrument</label>
              <select
                value={instId}
                onChange={(e) => setInstId(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-white"
              >
                {instruments.map((i) => (
                  <option key={i.id} value={i.id}>{i.symbol} ({i.exchange_code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Side</label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-white"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Entry Price</label>
              <input
                type="number"
                step="0.05"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Exit Price</label>
              <input
                type="number"
                step="0.05"
                value={exitPrice}
                onChange={(e) => setExitPrice(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400">Strategy Setup Tag</label>
              <select
                value={strategyTag}
                onChange={(e) => setStrategyTag(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-white"
              >
                <option value="Breakout">Breakout</option>
                <option value="Trend Following">Trend Following</option>
                <option value="Support Bounce">Support Bounce</option>
                <option value="Mean Reversion">Mean Reversion</option>
                <option value="Earnings Play">Earnings Play</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Emotional State</label>
              <select
                value={emotionalState}
                onChange={(e) => setEmotionalState(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-white"
              >
                <option value="Disciplined">Disciplined</option>
                <option value="FOMO">FOMO</option>
                <option value="Anxious">Anxious</option>
                <option value="Greedy">Greedy</option>
                <option value="Revenge Trading">Revenge Trading</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Execution Rating (1 to 5 Stars)</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-white"
              >
                <option value="5">★★★★★ (Flawless Discipline)</option>
                <option value="4">★★★★☆ (Solid Execution)</option>
                <option value="3">★★★☆☆ (Minor Deviations)</option>
                <option value="2">★★☆☆☆ (Rule Violation)</option>
                <option value="1">★☆☆☆☆ (Impulsive / Unplanned)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400">Trade Rationale</label>
              <textarea
                rows={2}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Why did you take this setup?"
                className="w-full bg-[#0F172A] border border-slate-800 rounded p-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-rose-400">Mistakes Made (If Any)</label>
              <textarea
                rows={2}
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
                placeholder="Moved stop loss, entered late, oversized..."
                className="w-full bg-[#0F172A] border border-slate-800 rounded p-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-emerald-400">Lessons Learned</label>
              <textarea
                rows={2}
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
                placeholder="Key takeaways to reinforce..."
                className="w-full bg-[#0F172A] border border-slate-800 rounded p-2 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow transition-colors"
          >
            Save Journal Log
          </button>
        </form>
      )}

      {/* Journal Entries Feed */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-850">
          <span className="font-bold text-slate-200">Historical Journal Logs ({entries.length})</span>
        </div>

        {entries.length === 0 ? (
          <div className="bg-[#080B12] rounded-xl border border-slate-800 p-8 text-center text-slate-500">
            No journal entries yet. Log a completed trade to track execution discipline.
          </div>
        ) : (
          entries.map((entry) => {
            const isProfit = entry.realized_pnl >= 0;
            return (
              <div
                key={entry.id}
                className="bg-[#080B12] rounded-xl border border-slate-800 p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-white text-sm">{entry.symbol}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${entry.side === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {entry.side}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {entry.strategy_tag}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px]">
                      Psychology: {entry.emotional_state}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-0.5 text-amber-400">
                      {Array.from({ length: entry.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>

                    <div className="text-right">
                      <span className={`font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isProfit ? "+" : ""}₹{entry.realized_pnl.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300 text-[11px] leading-relaxed">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Execution Rationale:</span>
                    <span>{entry.rationale}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-400 block font-semibold">Mistakes & Slippage:</span>
                    <span>{entry.mistakes || "None noted. Followed plan rules."}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block font-semibold">Key Lessons:</span>
                    <span>{entry.lessons_learned || "Reiterated adherence to risk tolerance."}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-850">
                  <span>Entry: {entry.entry_price} | Exit: {entry.exit_price ?? "-"} | Qty: {entry.quantity}</span>
                  <span>Logged: {formatDate(entry.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
