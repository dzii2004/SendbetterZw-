/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  DollarSign, 
  HelpCircle, 
  TrendingUp, 
  Bell, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Users, 
  MessageSquare, 
  Compass, 
  MapPin, 
  ExternalLink 
} from "lucide-react";

import { RemittanceCalculator } from "./components/RemittanceCalculator";
import { HistoricalChart } from "./components/HistoricalChart";
import { NotificationAlerts } from "./components/NotificationAlerts";
import { PickupLocations } from "./components/PickupLocations";
import { AIAdvisor } from "./components/AIAdvisor";
import { CurrencyConverter } from "./components/CurrencyConverter";

export default function App() {
  const [activeTab, setActiveTab] = useState<"compare" | "advisor" | "trends" | "locations">("compare");

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F0A] text-[#F0F0E8] selection:bg-[#9FE870]/30 selection:text-[#9FE870] font-sans">
      {/* Navigation */}
      <nav id="top-nav" className="sticky top-0 z-40 bg-[#0A0F0A]/95 border-b border-[#1E3A1E] backdrop-blur-md px-6 lg:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-pulse">🇿🇼</span>
          <div className="text-2xl font-black tracking-tighter uppercase font-sans">
            <span className="text-[#9FE870]">Send</span>Better<span className="text-[#9FE870]">.</span>ZW
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-[#9AAA9A]">
          <button 
            onClick={() => scrollToSection("compare-section")} 
            className="hover:text-[#9FE870] transition cursor-pointer"
          >
            How it works
          </button>
          <button 
            onClick={() => scrollToSection("converter-section")} 
            className="hover:text-[#9FE870] transition cursor-pointer"
          >
            Converter
          </button>
          <button 
            onClick={() => scrollToSection("trends-section")} 
            className="hover:text-[#9FE870] transition cursor-pointer"
          >
            Trends index
          </button>
          <button 
            onClick={() => scrollToSection("locations-section")} 
            className="hover:text-[#9FE870] transition cursor-pointer"
          >
            Payout spots
          </button>
          <button 
            onClick={() => scrollToSection("alerts-section")} 
            className="hover:text-[#9FE870] transition cursor-pointer"
          >
            Rate Alerts
          </button>
          <button 
            onClick={() => scrollToSection("advisor-section")} 
            className="text-[#9FE870] hover:underline transition flex items-center gap-1 cursor-pointer font-bold"
          >
            ✨ AI Companion
          </button>
        </div>

        <div>
          <button
            onClick={() => scrollToSection("compare-section")}
            className="px-6 py-2 bg-[#9FE870] text-[#0A0F0A] hover:bg-opacity-90 rounded-full font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Compare Now
          </button>
        </div>
      </nav>

      {/* Main Split Grid Workspaces for First Fold */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen border-b border-[#1E3A1E]">
        {/* Left Section: Hero Section (Artistic Flair Style 45% / 55% split screen concept) */}
        <section className="lg:col-span-5 p-6 sm:p-12 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#1E3A1E] bg-gradient-to-br from-[#0A0F0A] via-[#0A0F0A] to-[#122412] relative overflow-hidden">
          {/* Subtle Glow backdrop */}
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-radial from-[#9FE870]/5 to-transparent pointer-events-none rounded-full" />
          
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center px-3 py-1 bg-[#1E3A1E] text-[#9FE870] rounded-full text-xs font-extrabold tracking-widest uppercase">
              ⚡ LIVE CORRIDOR RATES • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} GMT
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter uppercase text-white font-sans">
              Stop <span className="text-white italic">Losing</span> Money Sending <span className="text-[#9FE870]">Home.</span>
            </h1>

            <p className="text-lg text-[#9AAA9A] leading-relaxed max-w-md">
              The only independent transparency tool built specifically to analyze and compare Wise, Mukuru, Western Union, TapTap Send & Innbucks remittance fees to Zimbabwe in seconds.
            </p>

            {/* Daily stats bento block */}
            <div className="grid grid-cols-2 gap-4 max-w-sm pt-4">
              <div className="p-5 border border-[#1E3A1E] bg-[#111811]/45 rounded-2xl">
                <div className="text-3xl font-black text-[#9FE870] uppercase">6+</div>
                <div className="text-[10px] text-[#5A7A5A] font-bold tracking-widest uppercase mt-1">Diaspora Channels</div>
              </div>
              <div className="p-5 border border-[#1E3A1E] bg-[#111811]/45 rounded-2xl">
                <div className="text-3xl font-black text-[#9FE870] uppercase">$12.4k</div>
                <div className="text-[10px] text-[#5A7A5A] font-bold tracking-widest uppercase mt-1">Daily Save Index</div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#5A7A5A] font-mono leading-relaxed">
              📍 250+ Cash Collection booths & EcoCash Wallet terminals supported.
            </div>
          </div>
        </section>

        {/* Right Section: Interactive Comparison Matrix */}
        <section id="compare-section" className="lg:col-span-7 bg-[#111811] p-6 sm:p-12 lg:p-16 flex flex-col justify-start space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-4 border-b border-[#1E3A1E]/60">
            <div>
              <h2 className="text-xs font-bold tracking-widest text-[#5A7A5A] uppercase mb-1">Interactive comparison matrix</h2>
              <p className="text-2xl font-bold">Simulate your remittance</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-[#5A7A5A] uppercase">Guaranteed Payout locations</span>
              <div className="text-lg font-bold text-white">Harare / Bulawayo & Countrywide</div>
            </div>
          </div>

          <RemittanceCalculator />
        </section>
      </div>

      {/* Main Inner body content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-16">
        
        {/* Step-by-step indicator block */}
        <section className="bg-[#111811]/35 border border-[#1E3A1E] rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#9FE870]/10 to-transparent pointer-events-none rounded-bl-3xl" />
          <span className="text-xs font-bold text-[#9FE870] uppercase tracking-widest block mb-1">Step-By-Step Guidelines</span>
          <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-8">How to save on Zimbabwe Remittance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-[#0A0F0A] border border-[#1E3A1E] p-6 rounded-2xl flex gap-4 items-start hover:border-[#9FE870]/30 transition">
              <span className="bg-[#9FE870]/10 border border-[#9FE870]/30 text-[#9FE870] h-9 w-9 flex items-center justify-center rounded-xl font-mono text-sm font-bold flex-shrink-0">1</span>
              <div>
                <b className="text-white text-base block mb-1.5">Enter your amount</b>
                <p className="text-xs text-[#9AAA9A] leading-relaxed">Choose Rand, British Pounds, or USD currency and input your desired value.</p>
              </div>
            </div>
            <div className="bg-[#0A0F0A] border border-[#1E3A1E] p-6 rounded-2xl flex gap-4 items-start hover:border-[#9FE870]/30 transition">
              <span className="bg-[#9FE870]/10 border border-[#9FE870]/30 text-[#9FE870] h-9 w-9 flex items-center justify-center rounded-xl font-mono text-sm font-bold flex-shrink-0">2</span>
              <div>
                <b className="text-white text-base block mb-1.5">Compare overall returns</b>
                <p className="text-xs text-[#9AAA9A] leading-relaxed">Instantly review exchange conversion markups, static fees, speeds, and pickup partner spots.</p>
              </div>
            </div>
            <div className="bg-[#0A0F0A] border border-[#1E3A1E] p-6 rounded-2xl flex gap-4 items-start hover:border-[#9FE870]/30 transition">
              <span className="bg-[#9FE870]/10 border border-[#9FE870]/30 text-[#9FE870] h-9 w-9 flex items-center justify-center rounded-xl font-mono text-sm font-bold flex-shrink-0">3</span>
              <div>
                <b className="text-white text-base block mb-1.5">Send with the winner</b>
                <p className="text-xs text-[#9AAA9A] leading-relaxed">Complete your transaction secure in the knowledge you did not lose money on hidden markups.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Currency Converter Tool */}
        <CurrencyConverter />

        {/* BENTO GRID: Trends Index & AI Advice Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <HistoricalChart />
          <AIAdvisor />
        </div>

        {/* Payout Locations Search */}
        <PickupLocations />

        {/* Notification Rate alert System */}
        <NotificationAlerts />

        {/* Diaspora user testimonies */}
        <section className="bg-[#111811]/35 border border-[#1E3A1E] rounded-3xl p-8 sm:p-10">
          <div className="flex -space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#1E3A1E] bg-[#9FE870]/20 flex items-center justify-center text-xs font-bold text-white">TM</div>
            <div className="w-10 h-10 rounded-full border-2 border-[#1E3A1E] bg-[#9FE870]/30 flex items-center justify-center text-xs font-bold text-white">CN</div>
            <div className="w-10 h-10 rounded-full border-2 border-[#1E3A1E] bg-[#9FE870]/45 flex items-center justify-center text-xs font-bold text-white">BK</div>
          </div>
          <span className="text-xs font-bold text-[#9FE870] uppercase tracking-widest block mb-1">Testimonials</span>
          <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-8">What Zimbos are saying</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#0A0F0A] border border-[#1E3A1E] p-6 rounded-2xl space-y-4">
              <p className="text-xs text-[#9AAA9A] leading-relaxed italic">
                “This tool saved me $15 this month! I was using Western Union to send from London for years. Switched to Wise after comparing exchange markups on SendBetter ZW.”
              </p>
              <div>
                <span className="text-xs font-bold text-white block">Tendai M.</span>
                <span className="text-[10px] text-[#5A7A5A]">🇬🇧 London, UK to Harare</span>
              </div>
            </div>

            <div className="bg-[#0A0F0A] border border-[#1E3A1E] p-6 rounded-2xl space-y-4">
              <p className="text-xs text-[#9AAA9A] leading-relaxed italic">
                “Finally a transparency tool built specifically for our Zimbabwe corridor. It’s incredibly intuitive and instantly highlights the cheapest way to send from SA.”
              </p>
              <div>
                <span className="text-xs font-bold text-white block">Chiedza N.</span>
                <span className="text-[10px] text-[#5A7A5A]">🇿🇦 Johannesburg, SA to Bulawayo</span>
              </div>
            </div>

            <div className="bg-[#0A0F0A] border border-[#1E3A1E] p-6 rounded-2xl space-y-4">
              <p className="text-xs text-[#9AAA9A] leading-relaxed italic">
                “I love the price alert triggers! Having customized calculations and automated email alerts makes managing regular family transfers effortless.”
              </p>
              <div>
                <span className="text-xs font-bold text-white block">Blessing K.</span>
                <span className="text-[10px] text-[#5A7A5A]">🇿🇦 Pretoria, SA to Mutare</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer (Artistic Flair representation) */}
      <footer className="bg-[#0A0F0A] px-6 lg:px-12 py-10 border-t border-[#1E3A1E] flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#5A7A5A] font-bold uppercase tracking-widest">
        <div>© 2026 SendBetter ZW • Independent Comparison Platform</div>
        <div className="flex flex-wrap gap-6 items-center justify-center">
          <span className="hover:text-white cursor-pointer" onClick={() => scrollToSection("converter-section")}>Converter</span>
          <span className="hover:text-white cursor-pointer" onClick={() => scrollToSection("compare-section")}>Privacy</span>
          <span className="hover:text-white cursor-pointer" onClick={() => scrollToSection("compare-section")}>Terms</span>
          <span className="hover:text-white cursor-pointer" onClick={() => scrollToSection("advisor-section")}>Support</span>
          <span className="text-[#9FE870] animate-pulse">Alerts Engine: Active</span>
        </div>
      </footer>
    </div>
  );
}
