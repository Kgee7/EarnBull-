'use client';

import { useState, useEffect } from 'react';
import { getUsdToGhsExchangeRate } from '@/ai/flows/usd-to-ghs-exchange';
import type { Transaction, UserProfile, DailyStepCount } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { StatCards } from '@/components/dashboard/stat-cards';
import { DailyGoalsCard } from '@/components/dashboard/daily-goals-card';
import { WalletCard } from '@/components/dashboard/wallet-card';
import { ConversionCard } from '@/components/dashboard/conversion-card';
import { WithdrawCard } from '@/components/dashboard/withdraw-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  increment,
} from 'firebase/firestore';

// Constants
const BC_PER_1000_STEPS = 10;
const USD_PER_10_BC = 0.15;
const MIN_WITHDRAWAL_USD = 1;

export function MainDashboard() {
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  // State
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isRateLoading, setIsRateLoading] = useState(true);

  // Firestore data hooks
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: profileLoading } =
    useDoc<UserProfile>(userDocRef);

  const today = new Date().toISOString().split('T')[0];
  const stepsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'dailyStepCounts'),
            where('date', '==', today),
            limit(1)
          )
        : null,
    [user, firestore, today]
  );
  const { data: dailyStepData, isLoading: stepsLoading } =
    useCollection<DailyStepCount>(stepsQuery);
  
  const transactionsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'transactions'),
            orderBy('date', 'desc'),
            limit(50)
          )
        : null,
    [user, firestore]
  );
  const { data: transactions, isLoading: transactionsLoading } =
    useCollection<Transaction>(transactionsQuery);

  const steps = dailyStepData?.[0]?.stepCount ?? 0;
  const bullCoins = userProfile?.bullCoinBalance ?? 0;
  const usdBalance = userProfile?.usdBalance ?? 0;
  const ghsBalance = userProfile?.ghsBalance ?? 0;

  // Fetch exchange rate on mount
  useEffect(() => {
    async function fetchRate() {
      try {
        setIsRateLoading(true);
        const result = await getUsdToGhsExchangeRate();
        setExchangeRate(result.exchangeRate);
        if (!result.isUpToDate) {
          toast({
            title: 'Exchange Rate Notice',
            description:
              'Using a cached USD to GHS exchange rate. The actual rate may vary.',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setExchangeRate(12.5); // Fallback rate
        toast({
          title: 'Error',
          description:
            'Could not fetch the latest exchange rate. Using a default rate of $1 = GHS 12.5.',
          variant: 'destructive',
        });
      } finally {
        setIsRateLoading(false);
      }
    }
    fetchRate();
  }, [toast]);

  // Handlers
  const handleStepUpdate = async (newSteps: number) => {
    if (!user || !firestore) return;

    const oldSteps = steps;
    if (newSteps <= oldSteps) return;

    // Calculate rewards based on crossing 1000-step milestones
    const previous1kMilestone = Math.floor(oldSteps / 1000);
    const new1kMilestone = Math.floor(newSteps / 1000);
    const bcEarned = (new1kMilestone - previous1kMilestone) * BC_PER_1000_STEPS;
    
    const stepDoc = dailyStepData?.[0];
  
    try {
      const batch = writeBatch(firestore);
  
      // Update step count (or create new daily doc)
      if (stepDoc) {
        const stepDocRef = doc(firestore, 'users', user.uid, 'dailyStepCounts', stepDoc.id);
        batch.update(stepDocRef, { stepCount: newSteps });
      } else {
        const stepDocRef = doc(collection(firestore, 'users', user.uid, 'dailyStepCounts'));
        batch.set(stepDocRef, {
          userId: user.uid,
          date: today,
          stepCount: newSteps,
        });
      }
  
      // If coins were earned, update balance and add transaction
      if (bcEarned > 0) {
        const userRef = doc(firestore, 'users', user.uid);
        batch.update(userRef, { bullCoinBalance: increment(bcEarned) });
  
        const newTransaction: Omit<Transaction, 'id'> = {
          userId: user.uid,
          type: 'earn',
          amount: bcEarned,
          currency: 'BC',
          date: new Date().toISOString(),
          description: `Reward for reaching ${new1kMilestone * 1000} steps`,
        };
        const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));
        batch.set(transactionRef, newTransaction);
      }
  
      await batch.commit();
  
      if (bcEarned > 0) {
        toast({
          title: 'Goal Reached!',
          description: `You earned ${bcEarned} BC!`,
        });
      }
    } catch (e) {
      console.error("Error updating steps:", e);
      toast({
        title: "Error",
        description: "Could not save your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConvertToUsd = async (bcAmount: number) => {
    if (!user || !firestore || !userProfile) return;
    if (bcAmount <= 0 || bcAmount > bullCoins) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount of Bull Coins to convert.',
        variant: 'destructive',
      });
      return;
    }

    const usdEarned = (bcAmount / 10) * USD_PER_10_BC;
    const userRef = doc(firestore, 'users', user.uid);

    try {
      const batch = writeBatch(firestore);
      batch.update(userRef, {
        bullCoinBalance: increment(-bcAmount),
        usdBalance: increment(usdEarned),
      });

      const newTransaction: Omit<Transaction, 'id'> = {
        userId: user.uid,
        type: 'convert-to-usd',
        amount: -bcAmount,
        currency: 'BC',
        date: new Date().toISOString(),
        description: `Converted to $${usdEarned.toFixed(2)} USD`,
      };
      const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));
      batch.set(transactionRef, newTransaction);

      await batch.commit();

      toast({
        title: 'Success',
        description: `Converted ${bcAmount} BC to $${usdEarned.toFixed(2)} USD.`,
      });
    } catch(e) {
      console.error("Error converting to USD:", e);
      toast({
        title: "Conversion Failed",
        description: "Could not complete the conversion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConvertToGhs = async (usdAmount: number) => {
    if (!exchangeRate || !user || !firestore || !userProfile) {
      toast({ title: 'Error', description: 'Cannot perform conversion right now.', variant: 'destructive'});
      return;
    }
    if (usdAmount <= 0 || usdAmount > usdBalance) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount of USD to convert.', variant: 'destructive' });
      return;
    }
    const ghsAmount = usdAmount * exchangeRate;
    const userRef = doc(firestore, 'users', user.uid);
    
    try {
      const batch = writeBatch(firestore);

      batch.update(userRef, {
        usdBalance: increment(-usdAmount),
        ghsBalance: increment(ghsAmount),
      });

      const newTransaction: Omit<Transaction, 'id'> = {
        userId: user.uid,
        type: 'convert-to-ghs',
        amount: -usdAmount,
        currency: 'USD',
        date: new Date().toISOString(),
        description: `Converted to GHS ${ghsAmount.toFixed(2)}`,
      };
      const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));
      batch.set(transactionRef, newTransaction);

      await batch.commit();

      toast({
        title: 'Success',
        description: `Converted $${usdAmount.toFixed(2)} to GHS ${ghsAmount.toFixed(2)}.`,
      });
    } catch(e) {
      console.error("Error converting to GHS:", e);
      toast({
        title: "Conversion Failed",
        description: "Could not complete the conversion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async (ghsAmount: number, momoNumber: string) => {
    if (!user || !firestore) return;
    if (ghsAmount <= 0 || ghsAmount > ghsBalance) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount to withdraw.', variant: 'destructive' });
      return;
    }
    if (!/^\d{10}$/.test(momoNumber)) {
      toast({ title: 'Invalid Number', description: 'Please enter a valid 10-digit MTN MoMo number.', variant: 'destructive' });
      return;
    }

    const userRef = doc(firestore, 'users', user.uid);

    try {
      const batch = writeBatch(firestore);

      batch.update(userRef, { ghsBalance: increment(-ghsAmount) });

      const newTransaction: Omit<Transaction, 'id'> = {
        userId: user.uid,
        type: 'withdraw',
        amount: -ghsAmount,
        currency: 'GHS',
        date: new Date().toISOString(),
        description: `Withdrawal to ${momoNumber}`,
      };
      const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));
      batch.set(transactionRef, newTransaction);
      
      // Also create a withdrawal request document
      const withdrawalRequestRef = doc(collection(firestore, 'users', user.uid, 'withdrawalRequests'));
      batch.set(withdrawalRequestRef, {
        userId: user.uid,
        requestDate: new Date().toISOString(),
        amountGHS: ghsAmount,
        amountUSD: ghsAmount / (exchangeRate ?? 1),
        exchangeRate: exchangeRate,
        momoNumber: momoNumber,
        status: 'pending',
      });

      await batch.commit();

      toast({
        title: 'Withdrawal Initiated',
        description: `GHS ${ghsAmount.toFixed(2)} is being sent to ${momoNumber}.`,
      });
    } catch (e) {
      console.error("Error withdrawing funds:", e);
      toast({
        title: "Withdrawal Failed",
        description: "Could not initiate withdrawal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isRateLoading || userLoading || profileLoading || stepsLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <StatCards
          user={user}
          steps={steps}
          bullCoins={bullCoins}
          usdBalance={usdBalance}
          ghsBalance={ghsBalance}
        />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <DailyGoalsCard
            currentSteps={steps}
            onStepUpdate={handleStepUpdate}
          />
          <WalletCard transactions={transactions ?? []} />
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
