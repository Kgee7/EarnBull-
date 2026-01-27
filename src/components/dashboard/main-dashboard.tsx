"use client";

import { useState, useEffect } from "react";
import { getUsdToGhsExchangeRate } from "@/ai/flows/usd-to-ghs-exchange";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { StatCards } from "@/components/dashboard/stat-cards";
import { StepSimulator } from "@/components/dashboard/step-simulator";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { ConversionCard } from "@/components/dashboard/conversion-card";
import { WithdrawCard } from "@/components/dashboard/withdraw-card";
import { Skeleton } from "@/components/ui/skeleton";

// Constants
const BC_PER_1000_STEPS = 10;
const USD_PER_10_BC = 0.15;
const MIN_WITHDRAWAL_USD = 1;

export function MainDashboard() {
  const { toast } = useToast();

  // State
  const [steps, setSteps] = useState(5678);
  const [bullCoins, setBullCoins] = useState(120.5);
  const [usdBalance, setUsdBalance] = useState(5.75);
  const [ghsBalance, setGhsBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: crypto.randomUUID(), type: "earn", amount: 50, currency: "BC", date: new Date(Date.now() - 86400000).toISOString(), description: "Walked 5000 steps" },
    { id: crypto.randomUUID(), type: "convert-to-usd", amount: -100, currency: "BC", date: new Date(Date.now() - 172800000).toISOString(), description: "Converted to $1.50 USD" },
    { id: crypto.randomUUID(), type: "earn", amount: 70.5, currency: "BC", date: new Date(Date.now() - 259200000).toISOString(), description: "Walked 7050 steps" },
  ]);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isRateLoading, setIsRateLoading] = useState(true);

  // Fetch exchange rate on mount
  useEffect(() => {
    async function fetchRate() {
      try {
        setIsRateLoading(true);
        const result = await getUsdToGhsExchangeRate();
        setExchangeRate(result.exchangeRate);
        if (!result.isUpToDate) {
          toast({
            title: "Exchange Rate Notice",
            description: "Using a cached USD to GHS exchange rate. The actual rate may vary.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        setExchangeRate(12.5); // Fallback rate
        toast({
          title: "Error",
          description: "Could not fetch the latest exchange rate. Using a default rate of $1 = GHS 12.5.",
          variant: "destructive",
        });
      } finally {
        setIsRateLoading(false);
      }
    }
    fetchRate();
  }, [toast]);

  // Handlers
  const handleStepUpdate = (newSteps: number) => {
    const stepDifference = newSteps - steps;
    if (stepDifference <= 0) return;

    const bcEarned = Math.floor(stepDifference / 1000) * BC_PER_1000_STEPS;
    if (bcEarned > 0) {
      const remainingSteps = stepDifference % 1000;
      setSteps(steps + stepDifference - remainingSteps);
      setBullCoins((prev) => prev + bcEarned);

      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: "earn",
        amount: bcEarned,
        currency: "BC",
        date: new Date().toISOString(),
        description: `Walked ${Math.floor(stepDifference / 1000) * 1000} steps`,
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      toast({
        title: "Rewards!",
        description: `You earned ${bcEarned} BC!`,
      });
    } else {
        setSteps(newSteps);
    }
  };

  const handleConvertToUsd = (bcAmount: number) => {
    if (bcAmount <= 0 || bcAmount > bullCoins) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount of Bull Coins to convert.", variant: "destructive" });
      return;
    }
    const usdEarned = (bcAmount / 10) * USD_PER_10_BC;
    setBullCoins((prev) => prev - bcAmount);
    setUsdBalance((prev) => prev + usdEarned);

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: "convert-to-usd",
      amount: -bcAmount,
      currency: "BC",
      date: new Date().toISOString(),
      description: `Converted to $${usdEarned.toFixed(2)} USD`,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    toast({ title: "Success", description: `Converted ${bcAmount} BC to $${usdEarned.toFixed(2)} USD.` });
  };
  
  const handleConvertToGhs = (usdAmount: number) => {
    if (!exchangeRate) {
       toast({ title: "Error", description: "Exchange rate not available.", variant: "destructive" });
       return;
    }
    if (usdAmount <= 0 || usdAmount > usdBalance) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount of USD to convert.", variant: "destructive" });
      return;
    }
    const ghsAmount = usdAmount * exchangeRate;
    setUsdBalance((prev) => prev - usdAmount);
    setGhsBalance((prev) => prev + ghsAmount);

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: "convert-to-ghs",
      amount: -usdAmount,
      currency: "USD",
      date: new Date().toISOString(),
      description: `Converted to GHS ${ghsAmount.toFixed(2)}`,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    toast({ title: "Success", description: `Converted $${usdAmount.toFixed(2)} to GHS ${ghsAmount.toFixed(2)}.` });
  };

  const handleWithdraw = (ghsAmount: number, momoNumber: string) => {
    if (ghsAmount <= 0 || ghsAmount > ghsBalance) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount to withdraw.", variant: "destructive" });
      return;
    }
    if (!/^\d{10}$/.test(momoNumber)) {
        toast({ title: "Invalid Number", description: "Please enter a valid 10-digit MTN MoMo number.", variant: "destructive" });
        return;
    }

    setGhsBalance(prev => prev - ghsAmount);
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: "withdraw",
      amount: -ghsAmount,
      currency: "GHS",
      date: new Date().toISOString(),
      description: `Withdrawal to ${momoNumber}`,
    };
    setTransactions((prev) => [newTransaction, ...prev]);

    toast({
      title: "Withdrawal Initiated",
      description: `GHS ${ghsAmount.toFixed(2)} is being sent to ${momoNumber}.`,
    });
  };

  if (isRateLoading) {
    return (
       <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
      </div>
    )
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <StatCards steps={steps} bullCoins={bullCoins} usdBalance={usdBalance} ghsBalance={ghsBalance} />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
             <StepSimulator currentSteps={steps} onStepUpdate={handleStepUpdate} />
          </div>
          <WalletCard transactions={transactions} />
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <ConversionCard 
                bullCoins={bullCoins}
                usdBalance={usdBalance}
                exchangeRate={exchangeRate}
                onConvertToUsd={handleConvertToUsd}
                onConvertToGhs={handleConvertToGhs}
            />
            <WithdrawCard 
                ghsBalance={ghsBalance}
                usdBalance={usdBalance}
                minWithdrawalUsd={MIN_WITHDRAWAL_USD}
                onWithdraw={handleWithdraw}
            />
        </div>
      </div>
    </div>
  );
}
