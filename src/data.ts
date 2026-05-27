import { Provider, OriginCurrency, HistoricRatePoint } from "./types";

export const PROVIDERS: Provider[] = [
  {
    id: "wise",
    name: "Wise",
    logo: "⚡",
    tagline: "Unbeatable market rates & transparent fees",
    bestFor: "Best Exchange Rates",
    supportedOrigins: ["USD", "ZAR", "GBP", "AUD", "CAD"],
    supportedDestinations: ["USD_WALLET", "ZIG_BANK"],
    rateModifier: 0.996, // 0.4% markup
    baseFee: 1.50, // USD equivalent
    feePercent: 0.005, // 0.5% fee
    speed: "2-12 Hours",
    pickupPartners: ["Steward Bank", "EcoCash", "Direct Bank Account"],
    url: "https://wise.com/invite/mrhc/blessingd114"
  },
  {
    id: "mukuru",
    name: "Mukuru",
    logo: "🦁",
    tagline: "The trusted giant for southern Africa diaspora",
    bestFor: "Easiest Cash Pickup",
    supportedOrigins: ["ZAR", "GBP", "BWP", "USD"],
    supportedDestinations: ["USD_CASH", "USD_WALLET"],
    rateModifier: 0.965, // 3.5% markup
    baseFee: 2.00,
    feePercent: 0.015, // 1.5% fee for cash administration
    speed: "Instant Cash Pickup",
    pickupPartners: ["Mukuru Booths", "OK Supermarkets", "Spar", "Metro Peech", "N. Richards"],
    url: "https://www.mukuru.com"
  },
  {
    id: "worldremit",
    name: "WorldRemit",
    logo: "🌍",
    tagline: "Send straight to mobile wallets or cash pickup",
    bestFor: "Fast Wallet Streams",
    supportedOrigins: ["USD", "ZAR", "GBP", "AUD", "CAD", "BWP"],
    supportedDestinations: ["USD_CASH", "ZIG_WALLET"],
    rateModifier: 0.972, // 2.8% markup
    baseFee: 2.99,
    feePercent: 0.008,
    speed: "5-10 Minutes",
    pickupPartners: ["Steward Bank", "CBZ Bank", "Quest Financial", "EcoCash Agent", "BancABC"],
    url: "https://www.worldremit.com"
  },
  {
    id: "innbucks",
    name: "Innbucks",
    logo: "🏦",
    tagline: "Zimbabwe's native low-cost wallet app",
    bestFor: "Micro-Transfers",
    supportedOrigins: ["ZAR", "USD", "GBP"],
    supportedDestinations: ["USD_WALLET", "USD_CASH"],
    rateModifier: 0.962, // 3.8% markup
    baseFee: 1.00,
    feePercent: 0.01, // 1% fee
    speed: "Instant Payout",
    pickupPartners: ["Simoza", "Chicken Inn", "Pizza Inn", "Bakers Inn", "Creamy Inn"],
    url: "https://innbucks.co.zw"
  },
  {
    id: "westernunion",
    name: "Western Union",
    logo: "💛",
    tagline: "Largest agent network across town & growth point",
    bestFor: "Rural Coverage",
    supportedOrigins: ["USD", "ZAR", "GBP", "BWP", "AUD", "CAD"],
    supportedDestinations: ["USD_CASH", "ZIG_BANK"],
    rateModifier: 0.952, // 4.8% markup
    baseFee: 3.99,
    feePercent: 0.02,
    speed: "Instant Pickup",
    pickupPartners: ["Easylink Booths", "Zimpost Offices", "CBZ", "BancABC", "CABS Bank", "Stanbic"],
    url: "https://www.westernunion.com"
  },
  {
    id: "taptapsend",
    name: "TapTap Send",
    logo: "📲",
    tagline: "Zero fee & super fast transfers from pocket app",
    bestFor: "Mobile Simplicity",
    supportedOrigins: ["GBP", "USD", "CAD"],
    supportedDestinations: ["USD_CASH", "ZIG_WALLET"],
    rateModifier: 0.975, // 2.5% markup
    baseFee: 0.00, // 0 fee promotion
    feePercent: 0.012,
    speed: "Instant to Ecocash",
    pickupPartners: ["EcoCash Wallet", "Mukuru Booths (Partner)", "Refund points"],
    url: "https://www.taptapsend.com"
  }
];

export const ORIGIN_CURRENCIES: OriginCurrency[] = [
  {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    flag: "🇿🇦",
    baseExchangeRateToUSD: 18.25, // 18.25 ZAR per 1 USD
    popularAmounts: [500, 1000, 2000, 5000]
  },
  {
    code: "GBP",
    symbol: "£",
    name: "United Kingdom Pound",
    flag: "🇬🇧",
    baseExchangeRateToUSD: 0.78, // 0.78 GBP per 1 USD
    popularAmounts: [50, 100, 200, 500]
  },
  {
    code: "USD",
    symbol: "$",
    name: "United States Dollar",
    flag: "🇺🇸",
    baseExchangeRateToUSD: 1.00, // 1 USD per 1 USD
    popularAmounts: [100, 250, 500, 1000]
  },
  {
    code: "BWP",
    symbol: "P",
    name: "Botswana Pula",
    flag: "🇧🇼",
    baseExchangeRateToUSD: 13.45, // 13.45 BWP per 1 USD
    popularAmounts: [200, 500, 1000, 3000]
  },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    baseExchangeRateToUSD: 1.49, // 1.49 AUD per 1 USD
    popularAmounts: [100, 200, 500, 1000]
  },
  {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    baseExchangeRateToUSD: 1.37, // 1.37 CAD per 1 USD
    popularAmounts: [100, 200, 500, 1000]
  }
];

// Current Interbank Gold-backed ZiG rate is around 1 USD = 24.5 ZiG (approximate 2026 indicative/market rate)
export const ZIG_BASE_RATE_PER_USD = 24.5;

export const HISTORIC_DATA: HistoricRatePoint[] = [
  { date: "May 01", ZAR: 18.60, GBP: 0.79, USD_to_ZiG: 23.5 },
  { date: "May 05", ZAR: 18.52, GBP: 0.78, USD_to_ZiG: 23.8 },
  { date: "May 10", ZAR: 18.45, GBP: 0.78, USD_to_ZiG: 24.1 },
  { date: "May 15", ZAR: 18.33, GBP: 0.77, USD_to_ZiG: 24.3 },
  { date: "May 20", ZAR: 18.28, GBP: 0.78, USD_to_ZiG: 24.4 },
  { date: "May 25", ZAR: 18.25, GBP: 0.78, USD_to_ZiG: 24.5 },
  { date: "May 27", ZAR: 18.25, GBP: 0.78, USD_to_ZiG: 24.5 }
];

export function calculateRemittance({
  sendAmount,
  originCode,
  destinationType,
  liveRates
}: {
  sendAmount: number;
  originCode: string;
  destinationType: "USD_CASH" | "USD_WALLET" | "ZIG_WALLET" | "ZIG_BANK";
  liveRates?: Record<string, number>;
}): any[] {
  const origin = ORIGIN_CURRENCIES.find(c => c.code === originCode) || ORIGIN_CURRENCIES[0];
  
  // Use live rates or standard baseline
  const rateToUSD = liveRates && liveRates[originCode] ? liveRates[originCode] : origin.baseExchangeRateToUSD;
  const zigRate = liveRates && liveRates["ZIG"] ? liveRates["ZIG"] : ZIG_BASE_RATE_PER_USD;

  // Calculate raw USD amount being sent from origin currency
  const sentAmountInUSD = sendAmount / rateToUSD;

  const results = PROVIDERS.filter(p => {
    // 1. Must support the origin currency
    const supportsOrigin = p.supportedOrigins.includes(originCode);
    // 2. Must support the requested destination payout type
    const supportsDestination = p.supportedDestinations.includes(destinationType);
    return supportsOrigin && supportsDestination;
  }).map(p => {
    // Fees are determined relative to origin currency equivalent or dollar base
    const baseFeeInOrigin = p.baseFee * rateToUSD;
    const percentageFee = sendAmount * p.feePercent;
    const fee = baseFeeInOrigin + percentageFee;

    // Remaining transfer amount after fees
    const sendAmountAfterFees = sendAmount - fee;
    
    let receiveAmount = 0;
    let exchangeRate = 0;
    let receiveCurrency: "USD" | "ZiG" = "USD";

    // Standard market rate: e.g. ZAR -> USD
    // Provider exchange rate = baseMarketRate * providerRateModifier
    if (destinationType === "USD_CASH" || destinationType === "USD_WALLET") {
      receiveCurrency = "USD";
      // Convert to USD after deducting fees in origin currency
      if (sendAmountAfterFees <= 0) {
        receiveAmount = 0;
      } else {
        // Exchange rate from origin to USD
        const providerUSDExchangeRate = (1 / rateToUSD) * p.rateModifier;
        receiveAmount = sendAmountAfterFees * providerUSDExchangeRate;
        exchangeRate = providerUSDExchangeRate;
      }
    } else {
      // ZiG Wallet or ZiG Bank
      receiveCurrency = "ZiG";
      if (sendAmountAfterFees <= 0) {
        receiveAmount = 0;
      } else {
        // Convert origin to USD, then USD to ZiG
        const providerUSDExchangeRate = (1 / rateToUSD) * p.rateModifier;
        const sendAmountInUSDSub = sendAmountAfterFees * providerUSDExchangeRate;
        receiveAmount = sendAmountInUSDSub * zigRate;
        exchangeRate = providerUSDExchangeRate * zigRate;
      }
    }

    let payoutMethodName = "";
    if (destinationType === "USD_CASH") payoutMethodName = "USD Cash Pick-up";
    else if (destinationType === "USD_WALLET") payoutMethodName = "USD Mobile Wallet (Innbucks/EcoCash)";
    else if (destinationType === "ZIG_WALLET") payoutMethodName = "ZiG Mobile Money (EcoCash)";
    else if (destinationType === "ZIG_BANK") payoutMethodName = "ZiG Direct Bank Deposit";

    return {
      provider: p,
      sendAmount,
      sendCurrency: originCode,
      receiveAmount: Math.max(0, parseFloat(receiveAmount.toFixed(2))),
      receiveCurrency,
      fee: parseFloat(fee.toFixed(2)),
      exchangeRate: parseFloat(exchangeRate.toFixed(4)),
      speed: p.speed,
      payoutMethodName,
      isCheapest: false, // will calculate below
      isFastest: p.speed.toLowerCase().includes("instant") || p.speed.toLowerCase().includes("minute"),
    };
  });

  // Sort by received amount descending (most received is the best rate)
  results.sort((a,b) => b.receiveAmount - a.receiveAmount);

  if (results.length > 0) {
    // Set cheapest
    results[0].isCheapest = true;
  }

  return results;
}
