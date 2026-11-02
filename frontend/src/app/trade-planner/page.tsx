"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  SlidersHorizontal, 
  Compass, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle,
  BookmarkPlus,
  RefreshCw
} from "lucide-react";
import { api, formatCurrency, formatPct } from "@/lib/api";
import { Instrument, TradePlanCalculation } from "@/types";

function TradePlannerContent() {
  const searchParams = useSearchParams();
  const symbolParam = searchParams.get("symbol");

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<number>(1);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [entryPrice, setEntryPrice] = useState<number>(2940.0);
  const [targetPrice, setTargetPrice] = useState<number>(3150.0);
  const [stopLoss, setStopLoss] = useState<number>(2835.0);
  const [totalCapital, setTotalCapital] = useState<number>(1000000.0);
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [notes, setNotes] = useState<string>("");

  const [calcResult, setCalcResult] = useState<TradePlanCalculation | null>(null);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.getInstruments().then((list) => {
      setInstruments(list);
      if (list.length > 0) {
        if (symbolParam) {
          const match = list.find((i) => i.symbol === symbolParam.toUpperCase());
          if (match) {
            setSelectedInstId(match.id);
            setEntryPrice(match.current_price);
            setTargetPrice(roundPrice(match.current_price * 1.07));
            setStopLoss(roundPrice(match.current_price * 0.965));
            return;
          }
        }
        setSelectedInstId(list[0].id);
        setEntryPrice(list[0].current_price);
        setTargetPrice(roundPrice(list[0].current_price * 1.07));
        setStopLoss(roundPrice(list[0].current_price * 0.965));
      }
    }).catch(() => {});

    loadSavedPlans();
  }, [symbolParam]);

  const roundPrice = (p: number) => Math.round(p * 100) / 100;

  const loadSavedPlans = async () => {
    try {
      const res = await api.getTradePlans();
      setSavedPlans(res);
    } catch {
      // fallback
    }
  };

  const handleInstrumentChange = (instId: number) => {
    setSelectedInstId(instId);
    const inst = instruments.find((i) => i.id === instId);
    if (inst) {
      setEntryPrice(inst.current_price);
      if (side === "BUY") {
        setTargetPrice(roundPrice(inst.current_price * 1.07));
        setStopLoss(roundPrice(inst.current_price * 0.965));
      } else {
        setTargetPrice(roundPrice(inst.current_price * 0.93));
        setStopLoss(roundPrice(inst.current_price * 1.035));
      }
    }
  };

  const runCalculation = async () => {
    setLoading(true);
    setSaveSuccess(null);
    try {
      const res = await api.calculateTradePlan({
        instrument_id: selectedInstId,
        side,
        entry_price: entryPrice,
        target_price: targetPrice,
        stop_loss: stopLoss,
        total_capital: totalCapital,
        risk_pct: riskPct,
      });
      setCalcResult(res);
    } catch (err: any) {
      alert(err.message || "Failed to calculate trade plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInstId && entryPrice && targetPrice && stopLoss) {
      runCalculation();
    }
  }, [selectedInstId, side, entryPrice, targetPrice, stopLoss, totalCapital, riskPct]);

  const handleSavePlan = async () => {
    try {
      await api.saveTradePlan({
        instrument_id: selectedInstId,
        side,
        entry_price: entryPrice,
        target_price: targetPrice,
        stop_loss: stopLoss,
        total_capital: totalCapital,
        risk_pct: riskPct,
        notes: notes || "Technical breakout trade plan",
      });
      setSaveSuccess("Trade plan saved to your trading registry.");
      loadSavedPlans();
    } catch (err: any) {
      alert(err.message || "Could not save trade plan.");
    }
  };

  const currentInst = instruments.find((i) => i.id === selectedInstId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <span>Deterministic Trade Planner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Model exact position size, risk/reward scenarios, and capital preservation bounds before placing simulated orders
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/paper-trading"
            className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-medium flex items-center space-x-1.5 transition-colors shadow"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Paper Desk</span>
          </Link>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Main Grid: Inputs vs Calculation Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <span className="font-bold text-slate-200">Trade Parameters</span>
            <span className="text-[10px] text-slate-400">Fixed Fractional Risk Model</span>
          </div>

          {/* Instrument Selector */}
          <div className="space-y-1">
            <label className="text-slate-400">Instrument</label>
            <select
              value={selectedInstId}
              onChange={(e) => handleInstrumentChange(Number(e.target.value))}
              className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
            >
              {instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.symbol} ({i.exchange_code}) - {formatCurrency(i.current_price, i.currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Direction Toggle */}
          <div className="space-y-1">
            <label className="text-slate-400">Trade Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide("BUY")}
                className={`py-2 rounded font-bold font-mono transition-colors border ${
                  side === "BUY"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-[#0F172A] text-slate-400 border-slate-800"
                }`}
              >
                BUY (Long)
              </button>
              <button
                type="button"
                onClick={() => setSide("SELL")}
                className={`py-2 rounded font-bold font-mono transition-colors border ${
                  side === "SELL"
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                    : "bg-[#0F172A] text-slate-400 border-slate-800"
                }`}
              >
                SELL (Short)
              </button>
            </div>
          </div>

          {/* Planned Prices */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-slate-400">Entry Price</label>
              <input
                type="number"
                step="0.05"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-400">Target</label>
              <input
                type="number"
                step="0.05"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-2 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-rose-400">Stop Loss</label>
              <input
                type="number"
                step="0.05"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-2 text-rose-400 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Capital & Risk % */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400">Account Capital</label>
              <input
                type="number"
                step="1000"
                value={totalCapital}
                onChange={(e) => setTotalCapital(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Max Risk % (0.5 - 5%)</label>
              <input
                type="number"
                step="0.25"
                max={20}
                min={0.1}
                value={riskPct}
                onChange={(e) => setRiskPct(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-amber-400 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Plan Rationale / Setup Tag</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 50 EMA breakout with volume surge"
              className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSavePlan}
            className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono font-medium transition-colors flex items-center justify-center space-x-2 shadow"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Save Plan to Registry</span>
          </button>
        </div>

        {/* Right Column: Mathematical Analysis & Scenario Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {calcResult && (
            <>
              {/* Primary Output Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-[#080B12] p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Recommended Position</span>
                  <span className="text-lg font-bold text-white block">
                    {calcResult.position_size} shares
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Req: {formatCurrency(calcResult.capital_required, calcResult.currency)}
                  </span>
                </div>

                <div className="bg-[#080B12] p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Risk / Reward</span>
                  <span className={`text-lg font-bold block ${calcResult.risk_reward_ratio >= 2.0 ? "text-emerald-400" : calcResult.risk_reward_ratio >= 1.5 ? "text-amber-400" : "text-rose-400"}`}>
                    {calcResult.risk_reward_ratio}:1
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Dist: -{calcResult.stop_loss_pct}% / +{calcResult.target_pct}%
                  </span>
                </div>

                <div className="bg-[#080B12] p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Max Planned Loss (-1R)</span>
                  <span className="text-lg font-bold text-rose-400 block">
                    -{formatCurrency(calcResult.max_loss, calcResult.currency)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {((calcResult.max_loss / totalCapital) * 100).toFixed(2)}% of equity
                  </span>
                </div>

                <div className="bg-[#080B12] p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Max Planned Reward</span>
                  <span className="text-lg font-bold text-emerald-400 block">
                    +{formatCurrency(calcResult.max_profit, calcResult.currency)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {((calcResult.max_profit / totalCapital) * 100).toFixed(2)}% of equity
                  </span>
                </div>
              </div>

              {/* Scenario Analysis Matrix */}
              <div className="bg-[#080B12] rounded-lg border border-slate-800 p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                  <span className="font-bold text-slate-200">Outcome Scenario Matrix</span>
                  <span className="text-[10px] text-slate-400">Exact Mathematical Distribution</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-[#0F172A] border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <tr>
                        <th className="py-2 px-3">Outcome</th>
                        <th className="py-2 px-3 text-right">Exit Price</th>
                        <th className="py-2 px-3 text-right">P&L Amount</th>
                        <th className="py-2 px-3 text-right">Return %</th>
                        <th className="py-2 px-3 text-right">Account Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {calcResult.scenarios.map((sc, idx) => {
                        const isWin = sc.pnl >= 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-900/60">
                            <td className="py-2 px-3 font-medium text-slate-200">{sc.label}</td>
                            <td className="py-2 px-3 text-right text-slate-300">
                              {formatCurrency(sc.exit_price, calcResult.currency)}
                            </td>
                            <td className={`py-2 px-3 text-right font-bold ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                              {isWin ? "+" : ""}
                              {formatCurrency(sc.pnl, calcResult.currency)}
                            </td>
                            <td className={`py-2 px-3 text-right ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                              {isWin ? "+" : ""}{sc.pnl_pct.toFixed(2)}%
                            </td>
                            <td className={`py-2 px-3 text-right text-slate-400 text-[11px]`}>
                              {isWin ? "+" : ""}{sc.account_impact_pct.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Educational Warnings */}
              {calcResult.educational_notes.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Risk Management Evaluation:</span>
                  </div>
                  {calcResult.educational_notes.map((note, idx) => (
                    <div key={idx} className="text-[11px] pl-5">• {note}</div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Saved Plans History */}
          <div className="bg-[#080B12] rounded-lg border border-slate-800 p-4 space-y-3 font-mono text-xs">
            <span className="font-bold text-slate-200 block pb-2 border-b border-slate-850">
              Saved Trade Plans ({savedPlans.length})
            </span>
            {savedPlans.length === 0 ? (
              <div className="text-slate-500 py-3 text-center">No trade plans saved yet.</div>
            ) : (
              <div className="space-y-2">
                {savedPlans.slice(0, 4).map((p) => (
                  <div key={p.id} className="p-2.5 rounded bg-[#0F172A] border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center space-x-2">
                        <span>{p.symbol}</span>
                        <span className={`text-[10px] px-1 rounded ${p.side === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                          {p.side}
                        </span>
                        <span className="text-[10px] text-slate-400">R:R {p.risk_reward_ratio}:1</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{p.notes || "No notes"}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-200 font-semibold">{p.position_size} shares</span>
                      <span className="text-[10px] text-slate-500 block">Entry: {p.entry_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradePlannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading trade planner...</div>}>
      <TradePlannerContent />
    </Suspense>
  );
}
