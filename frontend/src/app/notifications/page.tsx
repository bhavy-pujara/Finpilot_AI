"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { 
  Bell, 
  CheckCheck, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  AlertOctagon,
  Calendar,
  Filter
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "WARNING">("ALL");
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err: any) {
      alert("Failed to mark notification as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err: any) {
      alert("Failed to mark all notifications as read.");
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.is_read;
    if (filter === "WARNING") return n.type === "WARNING" || n.type === "CRITICAL";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Bell className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  Market & Safety Alerts
                  {unreadCount > 0 && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {unreadCount} New
                    </span>
                  )}
                </h1>
                <p className="text-sm text-slate-400">
                  Real-time simulated fills, risk threshold warnings, and daily portfolio summaries.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition"
              >
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                Mark all as read
              </button>
            )}
            <button
              onClick={loadNotifications}
              disabled={loading}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-slate-500 mr-1" />
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${
              filter === "ALL"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${
              filter === "UNREAD"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("WARNING")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${
              filter === "WARNING"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Risk & Critical
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filtered.map((item) => {
            const isWarn = item.type === "WARNING" || item.type === "CRITICAL";
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                  item.is_read
                    ? "bg-slate-900/30 border-slate-800/60 opacity-75"
                    : "bg-slate-900/80 border-slate-700/80 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    item.type === "CRITICAL"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : isWarn
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {item.type === "CRITICAL" ? (
                      <AlertOctagon className="w-5 h-5" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${item.is_read ? "text-slate-300" : "text-white"}`}>
                        {item.title}
                      </h3>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                      <span className="uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/50">
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>

                {!item.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="flex-shrink-0 text-xs text-slate-400 hover:text-emerald-400 px-2 py-1 rounded hover:bg-slate-800 transition"
                    title="Mark as read"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-16 bg-slate-900/30 border border-slate-800/60 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300">No notifications to display</p>
              <p className="text-xs text-slate-500 mt-1">All market risk events and simulation notifications are settled.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
