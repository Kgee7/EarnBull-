
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

export type PayoutDetails = {
  accountName: string;
  momoNumber: string;
  momoNetwork: string;
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
