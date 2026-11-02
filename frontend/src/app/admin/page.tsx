"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Cpu, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Search,
  Lock,
  Database,
  Radio
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users");
  const [actionMsg, setActionMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, auditRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminAuditLogs()
      ]);
      setStats(statsRes);
      setUsers(usersRes);
      setAuditLogs(auditRes);
    } catch (err: any) {
      setError(err.message || "Failed to load administrative console. Ensure you are signed in as an Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUser = async (userId: number, email: string) => {
    try {
      const res = await api.toggleUserStatus(userId);
      setActionMsg(res.message || `User ${email} status updated.`);
      const updatedUsers = await api.getAdminUsers();
      setUsers(updatedUsers);
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to toggle user status.");
    }
  };

  const filteredUsers = users.filter((u) => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  System Administration Console
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-red-500/10 text-red-400 border border-red-500/20">
                    SUPERUSER ACCESS
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Global infrastructure observability, audit compliance logging, and user access management.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 font-medium transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            Refresh Telemetry
          </button>
        </div>

        {actionMsg && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {actionMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Access Restriction / Operational Notice</p>
              <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* System Health Card */}
        {stats?.system_health && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Service Health</p>
                <p className="text-lg font-bold text-emerald-400 flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  {stats.system_health.status}
                </p>
              </div>
              <Activity className="w-8 h-8 text-emerald-400/40" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Primary Database</p>
                <p className="text-sm font-semibold text-white mt-1">
                  {stats.system_health.database_type}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connected: {stats.system_health.database_connected ? "YES" : "NO"}
                </p>
              </div>
              <Database className="w-8 h-8 text-indigo-400/40" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">AI Intelligence Engine</p>
                <p className="text-sm font-semibold text-white mt-1">
                  {stats.system_health.active_ai_provider}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fallback Provider: Active
                </p>
              </div>
              <Cpu className="w-8 h-8 text-purple-400/40" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Market Feed Provider</p>
                <p className="text-sm font-semibold text-white mt-1">
                  {stats.system_health.active_market_provider}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uptime: {Math.floor(stats.system_health.uptime_seconds)}s
                </p>
              </div>
              <Radio className="w-8 h-8 text-cyan-400/40" />
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3">
              <p className="text-xs text-slate-400">Total Users</p>
              <p className="text-xl font-bold text-white mt-1">{stats.total_users}</p>
              <span className="text-xs text-emerald-400">{stats.active_users} Active</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3">
              <p className="text-xs text-slate-400">Paper Orders</p>
              <p className="text-xl font-bold text-white mt-1">{stats.total_paper_orders}</p>
              <span className="text-xs text-slate-500">{stats.total_paper_positions} Positions</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3">
              <p className="text-xs text-slate-400">Trade Plans</p>
              <p className="text-xl font-bold text-white mt-1">{stats.total_trade_plans}</p>
              <span className="text-xs text-slate-500">Formulated</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3">
              <p className="text-xs text-slate-400">AI Tokens Consumed</p>
              <p className="text-xl font-bold text-cyan-400 mt-1">{stats.total_ai_tokens_consumed.toLocaleString()}</p>
              <span className="text-xs text-slate-500">Input + Output</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3">
              <p className="text-xs text-slate-400">Est. AI Cost</p>
              <p className="text-xl font-bold text-amber-400 mt-1">${stats.total_ai_estimated_cost_usd.toFixed(4)}</p>
              <span className="text-xs text-slate-500">USD Equivalent</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3">
              <p className="text-xs text-slate-400">Audit Logs</p>
              <p className="text-xl font-bold text-white mt-1">{stats.total_audit_events}</p>
              <span className="text-xs text-slate-500">Immutable Records</span>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center gap-4 border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "users"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            User Access Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "audit"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Compliance & Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search user by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-xs text-slate-500">
                Displaying {filteredUsers.length} accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{u.full_name || "Unnamed"}</div>
                        <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                          u.role === "ADMIN" 
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                            : u.role === "PRO_TRADER"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-800 text-slate-300"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.is_active 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                          {u.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleUser(u.id, u.email)}
                          disabled={u.role === "ADMIN"}
                          className={`px-3 py-1 text-xs font-medium rounded-lg border transition ${
                            u.role === "ADMIN"
                              ? "opacity-40 cursor-not-allowed border-slate-700 text-slate-500"
                              : u.is_active
                              ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                              : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {u.is_active ? "Suspend User" : "Reactivate User"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No users match query "{searchQuery}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === "audit" && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Immutable Event Trail</h3>
                <p className="text-xs text-slate-400">Captures authentication, simulated broker consent, order routing, and plan formulations.</p>
              </div>
              <span className="text-xs text-slate-500">Last 100 System Events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payload Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.user_id ? `USR-${log.user_id}` : "SYSTEM"}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {log.ip_address || "127.0.0.1"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-xs font-sans text-xs">
                        {log.details || "—"}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                        No audit events logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
