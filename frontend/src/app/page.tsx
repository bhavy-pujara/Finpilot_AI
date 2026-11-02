import Link from "next/link";
import { 
  ArrowRight, 
  BarChart3, 
  Bot, 
  Compass, 
  ShieldAlert, 
  SlidersHorizontal, 
  Activity, 
  Layers, 
  CheckCircle2,
  TrendingUp,
  Cpu
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Next-Gen Institutional Trading Copilot</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white font-mono">
          Understand the trade <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
            before you make it.
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          FinPilot AI unites verified multi-market intelligence, deterministic financial calculations, 
          and a transparent paper-trading engine into a single institutional workstation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm font-medium transition-all shadow-lg shadow-blue-600/20"
          >
            Launch Terminal
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            href="/paper-trading"
            className="inline-flex items-center px-5 py-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-sm font-medium transition-all"
          >
            <Compass className="w-4 h-4 mr-2 text-cyan-400" />
            Paper Trading Desk
          </Link>
          <Link
            href="/trade-planner"
            className="inline-flex items-center px-5 py-2.5 rounded-md bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-sm font-medium transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2 text-amber-400" />
            Risk Planner
          </Link>
        </div>

        {/* System Trust & Safety Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Dual Market: NSE/BSE & NYSE/NASDAQ</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Deterministic NumPy & Pandas Math</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Real Capital at Risk (Paper Only)</span>
          </div>
        </div>
      </section>

      {/* Interactive Platform Architecture Overview */}
      <section className="bg-[#080B12] rounded-xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span>Core Application Modules</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Modular full-stack fintech architecture built for scale, transparency and risk discipline.</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              API STATUS: ONLINE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Module 1: Dashboard */}
          <Link href="/dashboard" className="group block bg-[#0F172A] p-5 rounded-lg border border-slate-800 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Live Aggregation</span>
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors font-mono">Terminal Dashboard</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Real-time monitoring of NIFTY 50, SENSEX, S&P 500, top gainers, active watchlists, and portfolio equity.
            </p>
          </Link>

          {/* Module 2: Market Screener */}
          <Link href="/markets" className="group block bg-[#0F172A] p-5 rounded-lg border border-slate-800 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Dual Currency</span>
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors font-mono">Market Screener & OHLCV</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Interactive candlestick charting, SMA/EMA overlays, Wilder RSI (14), and audited financial ratios.
            </p>
          </Link>

          {/* Module 3: AI Copilot */}
          <Link href="/assistant" className="group block bg-[#0F172A] p-5 rounded-lg border border-slate-800 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Grounded RAG</span>
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors font-mono">AI Market Copilot</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Factual, source-cited conversational assistant for ratio explanations, catalyst breakdown, and risk scenarios.
            </p>
          </Link>

          {/* Module 4: Trade Planner */}
          <Link href="/trade-planner" className="group block bg-[#0F172A] p-5 rounded-lg border border-slate-800 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Deterministic</span>
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors font-mono">Trade Risk Planner</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Fixed fractional position sizing calculator, R:R scenario matrices (-1R to +2R), and capital exposure limits.
            </p>
          </Link>

          {/* Module 5: Paper Trading Desk */}
          <Link href="/paper-trading" className="group block bg-[#0F172A] p-5 rounded-lg border border-slate-800 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Simulated Fills</span>
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors font-mono">Paper Trading Desk</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Virtual order tickets (Market, Limit, Stop), realistic slippage models, transaction charges, and realized P&L.
            </p>
          </Link>

          {/* Module 6: Risk Management */}
          <Link href="/risk" className="group block bg-[#0F172A] p-5 rounded-lg border border-slate-800 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Quantitative</span>
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-rose-400 transition-colors font-mono">Risk Management Engine</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Value at Risk (95% & 99% VaR), Maximum Drawdown duration, Sharpe ratio, and Herfindahl-Hirschman (HHI) index.
            </p>
          </Link>
        </div>
      </section>

      {/* Institutional Demo Credentials Quick-Fill Banner */}
      <section className="bg-gradient-to-r from-blue-900/20 via-slate-900 to-indigo-900/20 rounded-xl border border-blue-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <span className="font-mono text-xs font-semibold text-blue-400 uppercase">Ready-to-Test Credentials</span>
          </div>
          <p className="text-sm text-slate-200">
            Trader Demo: <code className="bg-slate-800 px-2 py-0.5 rounded text-blue-300 font-mono text-xs">trader@finpilot.ai</code> / <code className="bg-slate-800 px-2 py-0.5 rounded text-blue-300 font-mono text-xs">Trader123!</code>
          </p>
          <p className="text-xs text-slate-400">
            Admin Demo: <code className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono text-xs">admin@finpilot.ai</code> / <code className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono text-xs">Admin123!</code>
          </p>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-medium transition-colors whitespace-nowrap shadow"
        >
          Instant Demo Sign In
        </Link>
      </section>
    </div>
  );
}
