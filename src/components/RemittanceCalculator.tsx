import React, { useState, useEffect, useMemo } from "react";
import { Info, Send, Award, Banknote, Landmark, Smartphone, ArrowRight, Zap, RefreshCw, X } from "lucide-react";
import { ORIGIN_CURRENCIES, calculateRemittance, PROVIDERS, ZIG_BASE_RATE_PER_USD } from "../data";
import { RemittanceResult } from "../types";

export function RemittanceCalculator() {
  const [calculationMode, setCalculationMode] = useState<"SEND_MODE" | "RECEIVE_MODE">("SEND_MODE");
  const [sendAmount, setSendAmount] = useState<number>(1000);
  const [targetReceiveAmount, setTargetReceiveAmount] = useState<number>(100);
  
  const [originCode, setOriginCode] = useState<string>("ZAR");
  const [destinationType, setDestinationType] = useState<"USD_CASH" | "USD_WALLET" | "ZIG_WALLET" | "ZIG_BANK">("USD_CASH");
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);

  // Live Rates fetching setup
  const [liveRates, setLiveRates] = useState<Record<string, number> | undefined>(undefined);
  const [ratesLoading, setRatesLoading] = useState<boolean>(true);
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
          const zigEstimate = zarRate * 1.35; // ZiG roughly tracks standard gold indices/approx cross-rate
          
          const formattedRates: Record<string, number> = {
            USD: 1.0,
            ZAR: data.rates["ZAR"] || 18.25,
            GBP: data.rates["GBP"] || 0.78,
            BWP: data.rates["BWP"] || 13.45,
            AUD: data.rates["AUD"] || 1.49,
            CAD: data.rates["CAD"] || 1.37,
            ZIG: zigEstimate,
          };
          setLiveRates(formattedRates);
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
          setRatesLoading(false);
        }
      }
    };
    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const activeOrigin = ORIGIN_CURRENCIES.find(c => c.code === originCode) || ORIGIN_CURRENCIES[0];

  // Adjust default send amount when origin currency changes
  const handleOriginChange = (code: string) => {
    setOriginCode(code);
    const curr = ORIGIN_CURRENCIES.find(c => c.code === code);
    if (curr) {
      setSendAmount(curr.popularAmounts[1]); // Choose second popular amount
    }
  };

  const getPayoutSymbol = (dest: string) => {
    if (dest.startsWith("USD")) return "$";
    return "ZiG";
  };

  // Compute final results based on MODE
  const results = useMemo(() => {
    if (calculationMode === "SEND_MODE") {
      return calculateRemittance({
        sendAmount,
        originCode,
        destinationType,
        liveRates
      });
    } else {
      // Receiver Needs Target Amount Mode
      const origin = ORIGIN_CURRENCIES.find(c => c.code === originCode) || ORIGIN_CURRENCIES[0];
      const rateToUSD = liveRates && liveRates[originCode] ? liveRates[originCode] : origin.baseExchangeRateToUSD;
      const zigRate = liveRates && liveRates["ZIG"] ? liveRates["ZIG"] : ZIG_BASE_RATE_PER_USD;

      const filteredProviders = PROVIDERS.filter(p => {
        const supportsOrigin = p.supportedOrigins.includes(originCode);
        const supportsDestination = p.supportedDestinations.includes(destinationType);
        return supportsOrigin && supportsDestination;
      });

      const list = filteredProviders.map(p => {
        let K = 0;
        let receiveCurrency: "USD" | "ZiG" = "USD";
        if (destinationType === "USD_CASH" || destinationType === "USD_WALLET") {
          receiveCurrency = "USD";
          K = (1 / rateToUSD) * p.rateModifier;
        } else {
          receiveCurrency = "ZiG";
          K = ((1 / rateToUSD) * p.rateModifier) * zigRate;
        }

        const baseFeeInOrigin = p.baseFee * rateToUSD;

        // Algebra: sendAmount = ((R / K) + baseFeeInOrigin) / (1 - p.feePercent)
        let requiredSendAmount = 0;
        if (K > 0) {
          requiredSendAmount = ((targetReceiveAmount / K) + baseFeeInOrigin) / (1 - p.feePercent);
        }

        const feeInOrigin = baseFeeInOrigin + (requiredSendAmount * p.feePercent);

        let payoutMethodName = "";
        if (destinationType === "USD_CASH") payoutMethodName = "USD Cash Pick-up";
        else if (destinationType === "USD_WALLET") payoutMethodName = "USD Mobile Wallet (Innbucks/EcoCash)";
        else if (destinationType === "ZIG_WALLET") payoutMethodName = "ZiG Mobile Money (EcoCash)";
        else if (destinationType === "ZIG_BANK") payoutMethodName = "ZiG Direct Bank Deposit";

        return {
          provider: p,
          sendAmount: parseFloat(requiredSendAmount.toFixed(2)),
          sendCurrency: originCode,
          receiveAmount: targetReceiveAmount,
          receiveCurrency,
          fee: parseFloat(feeInOrigin.toFixed(2)),
          exchangeRate: parseFloat(K.toFixed(4)),
          speed: p.speed,
          payoutMethodName,
          isCheapest: false,
          isFastest: p.speed.toLowerCase().includes("instant") || p.speed.toLowerCase().includes("minute"),
        };
      });

      // Sort by sendAmount ascending (least required from sender pocket gets best ranking)
      list.sort((a, b) => a.sendAmount - b.sendAmount);

      if (list.length > 0) {
        list[0].isCheapest = true;
      }

      return list;
    }
  }, [sendAmount, targetReceiveAmount, originCode, destinationType, liveRates, calculationMode]);

  const getSavings = (result: any) => {
    if (results.length <= 1) return 0;
    const worst = results[results.length - 1];
    if (calculationMode === "SEND_MODE") {
      return Math.max(0, result.receiveAmount - worst.receiveAmount);
    } else {
      return Math.max(0, worst.sendAmount - result.sendAmount);
    }
  };

  const receiverSymbol = getPayoutSymbol(destinationType);

  return (
    <div className="space-y-6" id="compare">
      {/* Dynamic Mode Switcher */}
      <div className="flex bg-[#0A0F0A] border border-[#1E3A1E] rounded-xl p-1 gap-1">
        <button
          onClick={() => setCalculationMode("SEND_MODE")}
          className={`flex-1 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
            calculationMode === "SEND_MODE"
              ? "bg-[#9FE870] text-[#0A0F0A] shadow-md shadow-[#9FE870]/10"
              : "text-[#9AAA9A] hover:text-white"
          }`}
        >
          <span>🔢</span> I have a fixed Send Budget
        </button>
        <button
          onClick={() => setCalculationMode("RECEIVE_MODE")}
          className={`flex-1 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
            calculationMode === "RECEIVE_MODE"
              ? "bg-[#9FE870] text-[#0A0F0A] shadow-md shadow-[#9FE870]/10"
              : "text-[#9AAA9A] hover:text-white"
          }`}
        >
          <span>🎯</span> Recipient needs fixed amount
        </button>
      </div>

      {/* Search and Input Form */}
      <div className="bg-[#111811] border border-[#1E3A1E] rounded-2xl p-6 shadow-xl space-y-5">
        
        {/* Usability Quick Select row */}
        <div className="pb-3 border-b border-[#1E3A1E]/30">
          <label className="text-[10px] font-extrabold text-[#5A7A5A] uppercase tracking-widest block mb-2.5">
            Quick Select Send Country
          </label>
          <div className="flex flex-wrap gap-2">
            {ORIGIN_CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => handleOriginChange(curr.code)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  originCode === curr.code
                    ? "bg-[#9FE870] text-[#0A0F0A] border-[#9FE870]"
                    : "bg-[#0A0F0A] text-[#9AAA9A] border-[#1E3A1E] hover:border-[#9FE870]/30 hover:text-white"
                }`}
              >
                <span className="text-sm">{curr.flag}</span>
                <span>{curr.code}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          {/* Sending Country/Currency */}
          <div className="md:col-span-4">
            <label className="text-[11px] font-extrabold text-[#5A7A5A] uppercase tracking-wider block mb-2">
              Diaspora sending from:
            </label>
            <div className="relative">
              <select
                className="w-full bg-[#0A0F0A] border border-[#1E3A1E] rounded-xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:border-[#9FE870] appearance-none cursor-pointer"
                value={originCode}
                onChange={(e) => handleOriginChange(e.target.value)}
              >
                {ORIGIN_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} — {curr.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-[#5A7A5A] text-xs">▼</div>
            </div>
          </div>

          {/* Amount input block based on Mode */}
          {calculationMode === "SEND_MODE" ? (
            <div className="md:col-span-4">
              <label className="text-[11px] font-extrabold text-[#5A7A5A] uppercase tracking-wider block mb-2 flex items-center justify-between">
                <span>Enter Send Amount</span>
                <span className="text-[10px] text-[#9FE870] lowercase font-mono">pocket budget</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 font-bold text-[#5A7A5A]">
                  {activeOrigin.symbol}
                </span>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-[#0A0F0A] border border-[#1E3A1E] rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white focus:outline-none focus:border-[#9FE870] transition"
                  value={sendAmount || ""}
                  onChange={(e) => setSendAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          ) : (
            <div className="md:col-span-4">
              <label className="text-[11px] font-extrabold text-[#5A7A5A] uppercase tracking-wider block mb-2 flex items-center justify-between">
                <span>Target Payout Recipient Gets</span>
                <span className="text-[10px] text-[#9FE870] lowercase font-mono">guaranteed target</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 font-bold text-[#5A7A5A]">
                  {receiverSymbol === "$" ? "$" : "ZiG"}
                </span>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-[#0A0F0A] border border-[#1E3A1E] rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-white focus:outline-none focus:border-[#ZD2] focus:border-[#9FE870] transition"
                  value={targetReceiveAmount || ""}
                  onChange={(e) => setTargetReceiveAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {/* Receiving Option */}
          <div className="md:col-span-4">
            <label className="text-[11px] font-extrabold text-[#5A7A5A] uppercase tracking-wider block mb-2">
              How receiver collects in ZW:
            </label>
            <div className="relative">
              <select
                className="w-full bg-[#0A0F0A] border border-[#1E3A1E] rounded-xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:border-[#9FE870] appearance-none cursor-pointer"
                value={destinationType}
                onChange={(e) => setDestinationType(e.target.value as any)}
              >
                <option value="USD_CASH">💵 USD Cash Pick-up (Harare/Bulawayo/Rural)</option>
                <option value="USD_WALLET">📱 USD Mobile Money (Innbucks/EcoCash USD)</option>
                <option value="ZIG_WALLET">🇿🇼 ZiG Mobile Money (EcoCash ZiG)</option>
                <option value="ZIG_BANK">🏛️ ZiG Bank Transfer (RTGS / Zimswitch)</option>
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-[#5A7A5A] text-xs">▼</div>
            </div>
          </div>
        </div>

        {/* Quick Amounts selector buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#132313]">
          <span className="text-xs text-[#5A7A5A] font-medium mr-1 uppercase tracking-wider">Quick Select amounts:</span>
          
          {calculationMode === "SEND_MODE" ? (
            // Forward Send Amounts configuration
            activeOrigin.popularAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setSendAmount(amount)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center cursor-pointer ${
                  sendAmount === amount
                    ? "bg-[#9FE870] text-[#0A0F0A]"
                    : "bg-[#0A0F0A] hover:bg-[#1E3A1E] text-[#9AAA9A] hover:text-white border border-[#112211]"
                }`}
              >
                {activeOrigin.symbol} {amount.toLocaleString()}
              </button>
            ))
          ) : (
            // Target Payout Amounts configuration
            (receiverSymbol === "$" ? [50, 100, 250, 500, 1000] : [1000, 2000, 5000, 10000]).map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setTargetReceiveAmount(amount)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center cursor-pointer ${
                  targetReceiveAmount === amount
                    ? "bg-[#9FE870] text-[#0A0F0A]"
                    : "bg-[#0A0F0A] hover:bg-[#1E3A1E] text-[#9AAA9A] hover:text-white border border-[#112211]"
                }`}
              >
                {receiverSymbol === "$" ? "$" : ""}{amount.toLocaleString()} {receiverSymbol === "ZiG" ? "ZiG" : ""}
              </button>
            ))
          )}

          <button
            onClick={() => {
              if (calculationMode === "SEND_MODE") {
                setSendAmount(prev => prev + 50);
              } else {
                setTargetReceiveAmount(prev => prev + 50);
              }
            }}
            className="ml-auto text-xs text-[#9FE870] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Increment +50
          </button>
        </div>
      </div>

      {/* Comparisons Panel */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <span className="text-[11px] font-bold text-[#5A7A5A] uppercase tracking-wider flex items-center gap-1.5">
              {ratesLoading ? (
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              ) : ratesError ? (
                <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
              ) : (
                <span className="inline-block w-2 h-2 rounded-full bg-[#9FE870] animate-pulse"></span>
              )}
              {ratesLoading ? "Connecting Live Rates Index..." : ratesError ? "Using baseline offline indices" : `Live Rates Active • USD/ZAR Rate: ${liveRates?.ZAR?.toFixed(2) || "18.25"} (Synced ${lastUpdated})`}
            </span>
            <h4 className="text-white text-base font-bold uppercase tracking-wide">
              {calculationMode === "SEND_MODE" ? "Calculated Returns Index" : "Sender Cost Index"} ({results.length})
            </h4>
          </div>
          <p className="text-xs text-[#5A7A5A] hidden sm:block">
            Sort: <span className="text-[#9FE870] font-semibold">{calculationMode === "SEND_MODE" ? "Most Received Descending" : "Minimum Wallet Cost Ascending"}</span>
          </p>
        </div>

        {results.map((res, idx) => {
          const savings = getSavings(res);
          const paySym = getPayoutSymbol(destinationType);

          return (
            <div
              key={res.provider.id}
              className={`p-5 rounded-2xl border transition relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                res.isCheapest
                  ? "bg-gradient-to-r from-[#112811] to-[#111811] border-[#9FE870] shadow-md shadow-[#9FE870]/5"
                  : "bg-[#111811] border-[#1E3A1E] hover:border-[#1E3A1E]/80"
              }`}
            >
              {/* Highlight ribbon for best rate */}
              {res.isCheapest && (
                <span className="absolute top-0 left-0 bg-[#9FE870] text-[#0A0F0A] text-[9px] font-extrabold uppercase px-3 py-1 rounded-br-lg tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> {calculationMode === "SEND_MODE" ? "Best Exchange Deal" : "Cheapest Out-of-Pocket Cost"}
                </span>
              )}

              {/* Provider Info */}
              <div className="md:col-span-3 pt-2 md:pt-0 max-w-[240px]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#0A0F0A] border border-[#1E3A1E] rounded-xl flex items-center justify-center text-lg shadow-sm">
                    {res.provider.logo}
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-white text-lg flex items-center gap-2">
                      {res.provider.name}
                      {res.isFastest && (
                        <span className="text-[9px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 fill-current" /> Instant
                        </span>
                      )}
                    </h5>
                    <p className="text-xs text-[#5A7A5A] leading-tight line-clamp-1">
                      {res.provider.tagline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Exchange rates & Fees info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                <div>
                  <span className="text-[10px] text-[#5A7A5A] uppercase tracking-wider block">Transfer Fee & Margin</span>
                  <div className="text-xs font-semibold text-[#9AAA9A] mt-0.5">
                    {activeOrigin.symbol} {res.fee} <span className="text-[9px] text-[#5A7A5A]">({(res.provider.feePercent * 100).toFixed(1)}%)</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#5A7A5A] uppercase tracking-wider block">Equivalent Rate</span>
                  <div className="text-xs font-semibold text-[#9AAA9A] mt-0.5 font-mono">
                    1 {originCode} = {res.exchangeRate} {res.receiveCurrency}
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <span className="text-[10px] text-[#5A7A5A] uppercase tracking-wider block">Speed & Outlets</span>
                  <div className="text-xs font-semibold text-[#F0F0E8] mt-0.5 flex items-center gap-1">
                    ⏱️ {res.provider.speed}
                  </div>
                </div>
              </div>

              {/* Receiver / Sender Amount block */}
              <div className="md:col-span-3 text-left md:text-right border-t md:border-t-0 border-[#1c2c1c] pt-4 md:pt-0 flex md:flex-col justify-between items-center md:items-end flex-wrap gap-2">
                <div>
                  {calculationMode === "SEND_MODE" ? (
                    <>
                      <span className="text-[10px] text-[#5A7A5A] uppercase tracking-wider block">Receiver Gets</span>
                      <div className="text-xl font-black text-[#9FE870] mt-0.5 font-mono">
                        {paySym === "$" ? "$" : ""}{res.receiveAmount.toLocaleString()} {res.receiveCurrency === "ZiG" ? "ZiG" : ""}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-amber-400/90 uppercase tracking-wider block">You Pay in {originCode}</span>
                      <div className="text-xl font-black text-[#9FE870] mt-0.5 font-mono">
                        {activeOrigin.symbol}{res.sendAmount.toLocaleString()}
                      </div>
                    </>
                  )}
                  {savings > 0 && (
                    <span className="text-[10px] text-[#9FE870]/80 block font-semibold mt-0.5">
                      {calculationMode === "SEND_MODE" 
                        ? `🔥 Saves family ${paySym === "$" ? "$" : ""}${savings.toFixed(2)} ${res.receiveCurrency === "ZiG" ? "ZiG" : ""}`
                        : `🔥 Pocket savings of ${activeOrigin.symbol}${savings.toFixed(2)}`
                      }
                    </span>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSelectedDetail(res)}
                    className="text-xs text-white hover:text-[#9FE870] px-3.5 py-1.5 rounded-lg border border-[#1E3A1E] hover:border-[#9FE870]/30 transition uppercase font-bold tracking-wider cursor-pointer"
                  >
                    View Places
                  </button>
                  <a
                    href={res.provider.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-[#9FE870] text-[#0A0F0A] hover:bg-opacity-95 px-4 py-2 rounded-full font-extrabold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
                  >
                    Send <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {results.length === 0 && (
          <div className="bg-[#0A0F0A]/40 border border-[#1E3A1E] rounded-xl py-12 text-center text-[#5A7A5A] text-sm leading-relaxed">
            ⚠️ No provider found for this specific combo. Try selecting USD Cash pick-up.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111811] border border-[#2A5A2A] rounded-2xl p-6 max-w-lg w-full relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 text-[#5A7A5A] hover:text-[#9FE870] p-1.5 rounded-full hover:bg-[#0A0F0A] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 border-b border-[#1E3A1E] pb-4 mb-4">
              <span className="text-3xl p-1 bg-[#0A0F0A] border border-[#1E3A1E] rounded-xl">{selectedDetail.provider.logo}</span>
              <div>
                <h4 className="font-sans text-xl font-bold text-white flex items-center gap-2">
                  {selectedDetail.provider.name} Payout Network
                </h4>
                <p className="text-xs text-[#5A7A5A]">Local cash collection spots in Zimbabwe</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-sm text-[#9AAA9A] leading-relaxed font-sans">
              <div>
                <span className="text-[11px] font-extrabold text-[#5A7A5A] uppercase tracking-wider block mb-1">Guaranteed Pickup Partners:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedDetail.provider.pickupPartners.map((pt: string, i: number) => (
                    <span key={i} className="text-xs bg-[#0A0F0A] border border-[#1E3A1E] text-white py-1 px-3 rounded-md">
                      🏬 {pt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A0F0A] border border-[#1E3A1E] rounded-xl p-4">
                <span className="text-xs font-bold text-[#9FE870] uppercase block mb-1 font-sans">Remittance Speed & Service:</span>
                <p className="text-xs text-[#9AAA9A] leading-normal font-sans">
                  Transfers are settled typically in <b className="text-[#9FE870]">{selectedDetail.provider.speed}</b>. For physical USD cash pickups, recipient receives full US Dollars. Standard government taxes may apply but no hidden collection fees can be charged directly to the recipient.
                </p>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-1.5 text-xs text-amber-300 font-sans">
                <span className="font-bold uppercase block">📋 Recipient Collection Mandates:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Original National ID card or passport matching specified receiver details.</li>
                  <li>Original numeric reference numbers (Transfer PIN) provided by sender.</li>
                  <li>Available pick-up is weekdays 8:00 AM - 4:30 PM & Saturdays 8:00 AM - 1:00 PM.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#1E3A1E] pt-4 mt-5">
              <div>
                <span className="text-[10px] text-[#5A7A5A] uppercase block">Total Payout</span>
                <span className="text-base text-[#9FE870] font-black font-mono">
                  {getPayoutSymbol(destinationType) === "$" ? "$" : ""}{selectedDetail.receiveAmount.toLocaleString()} {selectedDetail.receiveCurrency === "ZiG" ? "ZiG" : ""}
                </span>
              </div>
              <div className="flex gap-2 font-sans">
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="px-4 py-2 bg-transparent text-[#9AAA9A] font-bold text-xs uppercase hover:text-white"
                >
                  Close
                </button>
                <a
                  href={selectedDetail.provider.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-[#9FE870] text-[#0A0F0A] hover:bg-opacity-90 font-extrabold text-xs uppercase rounded-full tracking-wider transition cursor-pointer"
                >
                  Send Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
