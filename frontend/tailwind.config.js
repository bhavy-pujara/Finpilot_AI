/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        foreground: "#F8FAFC",
        terminal: {
          darker: "#080B12",
          card: "#0F172A",
          muted: "#1E293B",
          border: "#334155",
          accent: "#3B82F6",
        },
        financial: {
          gain: "#10B981",
          loss: "#F43F5E",
          neutral: "#94A3B8",
          warning: "#F59E0B",
        }
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      }
    },
  },
  plugins: [],
}
