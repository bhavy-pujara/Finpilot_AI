"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Bot, 
  TrendingUp, 
  Briefcase, 
  ShieldAlert, 
  BookOpen, 
  Layers, 
  SlidersHorizontal,
  Bell,
  Shield,
  LogOut,
  Compass,
  FileText
} from "lucide-react";
import { getAuthToken, removeAuthToken } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/assistant", label: "AI Copilot", icon: Bot },
  { href: "/research", label: "Research", icon: FileText },
  { href: "/trade-planner", label: "Trade Planner", icon: SlidersHorizontal },
  { href: "/paper-trading", label: "Paper Trading", icon: Compass },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/risk", label: "Risk Engine", icon: ShieldAlert },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/broker", label: "Broker Lab", icon: Layers },
  { href: "/admin", label: "Admin", icon: Shield },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuthToken());
  }, [pathname]);

  const handleLogout = () => {
    removeAuthToken();
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner Notice */}
      <div className="bg-[#080B12] border-b border-slate-800/80 px-4 py-1 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
            SIMULATED ENVIRONMENT
          </span>
          <span className="hidden sm:inline">Data feeds labeled [HISTORICAL / DEMO]. Real orders permanently disabled.</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-slate-400 font-mono text-[11px]">Markets: NSE | BSE | NYSE | NASDAQ</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-400/20">
                <span className="font-bold font-mono text-white text-base">F</span>
              </div>
              <div>
                <span className="text-white font-semibold text-base tracking-tight font-mono">FinPilot<span className="text-blue-400">.AI</span></span>
                <span className="block text-[9px] text-slate-400 uppercase tracking-widest font-mono">Trading Copilot</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto py-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5 opacity-80" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <Link
              href="/notifications"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            </Link>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-mono font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Logout
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white font-mono shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
