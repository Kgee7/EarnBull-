export type Transaction = {
  id: string;
  type: "earn" | "convert-to-usd" | "convert-to-ghs" | "withdraw";
  amount: number;
  currency: "BC" | "USD" | "GHS";
  date: string;
  description: string;
};
