
export type Goal = {
  name: string;
  steps: number;
  reward: number;
};

export type Transaction = {
  id: string;
  type: "earn" | "convert-to-usd" | "convert-to-ghs" | "withdraw";
  amount: number;
  currency: "BC" | "USD" | "GHS";
  date: string;
  description: string;
  userId?: string;
};

export type PayoutMethod = "momo" | "bank" | "card";

export type PayoutDetails = {
  method: PayoutMethod;
  accountName: string;
  // MoMo
  momoNumber?: string;
  momoNetwork?: string;
  // Bank
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  // Card
  authorizationCode?: string;
};

export type UserProfile = {
  id: string;
  googleId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  creationDate: string;
  bullCoinBalance: number;
  usdBalance: number;
  ghsBalance: number;
  dailyGoals?: Goal[];
  payoutDetails?: PayoutDetails;
};
