"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { api, setAuthToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      setAuthToken(res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const fillTraderDemo = () => {
    setEmail("trader@finpilot.ai");
    setPassword("Trader123!");
  };

  const fillAdminDemo = () => {
    setEmail("admin@finpilot.ai");
    setPassword("Admin123!");
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-[#080B12] rounded-xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center font-mono font-bold text-lg">
            F
          </div>
          <h1 className="text-xl font-bold font-mono text-white">Sign In to FinPilot AI</h1>
          <p className="text-xs text-slate-400">Institutional Market Intelligence & Paper Trading Terminal</p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@finpilot.ai"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-medium transition-colors flex items-center justify-center space-x-2 shadow"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-slate-850 space-y-2">
          <span className="block text-[11px] font-mono text-slate-400 text-center uppercase tracking-wider">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillTraderDemo}
              className="py-1.5 px-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-mono text-blue-300 transition-colors"
            >
              Fill Trader Demo
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="py-1.5 px-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-mono text-slate-300 transition-colors"
            >
              Fill Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
