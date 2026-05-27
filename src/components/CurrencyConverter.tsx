import React, { useState, useEffect } from "react";
import { RefreshCw, ArrowRightLeft, DollarSign, TrendingUp, Info, History } from "lucide-react";
import { ZIG_BASE_RATE_PER_USD } from "../data";

type CurrencyType = "USD" | "ZAR" | "ZiG";

interface RecentConversion {
  id: string;
  sourceAmount: number;
  sourceCurrency: CurrencyType;
  targetCurrency: CurrencyType;
  targetAmount: number;
  timestamp: string;
}

export function CurrencyConverter() {
  const [sourceAmount, setSourceAmount] = useState<number>(100);
  const [sourceCurrency, setSourceCurrency] = useState<CurrencyType>("USD");
  const [targetCurrency, setTargetCurrency] = useState<CurrencyType>("ZiG");
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>([]);

  // Live Exchange Rates
  const [liveRates, setLiveRates] = useState<Record<string, number>>({
    USD: 1.0,
    ZAR: 18.25,
    ZiG: ZIG_BASE_RATE_PER_USD,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [ratesError, setRatesError] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    let active = true;
    const fetchRates = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (data && data.rates && active) {
          const zarRate = data.rates["ZAR"] || 18.25;
          const zigEstimate = zarRate * 1.35; // ZiG cross-rate calculation

          setLiveRates({
            USD: 1.0,
            ZAR: zarRate,
            ZiG: parseFloat(zigEstimate.toFixed(4)),
          });
          setRatesError(false);
          const now = new Date();
          setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        if (active) {
          setRatesError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000); // 5 min
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Compute conversion
  // We convert Source -> USD -> Target
  const convertAmount = (amount: number, from: CurrencyType, to: CurrencyType): number => {
    if (from === to) return amount;
    // value in USD
    const amountInUSD = amount / liveRates[from];
    // value in target
    return amountInUSD * liveRates[to];
  };

  const handleSwap = () => {
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);
    
    // Recalculate source amount to match target amount for seamless conversion transition
    const converted = convertAmount(sourceAmount, sourceCurrency, targetCurrency);
    setSourceAmount(parseFloat(converted.toFixed(2)));
  };

  const targetAmount = convertAmount(sourceAmount, sourceCurrency, targetCurrency);

  // Track and display the user's last 3 calculated conversions in current session
  useEffect(() => {
    if (!sourceAmount || sourceAmount <= 0) return;

    const handler = setTimeout(() => {
      setRecentConversions((prev) => {
        // Find if the top (most recent) saved conversion has identical parameters
        if (prev.length > 0) {
          const top = prev[0];
          if (
            top.sourceAmount === sourceAmount &&
            top.sourceCurrency === sourceCurrency &&
            top.targetCurrency === targetCurrency
          ) {
            return prev;
          }
        }

        const calculated = convertAmount(sourceAmount, sourceCurrency, targetCurrency);
        const item: RecentConversion = {
          id: Math.random().toString(36).substring(2, 9),
          sourceAmount,
          sourceCurrency,
          targetCurrency,
          targetAmount: parseFloat(calculated.toFixed(2)),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        return [item, ...prev].slice(0, 3);
      });
    }, 1200);

    return () => clearTimeout(handler);
  }, [sourceAmount, sourceCurrency, targetCurrency, liveRates]);

  // Cross rates matrix constants for display
  const quickConversions = [10, 50, 100, 250, 500, 1000];

  const getCurrencySymbol = (code: CurrencyType) => {
    if (code === "USD") return "$";
    if (code === "ZAR") return "R";
    return "ZiG ";
  };

  const getCurrencyName = (code: CurrencyType) => {
    if (code === "USD") return "United States Dollar";
    if (code === "ZAR") return "South African Rand";
    return "Zimbabwe Gold (ZiG)";
  };

  return (
    <section id="converter-section" className="bg-[#111811]/35 border border-[#1E3A1E] rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-4 border-b border-[#1E3A1E]/40">
        <div>
          <span className="text-xs font-bold text-[#9FE870] uppercase tracking-widest block mb-1">Utility Hub</span>
          <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Quick Currency Converter</h3>
        </div>
        <div className="text-[11px] font-mono text-[#5A7A5A]">
          {loading ? (
            <span className="animate-pulse">Fetching live cross rates...</span>
          ) : ratesError ? (
            <span className="text-red-400">Baseline Rate Matrix Active</span>
          ) : (
            <span className="flex items-center gap-1.5 bg-[#1E3A1E]/40 px-3 py-1 rounded-full text-[#9FE870]">
              <span className="w-1.5 h-1.5 bg-[#9FE870] rounded-full animate-ping" />
              Live Rates: 1 USD = {liveRates.ZAR.toFixed(2)} ZAR | {liveRates.ZiG.toFixed(2)} ZiG ({lastUpdated})
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Converter Tool Card */}
        <div className="lg:col-span-7 bg-[#0A0F0A] border border-[#1E3A1E] p-6 rounded-2xl flex flex-col justify-between space-y-5">
          {/* Form */}
          <div className="space-y-4">
            {/* Input & Source Select */}
            <div>
              <label className="text-[10px] font-extrabold text-[#5A7A5A] uppercase tracking-widest block mb-2">
                Convert From:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-3.5 font-bold font-mono text-sm text-[#5A7A5A]">
                    {getCurrencySymbol(sourceCurrency)}
                  </span>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-[#111811] border border-[#1E3A1E] rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-white focus:outline-none focus:border-[#ZD2] focus:border-[#9FE870] transition"
                    value={sourceAmount || ""}
                    onChange={(e) => setSourceAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <select
                  className="bg-[#111811] border border-[#1E3A1E] text-white rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#9FE870] cursor-pointer"
                  value={sourceCurrency}
                  onChange={(e) => setSourceCurrency(e.target.value as CurrencyType)}
                >
                  <option value="USD">🇺🇸 USD</option>
                  <option value="ZAR">🇿🇦 ZAR</option>
                  <option value="ZiG">🇿🇼 ZiG</option>
                </select>
              </div>
              
              {/* Popular presets row for instantaneous conversions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[9px] font-extrabold text-[#5A7A5A] uppercase tracking-wider mr-1">Quick Presets:</span>
                {[25, 50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSourceAmount(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      sourceAmount === preset
                        ? "bg-[#9FE870] text-[#0A0F0A]"
                        : "bg-[#111811] hover:bg-[#1E3A1E] text-[#9AAA9A] hover:text-white border border-[#1E3A1E]/50"
                    }`}
                  >
                    {getCurrencySymbol(sourceCurrency)}{preset}
                  </button>
                ))}
              </div>

              <span className="text-[10px] text-[#5A7A5A] mt-1.5 block italic">{getCurrencyName(sourceCurrency)}</span>
            </div>

            {/* Swap Button Divider */}
            <div className="flex items-center justify-center py-1">
              <button
                type="button"
                onClick={handleSwap}
                className="p-3 bg-[#111811] hover:bg-[#1E3A1E] border border-[#1E3A1E] hover:border-[#9FE870]/30 text-[#9FE870] rounded-full transition cursor-pointer flex items-center justify-center shadow-lg"
                title="Swap currencies"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Output & Target Select */}
            <div>
              <label className="text-[10px] font-extrabold text-[#5A7A5A] uppercase tracking-widest block mb-2">
                Convert To:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-3.5 font-bold font-mono text-sm text-[#5A7A5A]">
                    {getCurrencySymbol(targetCurrency)}
                  </span>
                  <input
                    type="text"
                    readOnly
                    className="w-full bg-[#111811]/50 border border-[#1E3A1E] rounded-xl py-3 pl-12 pr-4 text-sm font-bold font-mono text-white focus:outline-none"
                    value={targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  />
                </div>
                <select
                  className="bg-[#111811] border border-[#1E3A1E] text-white rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#9FE870] cursor-pointer"
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value as CurrencyType)}
                >
                  <option value="USD">🇺🇸 USD</option>
                  <option value="ZAR">🇿🇦 ZAR</option>
                  <option value="ZiG">🇿🇼 ZiG</option>
                </select>
              </div>
              <span className="text-[10px] text-[#5A7A5A] mt-1.5 block italic">{getCurrencyName(targetCurrency)}</span>
            </div>
          </div>

          {/* Popular presets */}
          <div className="border-t border-[#1E3A1E]/30 pt-4 mt-2">
            <span className="text-[10px] font-extrabold text-[#5A7A5A] uppercase tracking-widest block mb-2">
              Preset Amounts ({sourceCurrency}):
            </span>
            <div className="flex flex-wrap gap-2">
              {[10, 50, 100, 250, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSourceAmount(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center cursor-pointer ${
                    sourceAmount === preset
                      ? "bg-[#9FE870] text-[#0A0F0A]"
                      : "bg-[#111811] hover:bg-[#1E3A1E] text-[#9AAA9A] hover:text-white border border-[#1E3A1E]/60"
                  }`}
                >
                  {getCurrencySymbol(sourceCurrency)}{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Conversions Tracker */}
          {recentConversions.length > 0 && (
            <div className="border-t border-[#1E3A1E]/30 pt-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-[#5A7A5A] uppercase tracking-widest flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#9FE870]" />
                  Recent Conversions ({recentConversions.length}/3)
                </span>
                <button
                  onClick={() => setRecentConversions([])}
                  className="text-[9px] font-bold text-[#5A7A5A] hover:text-red-400 uppercase tracking-wider transition cursor-pointer"
                >
                  Clear History
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {recentConversions.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSourceAmount(conv.sourceAmount);
                      setSourceCurrency(conv.sourceCurrency);
                      setTargetCurrency(conv.targetCurrency);
                    }}
                    className="flex items-center justify-between text-left p-2.5 px-3 bg-[#111811] hover:bg-[#1E3A1E] border border-[#1E3A1E]/40 hover:border-[#9FE870]/30 rounded-xl text-xs font-mono transition cursor-pointer group"
                    title="Click to restore this conversion"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {getCurrencySymbol(conv.sourceCurrency)}
                        {conv.sourceAmount} {conv.sourceCurrency}
                      </span>
                      <span className="text-[#5A7A5A]">&rarr;</span>
                      <span className="text-[#9FE870] font-bold">
                        {getCurrencySymbol(conv.targetCurrency)}
                        {conv.targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {conv.targetCurrency}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#5A7A5A] group-hover:text-[#9FE870] transition font-sans font-bold">
                      Restore &bull; {conv.timestamp}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Exchange Rate Cross Matrix */}
        <div className="lg:col-span-5 bg-[#0A0F0A] border border-[#1E3A1E] p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-extrabold text-[#9FE870] uppercase tracking-widest block mb-1">
              Indicative Cross Grid
            </span>
            <h4 className="text-white text-sm font-bold uppercase tracking-wide mb-3">
              Standard USD Conversion Index
            </h4>
            <div className="space-y-2.5">
              {quickConversions.map((val) => {
                const zarVal = val * liveRates.ZAR;
                const zigVal = val * liveRates.ZiG;
                return (
                  <div
                    key={val}
                    className="grid grid-cols-3 py-2 px-3 bg-[#111811]/40 border border-[#1E3A1E]/30 rounded-xl text-xs font-mono items-center hover:bg-[#111811] transition"
                  >
                    <div className="text-white font-bold">${val}</div>
                    <div className="text-[#9AAA9A]">R {zarVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-[#9FE870] font-semibold">ZiG {zigVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#111811]/30 p-3.5 border border-[#1E3A1E]/50 rounded-xl space-y-1.5 text-[11px] text-[#9AAA9A] leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-[#9FE870]">
              <Info className="w-3.5 h-3.5" />
              <span>Conversion Notice:</span>
            </div>
            <p>
              Interbank gold-backed ZiG market calculations fluctuate daily based on South African Rand cross-references. Multi-channel agents may apply dynamic local cash handling spreads upon checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
