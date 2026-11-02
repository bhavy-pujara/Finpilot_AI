"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { formatPct, formatCurrency } from "@/lib/api";

const TICKER_ITEMS = [
  { symbol: "NIFTY 50", price: 24340.50, change: 0.42, currency: "INR" },
  { symbol: "SENSEX", price: 79942.20, change: 0.38, currency: "INR" },
  { symbol: "S&P 500", price: 5824.10, change: 0.65, currency: "USD" },
  { symbol: "NASDAQ 100", price: 20410.80, change: 0.88, currency: "USD" },
  { symbol: "RELIANCE", price: 2940.50, change: 1.24, currency: "INR" },
  { symbol: "TCS", price: 4120.00, change: -0.45, currency: "INR" },
  { symbol: "AAPL", price: 232.50, change: 0.75, currency: "USD" },
  { symbol: "NVDA", price: 138.80, change: 2.15, currency: "USD" },
  { symbol: "TSLA", price: 258.40, change: -1.30, currency: "USD" },
];

export default function MarketTicker() {
  return (
    <div className="bg-[#080B12] border-b border-slate-850 overflow-x-auto py-1.5 px-4 scrollbar-none">
      <div className="flex items-center space-x-6 min-w-max text-xs font-mono">
        {TICKER_ITEMS.map((item, idx) => {
          const isUp = item.change >= 0;
          return (
            <div key={idx} className="flex items-center space-x-2">
              <span className="font-semibold text-slate-300">{item.symbol}</span>
              <span className="text-slate-200">
                {item.currency === "INR" ? `₹${item.price.toLocaleString()}` : `$${item.price.toFixed(2)}`}
              </span>
              <span className={`inline-flex items-center text-[11px] ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isUp ? `+${item.change.toFixed(2)}%` : `${item.change.toFixed(2)}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
