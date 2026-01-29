export type Transaction = {
  id: string;
  type: "earn" | "convert-to-usd" | "convert-to-ghs" | "withdraw";
  amount: number;
  currency: "BC" | "USD" | "GHS";
  date: string;
  description: string;
  userId?: string;
};

export type UserProfile = {
  id: string;
  googleId: string;
  email: string;
  displayName: string;
  creationDate: string;
  bullCoinBalance: number;
  usdBalance: number;
  ghsBalance: number;
};

export type DailyStepCount = {
  id: string;
  userId: string;
  date: string;
  stepCount: number;
};
