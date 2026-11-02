import Link from "next/link";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#080B12] border-t border-slate-800 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand & Mission */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-base text-white">FinPilot<span className="text-blue-400">.AI</span></span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Institutional-grade market intelligence, quantitative analytics, and paper trading simulation. 
            "Understand the trade before you make it."
          </p>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Deterministic Analytics Engine</span>
          </div>
        </div>

        {/* Modules */}
        <div>
          <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Workstations</h4>
          <ul className="space-y-2">
            <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Terminal Dashboard</Link></li>
            <li><Link href="/markets" className="hover:text-blue-400 transition-colors">Multi-Market Screener</Link></li>
            <li><Link href="/assistant" className="hover:text-blue-400 transition-colors">AI Market Copilot</Link></li>
            <li><Link href="/research" className="hover:text-blue-400 transition-colors">AI Equity Research</Link></li>
            <li><Link href="/trade-planner" className="hover:text-blue-400 transition-colors">Trade Risk Planner</Link></li>
          </ul>
        </div>

        {/* Paper Trading & Risk */}
        <div>
          <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Risk & Simulation</h4>
          <ul className="space-y-2">
            <li><Link href="/paper-trading" className="hover:text-blue-400 transition-colors">Paper Trading Desk</Link></li>
            <li><Link href="/portfolio" className="hover:text-blue-400 transition-colors">Portfolio Intelligence</Link></li>
            <li><Link href="/risk" className="hover:text-blue-400 transition-colors">Quantitative Risk Engine</Link></li>
            <li><Link href="/journal" className="hover:text-blue-400 transition-colors">Trading Journal</Link></li>
            <li><Link href="/broker" className="hover:text-blue-400 transition-colors">Broker Lab Architecture</Link></li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div>
          <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Legal & Regulatory</h4>
          <ul className="space-y-2">
            <li><Link href="/legal/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/legal/risk" className="hover:text-blue-400 transition-colors">Risk Disclosure</Link></li>
            <li><Link href="/legal/disclaimer" className="hover:text-blue-400 transition-colors">SEBI / SEC Disclaimer</Link></li>
          </ul>
        </div>
      </div>

      {/* Mandatory Regulatory Warning Banner */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80">
        <div className="flex items-start space-x-2 text-slate-400 text-[10px] leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-500/80 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-400">FINANCIAL & SIMULATION DISCLAIMER: </span>
            FinPilot AI is an educational, research, and simulated paper-trading platform. It is not registered as an investment adviser or research analyst with SEBI, SEC, or FINRA. 
            All numerical models, including technical indicators, position sizing, and Value at Risk (VaR), are deterministic calculations based on historical data. 
            The system does not submit real orders or accept customer funds. Past simulation results do not predict future live performance.
          </div>
        </div>
        <div className="mt-4 text-center text-slate-400 text-[10px] font-mono">
          © 2026 FinPilot AI Technologies Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
