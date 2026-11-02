"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { ShieldAlert, FileText, CheckCircle, ArrowLeft } from "lucide-react";

const SLUG_MAP: Record<string, string> = {
  terms: "terms",
  privacy: "privacy",
  risk: "risk_disclosure",
  disclaimer: "disclaimer"
};

export default function LegalDocPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "terms";
  const docKey = SLUG_MAP[rawSlug] || rawSlug;

  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(false);
      try {
        const data = await api.getLegalDoc(docKey);
        setDoc(data);
      } catch (err) {
        console.error("Failed to load legal document:", err);
      }
    };
    fetchDoc();
  }, [docKey]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-emerald-400 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Terminal
        </Link>

        {/* Tab links */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 mb-8">
          {[
            { slug: "terms", label: "Terms of Service" },
            { slug: "privacy", label: "Privacy Policy" },
            { slug: "risk", label: "Risk Disclosure" },
            { slug: "disclaimer", label: "Regulatory Safe Harbor" }
          ].map((tab) => (
            <Link
              key={tab.slug}
              href={`/legal/${tab.slug}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                rawSlug === tab.slug
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Document Content */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur">
          <div className="flex items-start gap-4 border-b border-slate-800 pb-6 mb-6">
            <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldAlert className="w-8 h-8" />
            </span>
            <div>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {doc?.status || "Mandatory Regulatory Disclosure"}
              </span>
              <h1 className="text-2xl font-bold text-white mt-2">
                {doc?.title || "Legal & Regulatory Disclosures"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Last updated: {doc?.last_updated || "October 2026"} • SEBI (Research Analysts) & US FINRA Compliance Context
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
            <p className="text-base text-slate-200 font-medium">
              {doc?.content || (
                "FinPilot AI is an educational technology and financial quantitative intelligence application. " +
                "All trades, analytics, and signals generated are strictly simulated and for informational purposes only."
              )}
            </p>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-2">
              <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                Statutory Regulatory Notice
              </h4>
              <p>
                1. <strong>No Investment Advice:</strong> FinPilot AI is not registered as an investment adviser with SEBI or the SEC. 
                None of the content, quantitative indicators, trade plans, or AI chat responses constitutes personalized investment recommendations.
              </p>
              <p>
                2. <strong>Paper Trading Simulation:</strong> All order routing, trade matching, and position sizing is conducted exclusively in simulated paper mode. 
                Slippage (0.05%) and exchange turnover fees are modeled for analytical realism, but real financial capital is never placed at risk through this software.
              </p>
              <p>
                3. <strong>Model Limitations:</strong> Market calculations (such as RSI, MACD, Value at Risk, and Sharpe Ratios) are backward-looking statistical analyses. 
                Past algorithmic performance does not predict or guarantee future market returns.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
