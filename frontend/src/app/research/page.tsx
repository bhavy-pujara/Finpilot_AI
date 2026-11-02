"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  SlidersHorizontal
} from "lucide-react";
import { api, formatCurrency } from "@/lib/api";
import { ResearchReport, Instrument } from "@/types";

export default function ResearchPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<number | null>(null);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getInstruments().then((res) => {
      setInstruments(res);
      if (res.length > 0) {
        setSelectedInstId(res[0].id);
        // Load latest report for first instrument
        loadLatestReport(res[0].id);
      }
    }).catch(() => {});
  }, []);

  const loadLatestReport = async (instId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getLatestResearchReport(instId);
      setReport(res);
    } catch {
      // no existing report yet
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedInstId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateResearchReport(selectedInstId);
      setReport(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate research report.");
    } finally {
      setLoading(false);
    }
  };

  const currentInst = instruments.find((i) => i.id === selectedInstId);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>AI Equity Research Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional research reports grounded in verified financial filings and deterministic metrics
          </p>
        </div>

        {/* Instrument Selector & Generate CTA */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedInstId || ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedInstId(id);
              loadLatestReport(id);
            }}
            className="bg-[#080B12] border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
          >
            {instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.symbol} - {i.name} ({i.exchange_code})
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-mono text-xs font-medium flex items-center space-x-1.5 transition-colors shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{loading ? "Synthesizing Report..." : "Generate AI Report"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      {loading && !report && (
        <div className="h-64 flex flex-col items-center justify-center font-mono text-xs text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span>Processing regulatory filings, audited ratios & building thesis...</span>
        </div>
      )}

      {/* Render Full Research Report */}
      {report && (
        <div className="bg-[#080B12] rounded-xl border border-slate-800 p-6 sm:p-8 space-y-8 font-mono text-xs">
          {/* Report Title & Metadata Header */}
          <div className="space-y-2 border-b border-slate-800 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                Institutional Equity Research Note • {new Date(report.generated_at).toLocaleDateString()}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {report.data_freshness_label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {report.title}
            </h2>
            <div className="flex items-center space-x-4 text-slate-400 text-[11px] pt-1">
              <span>Coverage: <strong className="text-slate-200">{report.name} ({report.symbol})</strong></span>
              <span>Primary Sector: <strong className="text-slate-200">{currentInst?.sector || "Equities"}</strong></span>
            </div>
          </div>

          {/* Section 1 & 2: Company Overview & Business Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-[#0F172A] p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <span>1. Corporate Overview & Operating History</span>
              </h3>
              <p className="text-slate-300 leading-relaxed text-[11px] whitespace-pre-wrap">
                {report.company_overview}
              </p>
            </div>

            <div className="space-y-2 bg-[#0F172A] p-4 rounded-lg border border-slate-800">
              <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <span>2. Revenue Model & Economic Moat</span>
              </h3>
              <p className="text-slate-300 leading-relaxed text-[11px] whitespace-pre-wrap">
                {report.business_model}
              </p>
            </div>
          </div>

          {/* Section 3: Financial & Valuation Metrics Snapshot */}
          {report.metrics_snapshot && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-200">3. Audited Financial Metrics Snapshot</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="bg-[#0F172A] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Current Reference Price</span>
                  <span className="text-sm font-bold text-white">
                    {formatCurrency(report.metrics_snapshot.current_price, currentInst?.currency)}
                  </span>
                </div>
                <div className="bg-[#0F172A] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">P/E Multiple</span>
                  <span className="text-sm font-bold text-white">
                    {report.metrics_snapshot.pe_ratio ? `${report.metrics_snapshot.pe_ratio}x` : "-"}
                  </span>
                </div>
                <div className="bg-[#0F172A] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">P/B Multiple</span>
                  <span className="text-sm font-bold text-white">
                    {report.metrics_snapshot.pb_ratio ? `${report.metrics_snapshot.pb_ratio}x` : "-"}
                  </span>
                </div>
                <div className="bg-[#0F172A] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Return on Equity (ROE)</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {report.metrics_snapshot.roe ? `${report.metrics_snapshot.roe}%` : "-"}
                  </span>
                </div>
                <div className="bg-[#0F172A] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Debt / Equity</span>
                  <span className="text-sm font-bold text-white">
                    {report.metrics_snapshot.debt_to_equity ?? "-"}
                  </span>
                </div>
                <div className="bg-[#0F172A] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Beta</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {report.metrics_snapshot.beta ?? "-"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4 & 5: Balanced Bull vs Bear Theses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bullish Drivers */}
            <div className="space-y-3 bg-[#0F172A]/70 p-4 rounded-lg border border-emerald-500/20">
              <h3 className="font-bold text-sm text-emerald-400 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Bull Thesis & Expansion Catalysts</span>
              </h3>
              <ul className="space-y-2">
                {report.bull_thesis.map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-300 leading-relaxed text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bearish Risks */}
            <div className="space-y-3 bg-[#0F172A]/70 p-4 rounded-lg border border-rose-500/20">
              <h3 className="font-bold text-sm text-rose-400 flex items-center space-x-1.5">
                <TrendingDown className="w-4 h-4" />
                <span>Bear Thesis & Multiple Compression</span>
              </h3>
              <ul className="space-y-2">
                {report.bear_thesis.map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-300 leading-relaxed text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 6: Specific Risk Factors */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Specific Structural & Macro Risk Factors</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {report.risk_factors.map((risk, idx) => (
                <div key={idx} className="bg-[#0F172A] p-3 rounded border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-400 block mb-1">Risk Factor #{idx + 1}</span>
                  {risk}
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Sources & Data Freshness Warning */}
          <div className="space-y-2 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="font-bold text-slate-300">Audited Regulatory Sources:</div>
            <div className="flex flex-wrap gap-3">
              {report.sources.map((src, i) => (
                <div key={i} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#0F172A] border border-slate-800 text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>{src.title}</span>
                </div>
              ))}
            </div>
            {report.data_quality_warnings && report.data_quality_warnings.length > 0 && (
              <div className="mt-3 p-3 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] space-y-1">
                <span className="font-bold block">Data Integrity & Compliance Warnings:</span>
                {report.data_quality_warnings.map((w, idx) => (
                  <div key={idx}>• {w}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
