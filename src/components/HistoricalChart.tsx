import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, ArrowRight, DollarSign } from "lucide-react";
import { HISTORIC_DATA } from "../data";

export function HistoricalChart() {
  const [activeMetric, setActiveMetric] = useState<"ZAR" | "GBP" | "USD_to_ZiG">("ZAR");

  const getMetricDetails = () => {
    switch(activeMetric) {
      case "ZAR":
        return {
          title: "ZAR to USD Conversion Trend",
          desc: "How many Rands (ZAR) buy 1 US Dollar for cash pickups in Zimbabwe",
          color: "#9FE870",
          symbol: "R"
        };
      case "GBP":
        return {
          title: "GBP to USD Conversion Trend",
          desc: "How many British Pounds (GBP) buy 1 US Dollar for cash pickups",
          color: "#3b82f6",
          symbol: "£"
        };
      case "USD_to_ZiG":
        return {
          title: "USD to ZiG Interbank Market Trend",
          desc: "Interbank indicative exchange rate of 1 US Dollar to Zimbabwe Gold (ZiG)",
          color: "#fbbf24",
          symbol: "ZiG"
        };
    }
  };

  const currentMetric = getMetricDetails();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111811] border border-[#1E3A1E] p-3 rounded-lg shadow-lg">
          <p className="text-xs text-[#5A7A5A] font-medium">{label}</p>
          <p className="font-bold text-[#F0F0E8] text-sm mt-1">
            Exchange Rate:{" "}
            <span style={{ color: currentMetric.color }}>
              {currentMetric.symbol === "ZiG" ? "" : "1 USD = "}
              {payload[0].value} {currentMetric.symbol}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111811] border border-[#1E3A1E] rounded-2xl p-6 shadow-xl" id="trends-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#9FE870] font-bold uppercase tracking-widest mb-1.5Packed">
            <TrendingUp className="w-4 h-4" /> Live Rates Trend Index
          </div>
          <h3 className="font-sans text-xl font-bold text-white uppercase tracking-wider">Historical Corridors</h3>
          <p className="text-xs text-[#5A7A5A] mt-0.5">{currentMetric.desc}</p>
        </div>

        {/* Currency Switcher buttons */}
        <div className="flex gap-2 bg-[#0A0F0A] p-1 border border-[#1E3A1E] rounded-xl self-start">
          <button
            onClick={() => setActiveMetric("ZAR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeMetric === "ZAR"
                ? "bg-[#9FE870] text-[#0A0F0A]"
                : "text-[#9AAA9A] hover:text-white"
            }`}
          >
            🇿🇦 ZAR → USD
          </button>
          <button
            onClick={() => setActiveMetric("GBP")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeMetric === "GBP"
                ? "bg-[#9FE870] text-[#0A0F0A]"
                : "text-[#9AAA9A] hover:text-white"
            }`}
          >
            🇬🇧 GBP → USD
          </button>
          <button
            onClick={() => setActiveMetric("USD_to_ZiG")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeMetric === "USD_to_ZiG"
                ? "bg-[#9FE870] text-[#0A0F0A]"
                : "text-[#9AAA9A] hover:text-white"
            }`}
          >
            🇿🇼 USD → ZiG
          </button>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={HISTORIC_DATA}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.001}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#132313" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#5A7A5A" 
              fontSize={10} 
              tickLine={false}
              axisLine={{ stroke: "#1E3A1E" }}
            />
            <YAxis 
              stroke="#5A7A5A" 
              fontSize={10} 
              tickLine={false}
              axisLine={{ stroke: "#1E3A1E" }}
              domain={activeMetric === "USD_to_ZiG" ? [20, 26] : activeMetric === "GBP" ? [0.75, 0.82] : [17.5, 19]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={currentMetric.color} 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#metricGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Info Stats about current trending rate */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#132313] pt-4">
        <div>
          <div className="text-[10px] text-[#5A7A5A] uppercase tracking-wider">Latest Indicative Rate</div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
            1 USD ≈{" "}
            <span style={{ color: currentMetric.color }}>
              {HISTORIC_DATA[HISTORIC_DATA.length - 1][activeMetric]} {currentMetric.symbol}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[#5A7A5A] uppercase tracking-wider">30-Day Rate Trend</div>
          <div className="text-sm font-bold text-[#9FE870] flex items-center gap-1.5 mt-0.5">
            ↗ Bullish / Steady
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="text-[10px] text-[#5A7A5A] uppercase tracking-wider">Best Sender Channel</div>
          <div className="text-sm font-bold text-[#F0F0E8] mt-0.5">
            {activeMetric === "ZAR" ? "Mukuru / Innbucks" : "Wise / TapTap Send"}
          </div>
        </div>
      </div>
    </div>
  );
}
