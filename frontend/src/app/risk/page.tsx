"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Sliders, 
  CheckCircle2, 
  RefreshCw, 
  Activity,
  Layers,
  ArrowRight
} from "lucide-react";
import { api, formatCurrency, formatPct } from "@/lib/api";
import { RiskMetrics } from "@/types";

export default function RiskPage() {
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Risk profile config
  const [maxRiskTrade, setMaxRiskTrade] = useState(1.5);
  const [maxSingleStock, setMaxSingleStock] = useState(12.0);
  const [maxSector, setMaxSector] = useState(30.0);
  const [maxDD, setMaxDD] = useState(10.0);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const loadRisk = async () => {
    setLoading(true);
    try {
      const [m, prof] = await Promise.all([
        api.getRiskMetrics(),
        api.getRiskProfile(),
      ]);
      setMetrics(m);
      if (prof) {
        setMaxRiskTrade(prof.max_portfolio_risk_pct);
        setMaxSingleStock(prof.max_single_stock_risk_pct);
        setMaxSector(prof.max_sector_exposure_pct);
        setMaxDD(prof.max_drawdown_limit_pct);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisk();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    try {
      await api.updateRiskProfile({
        max_portfolio_risk_pct: maxRiskTrade,
        max_single_stock_risk_pct: maxSingleStock,
        max_sector_exposure_pct: maxSector,
        max_drawdown_limit_pct: maxDD,
      });
      setSaveSuccess("Risk limits successfully updated and enforced.");
      loadRisk();
    } catch (err: any) {
      alert(err.message || "Failed to update risk profile.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Quantitative Risk Management Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic Value at Risk (VaR), drawdown duration, and portfolio concentration limits
          </p>
        </div>

        <button
          onClick={loadRisk}
          className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
          title="Recalculate Risk Metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Educational Warning Notice */}
      <div className="p-3.5 rounded-lg bg-[#0F172A] border border-slate-800 text-xs font-mono text-slate-300 flex items-start space-x-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Educational Risk Framework: </strong>
          Calculations are computed deterministically using historical series and normal variance-covariance distributions. 
          Use these metrics to maintain capital preservation discipline across your simulated trading desk.
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Risk Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">1-Day VaR (95%)</span>
            <span className="text-lg font-bold text-amber-400 block">
              {metrics.var_95_daily.toFixed(2)}%
            </span>
            <span className="text-[10px] text-slate-500">Parametric Model</span>
          </div>

          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">1-Day VaR (99%)</span>
            <span className="text-lg font-bold text-rose-400 block">
              {metrics.var_99_daily.toFixed(2)}%
            </span>
            <span className="text-[10px] text-slate-500">Tail Risk Bound</span>
          </div>

          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Max Drawdown</span>
            <span className="text-lg font-bold text-rose-400 block">
              {metrics.max_drawdown_pct.toFixed(2)}%
            </span>
            <span className="text-[10px] text-slate-500">
              Duration: {metrics.max_drawdown_duration_days} periods
            </span>
          </div>

          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Annual Volatility</span>
            <span className="text-lg font-bold text-white block">
              {metrics.annualized_volatility.toFixed(2)}%
            </span>
            <span className="text-[10px] text-slate-500">Realized 252-day</span>
          </div>

          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Sharpe Ratio</span>
            <span className="text-lg font-bold text-emerald-400 block">
              {metrics.sharpe_ratio.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500">Sortino: {metrics.sortino_ratio.toFixed(2)}</span>
          </div>

          <div className="bg-[#080B12] p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Beta vs Index</span>
            <span className="text-lg font-bold text-cyan-400 block">
              {metrics.beta_vs_benchmark.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500">vs {metrics.benchmark_symbol}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Active Risk Alerts (Left) vs Config Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
        {/* Left: Active Alerts & Threshold Warnings (7 cols) */}
        <div className="lg:col-span-7 bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <span className="font-bold text-slate-200">Active Risk Threshold Surveillance</span>
            <span className="text-[10px] text-slate-400">Automated Rules Engine</span>
          </div>

          <div className="space-y-3">
            {metrics?.risk_warnings.map((w, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 flex items-start space-x-3 text-slate-300"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{w}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-850 grid grid-cols-2 gap-3 text-slate-400">
            <div>
              <span className="text-[10px] block">Cash Buffer %:</span>
              <span className="text-white font-bold text-sm">{metrics?.current_cash_pct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] block">Largest Single Holding:</span>
              <span className="text-white font-bold text-sm">
                {metrics?.single_stock_max_exposure_symbol} ({metrics?.single_stock_max_exposure_pct.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Risk Configuration Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <span className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Risk Limits Configuration</span>
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <label>Max Risk Per Trade (%)</label>
                <span className="text-white font-bold">{maxRiskTrade}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.25"
                value={maxRiskTrade}
                onChange={(e) => setMaxRiskTrade(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <label>Max Single Stock Exposure (%)</label>
                <span className="text-white font-bold">{maxSingleStock}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={maxSingleStock}
                onChange={(e) => setMaxSingleStock(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <label>Max Sector Concentration (%)</label>
                <span className="text-white font-bold">{maxSector}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={maxSector}
                onChange={(e) => setMaxSector(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <label>Max Drawdown Alert Limit (%)</label>
                <span className="text-white font-bold">{maxDD}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={maxDD}
                onChange={(e) => setMaxDD(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono transition-colors shadow"
            >
              Save Enforced Risk Policy
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
