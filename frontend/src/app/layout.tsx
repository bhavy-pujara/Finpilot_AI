import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MarketTicker from "@/components/common/MarketTicker";

export const metadata: Metadata = {
  title: "FinPilot AI — Understand the trade before you make it",
  description: "Institutional financial market intelligence, deterministic quantitative analytics, AI research engine and paper-trading platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <MarketTicker />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
