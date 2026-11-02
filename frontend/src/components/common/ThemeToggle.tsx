"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { api, getAuthToken } from "@/lib/api";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("finpilot_theme") as "dark" | "light" | null;
    if (savedTheme) {
      applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      applyTheme("light");
    } else {
      applyTheme("dark");
    }
  }, []);

  const applyTheme = (t: "dark" | "light") => {
    setTheme(t);
    const root = document.documentElement;
    if (t === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    localStorage.setItem("finpilot_theme", t);

    // If logged in, optionally persist preference to backend DB
    if (getAuthToken()) {
      api.updatePreferences({ theme: t }).catch(() => {});
    }
  };

  const toggleTheme = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-blue-400" />
      )}
    </button>
  );
}
