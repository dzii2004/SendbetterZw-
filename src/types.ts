export interface Provider {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  bestFor: string;
  supportedOrigins: string[]; // e.g. ["USD", "ZAR", "GBP", "BWP", "AUD", "CAD"]
  supportedDestinations: ("USD_CASH" | "USD_WALLET" | "ZIG_WALLET" | "ZIG_BANK")[];
  rateModifier: number; // relative modifier comparing to standard base rate
  baseFee: number; // base transfer fee
  feePercent: number; // additional percentage fee of transfer amount
  speed: string; // e.g., "Instant", "10-30 mins", "1-2 days"
  pickupPartners: string[]; // e.g., ["OK Supermarkets", "Booths", "Chicken Inn"]
  url: string;
}

export interface OriginCurrency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  baseExchangeRateToUSD: number; // e.g., 18.5 ZAR per 1 USD
  popularAmounts: number[];
}

export interface RemittanceResult {
  provider: Provider;
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: "USD" | "ZiG";
  fee: number;
  exchangeRate: number;
  speed: string;
  isCheapest: boolean;
  isFastest: boolean;
  payoutMethodName: string;
}

export interface HistoricRatePoint {
  date: string;
  ZAR: number;
  GBP: number;
  USD_to_ZiG: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface RateAlert {
  id: string;
  email: string;
  originCurrency: string;
  targetRate: number;
  payoutMethod: string;
  createdAt: string;
}
