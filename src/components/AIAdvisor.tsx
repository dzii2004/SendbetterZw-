import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, Brain, HelpCircle, ArrowRight } from "lucide-react";
import { ChatMessage } from "../types";

const SUGGESTIONS = [
  "Which is cheapest from South Africa?",
  "How does EcoCash vs USD Cash Pickup work?",
  "Is Wise faster than WorldRemit?",
  "What pick-up partners operate in Mutare?",
  "What is the current ZiG conversion rate?"
];

export function AIAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      role: "model",
      text: "Makadii! 👋 I am your SendBetter ZW Remittance Assistant. I analyze exchange rates, fees, pickup speeds, and location coverage to get you the absolute best deals sending money to Zimbabwe from SA, UK, US, Australia, or Botswana. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setSending(true);

    try {
      // Package messages for endpoint
      const currentConversation = [...messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentConversation })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          role: "model",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || "Advisor took a quick break.");
      }
    } catch (err: any) {
      console.error("AI Advisor consultation error:", err);
      
      // Smart local static response fallback in case of missing keys
      let fallbackText = "I had trouble parsing that suggestion from my main brain. But here is some useful info:\n\nIf you are sending from **South Africa (ZAR)**, **Mukuru** & **Innbucks** are widely recommended for cash pick-up. Mukuru starts at extremely competitive rates and has 250+ orange booths countrywide outside OK Supermarkets and Spar outlets. \n\nIf sending from the **UK (GBP)** or **USA/Europe (USD)**, **Wise** and **WorldRemit** provide stellar digital rates. Wisely verify bank transfer fees first for maximum savings!";
      
      // Customize fallback based on terms in search
      const lowered = textToSend.toLowerCase();
      if (lowered.includes("south africa") || lowered.includes("zar") || lowered.includes("rand")) {
        fallbackText = "Sending from **South Africa (ZAR)** to Zimbabwe:\n- **Mukuru**: Super reliable cash pickup at OK/Spar/Booths. Fees are approx 1.5% to 2% flat.\n- **Innbucks**: Best for smaller microremittances, sending USD to be collected at Chicken Inn / Simbisa fast food spots.\n- **Mama Money**: High utility regional player.";
      } else if (lowered.includes("payout") || lowered.includes("pickup") || lowered.includes("spot") || lowered.includes("mutare") || lowered.includes("harare")) {
        fallbackText = "Popular cash pickup points across Zimbabwe cities (Harare, Bulawayo, Gweru, Mutare, etc.):\n1. **Mukuru / WorldRemit**: Collected at OK Supermarkets, TM Pick n Pay, Metro Peech, Spar, or Mukuru booths.\n2. **Innbucks**: Collected at Simbisa Brands outlets (Chicken Inn, Pizza Inn, Creamy Inn, Bakers Inn).\n3. **Western Union**: Collected at Zimpost Post Offices, Easylink bureaus, and banks.";
      } else if (lowered.includes("zig")) {
        fallbackText = "Remitting ZiG (Zimbabwe Gold) directly in mobile money (EcoCash) is supported by major corridors such as TapTap Send or WorldRemit. But most families back home still highly prefer **USD cash pick-up** due to local store discounts in physical commercial shops.";
      }

      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        role: "model",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#111811] border border-[#1E3A1E] rounded-2xl p-6 shadow-xl flex flex-col h-[520px]" id="advisor-section">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E3A1E] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#9FE870]/10 border border-[#9FE870]/30 text-[#9FE870] rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans text-lg font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              ZW Diaspora AI Advisor <Sparkles className="w-3.5 h-3.5 text-[#9FE870] animate-pulse" />
            </h3>
            <p className="text-xs text-[#5A7A5A]">Remittance guidelines powered by Gemini AI</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#2A5A2A]/20 border border-[#1E3A1E] rounded-full text-[10px] text-[#9FE870]">
          <span className="w-1.5 h-1.5 bg-[#9FE870] rounded-full animate-ping"></span>
          Diagnostic Brain Active
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 custom-scrollbar text-sm"
      >
        {messages.map((m) => {
          const isBot = m.role === "model";
          return (
            <div 
              key={m.id} 
              className={`flex gap-3 max-w-[85%] ${isBot ? "self-start" : "ml-auto flex-row-reverse"}`}
            >
              <div className={`p-2.5 rounded-xl h-9 w-9 flex items-center justify-center flex-shrink-0 border uppercase font-mono text-[10px] ${
                isBot 
                  ? "bg-[#1E3A1E]/30 border-[#1E3A1E] text-[#9FE870]" 
                  : "bg-[#9FE870]/20 border-[#9FE870]/30 text-white"
              }`}>
                {isBot ? "AI" : <User className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  isBot 
                    ? "bg-[#0A0F0A] text-[#9AAA9A] rounded-tl-none border border-[#1C2C1C]" 
                    : "bg-[#9FE870] text-[#0A0F0A] rounded-tr-none font-medium"
                }`}>
                  {m.text}
                </div>
                <span className="text-[9px] text-[#5A7A5A] block px-1.5">{m.timestamp}</span>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="bg-[#1E3A1E]/30 border border-[#1E3A1E] text-[#9FE870] p-2.5 rounded-xl h-9 w-9 flex items-center justify-center animate-spin">
              💫
            </div>
            <div className="bg-[#0A0F0A] text-[#5A7A5A] p-4 rounded-2xl rounded-tl-none border border-[#1C2C1C] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#9FE870] rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-[#9FE870] rounded-full animate-bounce delay-200"></span>
              <span className="w-1.5 h-1.5 bg-[#9FE870] rounded-full animate-bounce delay-300"></span>
              <span className="text-xs">Consulting smart metrics...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Bubbles */}
      {messages.length === 1 && (
        <div className="mb-4">
          <span className="text-[10px] text-[#5A7A5A] font-medium block mb-2 uppercase tracking-wide flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Popular Questions Checklist:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="text-xs bg-[#0A0F0A] hover:bg-[#1E3A1E]/30 text-[#9AAA9A] hover:text-white border border-[#1E3A1E] hover:border-[#9FE870]/50 px-3 py-1.5 rounded-full transition text-left cursor-pointer"
              >
                {s} <ArrowRight className="w-2.5 h-2.5 inline ml-1.5 text-[#9FE870]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(userInput);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask about Western Union fees, EcoCash agents, Mukuru Booths..."
          className="flex-1 bg-[#0A0F0A] border border-[#1E3A1E] rounded-full py-3 px-5 text-sm text-[#F0F0E8] placeholder-[#5A7A5A] focus:outline-none focus:border-[#9FE870] transition"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="bg-[#9FE870] text-[#0A0F0A] hover:bg-opacity-90 h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 transition disabled:opacity-50 cursor-pointer hover:shadow-lg"
          disabled={!userInput.trim() || sending}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
