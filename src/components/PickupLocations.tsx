import React, { useState } from "react";
import { Search, MapPin, Building, Info } from "lucide-react";

interface PickupPartner {
  name: string;
  type: string;
  count: string;
  locations: string[];
}

const PARTNERS: PickupPartner[] = [
  {
    name: "Mukuru Orange Booths",
    type: "Dedicated Agent",
    count: "250+ Booths Countrywide",
    locations: ["Harare (CBD, Mbare, Highfield)", "Bulawayo (CBD, Jason Moyo St)", "Gweru", "Mutare", "Masvingo", "Zvishavane", "Plumtree", "Beitbridge", "Nkayi", "Gokwe"]
  },
  {
    name: "OK Supermarkets / OK Mart",
    type: "Retail Partner (Mukuru, WorldRemit)",
    count: "60+ Outlets",
    locations: ["Harare (First Street, Fife Avenue, Machipisa)", "Bulawayo (Jason Moyo)", "Mutare", "Gweru", "Masvingo", "Chinhoyi", "Kwekwe", "Marondera", "Zvishavane"]
  },
  {
    name: "Innbucks at Chicken Inn Outlets",
    type: "Simoza / Simbisa Outlets",
    count: "150+ Simbisa Counters",
    locations: ["Harare (Belgravia, Speke Ave, Avondale)", "Bulawayo (Fort St)", "Gweru", "Chitungwiza", "Victoria Falls", "Hwange", "Mutare", "Masvingo", "Beitbridge"]
  },
  {
    name: "Easylink / Zimpost",
    type: "Western Union Dedicated",
    count: "120+ Outlets",
    locations: ["All major Zimpost Post Offices (Harare Main, Bulawayo Main, Gweru Main)", "Easylink Branches inside Banks & Malls"]
  },
  {
    name: "Steward Bank",
    type: "Bank Agent (Wise, WorldRemit)",
    count: "35+ Commercial Branches",
    locations: ["Harare (Avondale, Joina City, Eastgate)", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Chitungwiza", "Victoria Falls"]
  },
  {
    name: "CBZ Bank",
    type: "Bank Agent (Western Union, WorldRemit)",
    count: "60+ National Branches",
    locations: ["Harare (Kwame Nkrumah, Selous)", "Bulawayo (Fife St)", "Mutare", "Gweru", "Masvingo", "Kariba", "Gwanda", "Beitbridge"]
  }
];

export function PickupLocations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<PickupPartner | null>(null);

  const filteredPartners = PARTNERS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.locations.some(loc => loc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#111811] border border-[#1E3A1E] rounded-2xl p-6 shadow-xl" id="locations-section">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-[#9FE870]/10 rounded-xl text-[#9FE870]">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-sans text-xl font-bold text-white uppercase tracking-wider">Zimbabwe Payout Networks</h3>
          <p className="text-xs text-[#5A7A5A]">Where your family can collect cash in USD & ZiG</p>
        </div>
      </div>

      <p className="text-sm text-[#9AAA9A] mb-5 leading-relaxed">
        Remittances are picked up in **physical USD cash** at most booths, retail networks, and chicken outlets across Zimbabwe. Click on a partner to find their locations.
      </p>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#5A7A5A]" />
        <input
          type="text"
          placeholder="Search by city (e.g. Masvingo, Mutare, Gweru) or partner name..."
          className="w-full bg-[#0A0F0A] border border-[#1E3A1E] rounded-xl py-3 pl-11 pr-4 text-sm text-[#F0F0E8] placeholder-[#5A7A5A] focus:outline-none focus:border-[#9FE870] transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredPartners.map((partner, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPartner(partner)}
              className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
                selectedPartner?.name === partner.name
                  ? "bg-[#9FE870]/10 border-[#9FE870] text-white"
                  : "bg-[#0A0F0A] border-[#1E3A1E] text-[#9AAA9A] hover:border-[#9FE870]/40"
              }`}
            >
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#9FE870]" />
                  {partner.name}
                </div>
                <div className="text-xs text-[#5A7A5A] mt-1">{partner.count}</div>
              </div>
              <span className="text-[10px] bg-[#1E3A1E] text-[#9FE870] px-2 py-0.5 rounded font-mono">
                {partner.type.split(" ")[0]}
              </span>
            </button>
          ))}
          {filteredPartners.length === 0 && (
            <div className="text-center py-8 text-xs text-[#5A7A5A]">
              No partner networks found for "{searchQuery}". Try searching "OK" or "Chicken".
            </div>
          )}
        </div>

        {/* Right Side: Selected Partner Details */}
        <div className="bg-[#0A0F0A]/55 border border-[#1E3A1E]/80 rounded-xl p-5 flex flex-col justify-between min-h-[220px]">
          {selectedPartner ? (
            <div>
              <div className="flex justify-between items-start border-b border-[#1E3A1E] pb-3 mb-3">
                <div>
                  <h4 className="font-bold text-[#9FE870] text-base">{selectedPartner.name}</h4>
                  <p className="text-xs text-[#5A7A5A] mt-0.5">{selectedPartner.type}</p>
                </div>
                <div className="text-xs text-[#9FE870] px-2.5 py-1 bg-[#9FE870]/10 rounded-full font-bold">
                  {selectedPartner.count.split(" ")[0]} Payouts
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs text-[#5A7A5A] font-medium block mb-2">Popular Collection Spots:</span>
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {selectedPartner.locations.map((loc, i) => (
                    <span key={i} className="text-xs bg-[#111811] border border-[#1E3A1E] text-[#F0F0E8] px-2.5 py-1 rounded-md">
                      📍 {loc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Info className="w-8 h-8 text-[#5A7A5A] mb-2" />
              <p className="text-sm text-[#9AAA9A]">Select any payout network on the left to see popular locations and cities in Zimbabwe.</p>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-[#1E3A1E]/30 text-[11px] text-[#5A7A5A] flex items-center gap-1.5">
            💡 <span className="italic">Pro-tip: Always have original ID or passport and the Transfer PIN code ready for collection.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
