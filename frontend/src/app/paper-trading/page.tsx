"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Compass, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X,
  History,
  Briefcase
} from "lucide-react";
import { api, formatCurrency, formatPct, formatDate } from "@/lib/api";
import { PaperAccount, PaperPosition, PaperOrder, PaperTransaction, Instrument } from "@/types";

function PaperTradingContent() {
  const searchParams = useSearchParams();
  const symbolParam = searchParams.get("symbol");

  const [currency, setCurrency] = useState("INR");
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [orders, setOrders] = useState<PaperOrder[]>([]);
  const [transactions, setTransactions] = useState<PaperTransaction[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);

  // Order Ticket State
  const [selectedInstId, setSelectedInstId] = useState<number>(1);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "STOP_MARKET">("MARKET");
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(0);
  const [triggerPrice, setTriggerPrice] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [orderMsg, setOrderMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"positions" | "orders" | "transactions">("positions");

  const loadData = async () => {
    try {
      const [acc, pos, ord, tx, instList] = await Promise.all([
        api.getPaperAccount(currency),
        api.getPaperPositions(),
        api.getPaperOrders(),
        api.getPaperTransactions(),
        api.getInstruments(),
      ]);
      setAccount(acc);
      setPositions(pos);
      setOrders(ord);
      setTransactions(tx);
      setInstruments(instList);

      if (instList.length > 0) {
        if (symbolParam) {
          const match = instList.find((i: Instrument) => i.symbol === symbolParam.toUpperCase());
          if (match) {
            setSelectedInstId(match.id);
            setLimitPrice(match.current_price);
            setCurrency(match.currency);
            return;
          }
        }
        setSelectedInstId(instList[0].id);
        setLimitPrice(instList[0].current_price);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadData();
  }, [currency, symbolParam]);

  const currentInst = instruments.find((i) => i.id === selectedInstId);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderMsg(null);
    setSubmitting(true);

    try {
      const res = await api.submitPaperOrder(
        {
          instrument_id: selectedInstId,
          side,
          order_type: orderType,
          quantity,
          price: orderType === "LIMIT" ? limitPrice : undefined,
          trigger_price: orderType === "STOP_MARKET" ? triggerPrice : undefined,
        },
        currency
      );

      if (res.status === "FILLED") {
        setOrderMsg({
          type: "success",
          text: `Simulated ${side} order for ${res.quantity} shares of ${res.symbol} FILLED at ${formatCurrency(res.execution_price, currency)} (fee: ${formatCurrency(res.commission, currency)}).`,
        });
      } else if (res.status === "REJECTED") {
        setOrderMsg({
          type: "error",
          text: `Order Rejected: ${res.rejection_reason || "Check virtual balance or parameters."}`,
        });
      } else {
        setOrderMsg({
          type: "success",
          text: `Simulated order #${res.id} placed with status ${res.status}.`,
        });
      }

      loadData();
    } catch (err: any) {
      setOrderMsg({ type: "error", text: err.message || "Order submission failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await api.cancelPaperOrder(orderId);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to cancel order.");
    }
  };

  const prefillClosePosition = (pos: PaperPosition) => {
    setSelectedInstId(pos.instrument_id);
    setSide("SELL");
    setQuantity(pos.quantity);
    setOrderType("MARKET");
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Disclaimers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold font-mono text-white flex items-center space-x-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Paper Trading Workstation</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              PAPER TRADING ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full order matching simulation with real-world slippage and transaction cost modeling
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400">Trading Ledger:</span>
          <div className="flex items-center bg-[#080B12] p-1 rounded border border-slate-800">
            <button
              onClick={() => setCurrency("INR")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                currency === "INR" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                currency === "USD" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>

      {/* Account Performance Overview */}
      {account && (
        <div className="bg-[#080B12] rounded-xl border border-slate-800 p-5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Account ID:</span>
              <span className="text-slate-200 font-bold">{account.account_number}</span>
            </div>
            <button
              onClick={loadData}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              title="Refresh Ledger"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Total Portfolio Equity</span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(account.total_equity, account.currency)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Available Cash</span>
              <span className="text-lg font-bold text-slate-300">
                {formatCurrency(account.cash_balance, account.currency)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Invested Capital</span>
              <span className="text-lg font-bold text-slate-300">
                {formatCurrency(account.invested_value, account.currency)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Unrealized P&L</span>
              <span className={`text-lg font-bold ${account.unrealized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {account.unrealized_pnl >= 0 ? "+" : ""}
                {formatCurrency(account.unrealized_pnl, account.currency)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Realized P&L (Total)</span>
              <span className={`text-lg font-bold ${account.realized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {account.realized_pnl >= 0 ? "+" : ""}
                {formatCurrency(account.realized_pnl, account.currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Trading Desk: Order Ticket (Left) & Ledger Tabs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulated Order Ticket Form (4 cols) */}
        <div className="lg:col-span-4 bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <span className="font-bold text-slate-200">Simulated Order Ticket</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {currentInst?.exchange_code || "NSE"}
            </span>
          </div>

          {orderMsg && (
            <div className={`p-3 rounded text-xs flex items-start space-x-2 ${
              orderMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}>
              {orderMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <span>{orderMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleOrderSubmit} className="space-y-4">
            {/* Instrument Dropdown */}
            <div className="space-y-1">
              <label className="text-slate-400">Instrument</label>
              <select
                value={selectedInstId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedInstId(id);
                  const inst = instruments.find((i) => i.id === id);
                  if (inst) setLimitPrice(inst.current_price);
                }}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                {instruments.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.symbol} - {formatCurrency(i.current_price, i.currency)} ({i.exchange_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Side Toggle: BUY vs SELL */}
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
                SELL (Short / Close)
              </button>
            </div>

            {/* Order Type */}
            <div className="space-y-1">
              <label className="text-slate-400">Order Execution Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="MARKET">Market (Instant Fill + 0.05% Slippage)</option>
                <option value="LIMIT">Limit (Price Guaranteed)</option>
                <option value="STOP_MARKET">Stop Loss (Trigger Activated)</option>
              </select>
            </div>

            {/* Limit / Trigger Prices */}
            {orderType === "LIMIT" && (
              <div className="space-y-1">
                <label className="text-slate-400">Limit Price</label>
                <input
                  type="number"
                  step="0.05"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {orderType === "STOP_MARKET" && (
              <div className="space-y-1">
                <label className="text-slate-400">Trigger Stop Price</label>
                <input
                  type="number"
                  step="0.05"
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <label>Quantity</label>
                <div className="flex space-x-1">
                  {[10, 25, 50, 100].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px]"
                    >
                      +{q}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Estimated Order Summary */}
            <div className="p-3 rounded bg-[#0F172A] border border-slate-800 space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Est. Order Value:</span>
                <span className="text-white font-bold">
                  {currentInst ? formatCurrency(currentInst.current_price * quantity, currency) : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Est. Slippage:</span>
                <span className="text-slate-300">~0.05% (Realistic model)</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Commission & STT:</span>
                <span className="text-slate-300">
                  {currency === "INR" ? "₹20.00" : "$1.00"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2.5 rounded font-mono font-bold transition-all shadow ${
                side === "BUY"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-rose-600 hover:bg-rose-500 text-white"
              }`}
            >
              {submitting ? "Matching Order..." : `Submit Paper ${side} Order`}
            </button>
          </form>
        </div>

        {/* Right Column: Positions & Orders Ledger (8 cols) */}
        <div className="lg:col-span-8 bg-[#080B12] rounded-xl border border-slate-800 p-5 space-y-4 font-mono text-xs">
          {/* Tab Navigation */}
          <div className="flex items-center space-x-2 border-b border-slate-850 pb-3">
            <button
              onClick={() => setActiveTab("positions")}
              className={`px-3 py-1.5 rounded transition-colors flex items-center space-x-1.5 ${
                activeTab === "positions" ? "bg-slate-800 text-cyan-400 font-bold border border-cyan-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Open Positions ({positions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1.5 rounded transition-colors flex items-center space-x-1.5 ${
                activeTab === "orders" ? "bg-slate-800 text-cyan-400 font-bold border border-cyan-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Order Book ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-3 py-1.5 rounded transition-colors flex items-center space-x-1.5 ${
                activeTab === "transactions" ? "bg-slate-800 text-cyan-400 font-bold border border-cyan-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Transactions ({transactions.length})</span>
            </button>
          </div>

          {/* Tab 1: Open Positions */}
          {activeTab === "positions" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0F172A] border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Avg Entry</th>
                    <th className="py-2.5 px-3 text-right">Last Price</th>
                    <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {positions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No active paper positions. Place a simulated order to build your portfolio.
                      </td>
                    </tr>
                  ) : (
                    positions.map((pos) => {
                      const isProfit = pos.unrealized_pnl >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-white">
                            <Link href={`/markets/${pos.symbol}`} className="hover:text-blue-400">
                              {pos.symbol}
                            </Link>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">
                              {pos.side}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-200">{pos.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400">
                            {formatCurrency(pos.average_entry_price, pos.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-white font-semibold">
                            {formatCurrency(pos.current_price, pos.currency)}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                            {isProfit ? "+" : ""}{formatCurrency(pos.unrealized_pnl, pos.currency)} ({isProfit ? "+" : ""}{pos.unrealized_pnl_pct.toFixed(2)}%)
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => prefillClosePosition(pos)}
                              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] transition-colors"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Orders History */}
          {activeTab === "orders" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0F172A] border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Fill Price</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-900/60">
                        <td className="py-2.5 px-3 text-slate-400">#{o.id}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{o.symbol}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1 rounded text-[10px] ${o.side === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>
                            {o.side}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{o.order_type}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-200">{o.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {o.execution_price ? o.execution_price.toFixed(2) : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            o.status === "FILLED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : o.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 text-[10px]">
                          {formatDate(o.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Transactions Ledger */}
          {activeTab === "transactions" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0F172A] border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Fee</th>
                    <th className="py-2.5 px-3 text-right">Realized P&L</th>
                    <th className="py-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No transactions recorded.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/60">
                        <td className="py-2.5 px-3 text-slate-400">#{tx.id}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{tx.symbol}</td>
                        <td className="py-2.5 px-3 text-slate-300">{tx.side}</td>
                        <td className="py-2.5 px-3 text-right text-slate-200">{tx.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-white">{tx.price.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{(tx.fee ?? tx.fee_amount ?? 0).toFixed(2)}</td>
                        <td className={`py-2.5 px-3 text-right font-bold ${(tx.realized_pnl ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {(tx.realized_pnl ?? 0) >= 0 ? "+" : ""}{(tx.realized_pnl ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 text-[10px]">
                          {formatDate(tx.timestamp)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaperTradingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading paper trading desk...</div>}>
      <PaperTradingContent />
    </Suspense>
  );
}
