"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ExternalLink, 
  Calculator,
  RefreshCw
} from "lucide-react";
import { api, formatCurrency } from "@/lib/api";

export default function BrokerPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [quoteBroker, setQuoteBroker] = useState("ZERODHA");
  const [quoteSymbol, setQuoteSymbol] = useState("RELIANCE");
  const [quoteQty, setQuoteQty] = useState(25);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getBrokerConnections();
      setConnections(res);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    handleGetQuote();
  }, []);

  const handleConnect = async (brokerName: string) => {
    setConnectSuccess(null);
    try {
      await api.connectBroker({ broker_name: brokerName });
      setConnectSuccess(`Simulated ${brokerName} connection established and audit log recorded.`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Connection failed.");
    }
  };

  const handleDisconnect = async (brokerName: string) => {
    setConnectSuccess(null);
    try {
      await api.disconnectBroker(brokerName);
      setConnectSuccess(`Disconnected from ${brokerName}.`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Disconnect failed.");
    }
  };

  const handleGetQuote = async () => {
    try {
      const q = await api.getBrokerSimulatedQuote(quoteBroker, quoteSymbol, "BUY", quoteQty);
      setQuoteResult(q);
    } catch {
      // fallback
    }
  };

  const isConnected = (bName: string) => {
    return connections.some((c) => c.broker_name === bName && c.status === "MOCK_CONNECTED");
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Broker Integration Lab & Safety Gates</span>
          </h1>
          <p className="text-slate-400 mt-0.5">
            Architecture for broker connectivity, user consent auditing, and transaction fee breakdown
          </p>
        </div>

        <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] self-start sm:self-auto flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span>LIVE EXECUTION PERMANENTLY DISABLED</span>
        </span>
      </div>

      {/* Safety Notice Box */}
      <div className="p-4 rounded-xl bg-[#080B12] border border-amber-500/30 text-amber-200 space-y-2">
        <div className="font-bold flex items-center space-x-2 text-amber-400">
          <ShieldAlert className="w-4 h-4" />
          <span>Regulatory Compliance Architecture (SEBI / SEC)</span>
        </div>
        <p className="leading-relaxed text-[11px] text-slate-300">
          FinPilot AI provides market analytics and simulated paper orders. To strictly adhere to financial software compliance, 
          all broker adapters (Zerodha Kite Connect, Angel One SmartAPI, Alpaca) operate exclusively in <strong>MOCK/SIMULATED MODE</strong>. 
          Real account credentials are not stored, and orders are never transmitted to exchange order books.
        </p>
      </div>

      {connectSuccess && (
        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{connectSuccess}</span>
        </div>
      )}

      {/* Broker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Zerodha Kite */}
        <div className="bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <span className="font-bold text-white text-sm">Zerodha Kite</span>
            <span className="text-[10px] text-slate-400">NSE / BSE</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Models Kite Connect v3 REST APIs. Provides simulated margin calculations, STT breakdown, and order quotes.
          </p>
          <div className="pt-2 flex items-center justify-between">
            <span className={`text-[11px] ${isConnected("ZERODHA") ? "text-emerald-400" : "text-slate-500"}`}>
              {isConnected("ZERODHA") ? "● Mock Connected" : "○ Disconnected"}
            </span>
            {isConnected("ZERODHA") ? (
              <button
                onClick={() => handleDisconnect("ZERODHA")}
                className="px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnect("ZERODHA")}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
              >
                Simulate OAuth
              </button>
            )}
          </div>
        </div>

        {/* Angel One */}
        <div className="bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <span className="font-bold text-white text-sm">Angel One</span>
            <span className="text-[10px] text-slate-400">SmartAPI</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Models SmartAPI session tokens, instrument quote polling, and simulated intraday square-off rules.
          </p>
          <div className="pt-2 flex items-center justify-between">
            <span className={`text-[11px] ${isConnected("ANGEL_ONE") ? "text-emerald-400" : "text-slate-500"}`}>
              {isConnected("ANGEL_ONE") ? "● Mock Connected" : "○ Disconnected"}
            </span>
            {isConnected("ANGEL_ONE") ? (
              <button
                onClick={() => handleDisconnect("ANGEL_ONE")}
                className="px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnect("ANGEL_ONE")}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
              >
                Simulate OAuth
              </button>
            )}
          </div>
        </div>

        {/* Alpaca Trading */}
        <div className="bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <span className="font-bold text-white text-sm">Alpaca API</span>
            <span className="text-[10px] text-slate-400">US Equities</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Models Alpaca paper trading API for NYSE and NASDAQ instruments, zero-commission equity structures, and FINRA fees.
          </p>
          <div className="pt-2 flex items-center justify-between">
            <span className={`text-[11px] ${isConnected("ALPACA") ? "text-emerald-400" : "text-slate-500"}`}>
              {isConnected("ALPACA") ? "● Mock Connected" : "○ Disconnected"}
            </span>
            {isConnected("ALPACA") ? (
              <button
                onClick={() => handleDisconnect("ALPACA")}
                className="px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnect("ALPACA")}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
              >
                Simulate OAuth
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Order Fee & Tax Calculator */}
      <div className="bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <span className="font-bold text-slate-200 text-sm flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Simulated Brokerage & Statutory Taxes Calculator</span>
          </span>
          <span className="text-[10px] text-slate-500">Estimates STT, GST, SEBI & Brokerage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-slate-400">Select Broker</label>
            <select
              value={quoteBroker}
              onChange={(e) => setQuoteBroker(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-white"
            >
              <option value="ZERODHA">Zerodha (INR)</option>
              <option value="ANGEL_ONE">Angel One (INR)</option>
              <option value="ALPACA">Alpaca (USD)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Symbol</label>
            <input
              type="text"
              value={quoteSymbol}
              onChange={(e) => setQuoteSymbol(e.target.value.toUpperCase())}
              className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-white uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Shares Quantity</label>
            <input
              type="number"
              min={1}
              value={quoteQty}
              onChange={(e) => setQuoteQty(Number(e.target.value))}
              className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1.5 text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGetQuote}
              className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              Calculate Charges
            </button>
          </div>
        </div>

        {quoteResult && (
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
            <div className="font-bold text-white text-xs">
              Fee Estimate for {quoteResult.quantity} shares of {quoteResult.symbol} via {quoteResult.broker}:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block">Brokerage Fee:</span>
                <span className="font-bold text-white">₹{quoteResult.brokerage ?? "0.00"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">STT / Statutory Taxes:</span>
                <span className="font-bold text-white">₹{quoteResult.stt ?? "0.00"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Exchange & GST:</span>
                <span className="font-bold text-white">₹{(quoteResult.gst ?? 0) + (quoteResult.exchange_txn_charge ?? 0)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Total Est. Charges:</span>
                <span className="font-bold text-amber-400">₹{quoteResult.total_charges ?? "0.00"}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
              {quoteResult.simulation_disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
