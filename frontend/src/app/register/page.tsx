"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { api, setAuthToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [defaultMarket, setDefaultMarket] = useState("IN");
  const [role, setRole] = useState("user");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password strength evaluation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak (add numbers & symbols)", color: "text-rose-400 bg-rose-500" };
    if (score <= 3) return { score: 2, label: "Moderate", color: "text-amber-400 bg-amber-500" };
    return { score: 3, label: "Strong & Secure", color: "text-emerald-400 bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Form Validations
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the Terms of Service & Paper-Trading Risk Disclosure.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        password,
        default_market: defaultMarket,
        role,
      });

      if (res.access_token) {
        setAuthToken(res.access_token);
        setSuccessMsg("Account successfully registered! Initializing trading terminal...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        router.push("/login?registered=true");
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch")) {
        setError(
          "Unable to connect to FinPilot Backend API (http://127.0.0.1:8000). " +
          "Ensure the backend server is running in a terminal: uvicorn app.main:app --port 8000 --reload"
        );
      } else {
        setError(msg || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-[#080B12] rounded-xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center font-mono font-bold text-lg">
            F
          </div>
          <h1 className="text-xl font-bold font-mono text-white">Create FinPilot Account</h1>
          <p className="text-xs text-slate-400">Institutional Market Intelligence & Quantitative Copilot</p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@example.com"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Password (min 8 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-md pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="pt-1 space-y-1">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color.split(" ")[1] : "bg-transparent"}`} />
                  <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color.split(" ")[1] : "bg-transparent"}`} />
                  <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color.split(" ")[1] : "bg-transparent"}`} />
                </div>
                <p className={`text-[10px] font-mono ${strength.color.split(" ")[0]}`}>
                  Strength: {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0F172A] border border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[10px] text-rose-400 font-mono">Passwords do not match</p>
            )}
          </div>

          {/* Market & Account Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Primary Market</label>
              <select
                value={defaultMarket}
                onChange={(e) => setDefaultMarket(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="IN">Indian (NSE / BSE ₹)</option>
                <option value="US">US (NYSE / NASDAQ $)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="user">Individual Trader</option>
                <option value="enterprise">Institutional / Pro</option>
              </select>
            </div>
          </div>

          {/* Terms & Risk Agreement */}
          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-400">
              <input
                type="checkbox"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-600"
              />
              <span>
                I accept the{" "}
                <Link href="/legal/terms" target="_blank" className="text-blue-400 underline hover:text-blue-300">
                  Terms of Service
                </Link>{" "}
                and acknowledge that FinPilot AI is an educational paper-trading system with zero live execution.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-medium transition-colors flex items-center justify-center space-x-2 shadow"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Already registered?{" "}
          <Link href="/login" className="text-blue-400 hover:underline font-mono">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
