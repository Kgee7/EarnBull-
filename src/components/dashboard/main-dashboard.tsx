'use client';

import { useState, useEffect } from 'react';
import { getUsdToGhsExchangeRate } from '@/ai/flows/usd-to-ghs-exchange';
import { processMomoWithdrawal } from '@/ai/flows/momo-withdrawal';
import type { Transaction, UserProfile, Goal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { StatCards } from '@/components/dashboard/stat-cards';
import { DailyGoalsCard } from '@/components/dashboard/daily-goals-card';
import { WalletCard } from '@/components/dashboard/wallet-card';
import { ConversionCard } from '@/components/dashboard/conversion-card';
import { WithdrawCard } from '@/components/dashboard/withdraw-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  writeBatch,
  increment,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

// Constants
const BC_PER_1000_STEPS = 10;
const USD_PER_10_BC = 0.15;
const MIN_WITHDRAWAL_USD = 1;

export function MainDashboard() {
  const { toast } = useToast();
  const { user, isUserLoading: userLoading } = useUser();
  const firestore = useFirestore();

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isRateLoading, setIsRateLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [steps, setSteps] = useState(0);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: profileLoading } =
    useDoc<UserProfile>(userDocRef);
  
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

  const bullCoins = Number(userProfile?.bullCoinBalance) || 0;
  const usdBalance = Number(userProfile?.usdBalance) || 0;
  const ghsBalance = Number(userProfile?.ghsBalance) || 0;
  const goals = userProfile?.dailyGoals ?? [
    { name: "Bronze", steps: 2000, reward: 20 },
    { name: "Silver", steps: 5000, reward: 50 },
    { name: "Gold", steps: 10000, reward: 100 },
  ];

  const handleStepUpdate = async (newSteps: number) => {
    const previousSteps = steps;
    setSteps(newSteps);

    if (!user || !firestore || !userProfile) return;

    const previous1kMilestone = Math.floor(previousSteps / 1000);
    const new1kMilestone = Math.floor(newSteps / 1000);
    const bcEarned = (new1kMilestone - previous1kMilestone) * BC_PER_1000_STEPS;

    if (bcEarned === 0) return;

    const userRef = doc(firestore, 'users', user.uid);
    try {
      const batch = writeBatch(firestore);

      // Since we guarantee the profile exists on login, updateDoc is safe and explicit.
      batch.update(userRef, { bullCoinBalance: increment(bcEarned) });

      const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));
      const newTransaction: Omit<Transaction, 'id'> = {
        userId: user.uid,
        type: 'earn',
        amount: bcEarned,
        currency: 'BC',
        date: new Date().toISOString(),
        description: `Reward for reaching ${newSteps.toLocaleString()} steps milestone`,
      };
      batch.set(transactionRef, newTransaction);
      
      await batch.commit();

      toast({
        title: bcEarned > 0 ? 'Coins Earned!' : 'Coins Adjusted',
        description: bcEarned > 0 ? `You earned ${bcEarned} Bull Coins.` : `${Math.abs(bcEarned)} Bull Coins adjusted.`,
      });

    } catch (e: any) {
      console.error("Error during step-to-coin conversion:", e);
      setSteps(previousSteps);
      
      toast({
        title: "Update Failed",
        description: "Could not sync coin balance.",
        variant: "destructive",
      });

      if (e.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: { bullCoinBalance: `increment(${bcEarned})` },
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    }
  };
  
  useEffect(() => {
    async function fetchRate() {
      try {
        setIsRateLoading(true);
        const result = await getUsdToGhsExchangeRate();
        setExchangeRate(result.exchangeRate);
      } catch (error) {
        setExchangeRate(12.5);
      } finally {
        setIsRateLoading(false);
      }
    }
    fetchRate();
  }, []);

  const handleGoalsUpdate = async (newGoals: Goal[]) => {
    if (!user || !firestore || !userDocRef) return;
    try {
      await updateDoc(userDocRef, { dailyGoals: newGoals });
      toast({ title: 'Goals Updated', description: 'Saved successfully.' });
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const handleConvertToUsd = async (bcAmount: number) => {
    if (!user || !firestore || !userProfile) return;
    const usdEarned = (bcAmount / 10) * USD_PER_10_BC;
    const userRef = doc(firestore, 'users', user.uid);

    try {
      const batch = writeBatch(firestore);
      batch.update(userRef, {
        bullCoinBalance: increment(-bcAmount),
        usdBalance: increment(usdEarned),
      });
      const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));
      batch.set(transactionRef, {
        userId: user.uid,
        type: 'convert-to-usd',
        amount: -bcAmount,
        currency: 'BC',
        date: new Date().toISOString(),
        description: `Converted ${bcAmount} BC to $${usdEarned.toFixed(2)} USD`,
      });
      await batch.commit();
      toast({ title: 'Success', description: `Converted ${bcAmount} BC to $${usdEarned.toFixed(2)} USD.` });
    } catch(e) {
      toast({ title: "Conversion Failed", variant: "destructive" });
    }
  };

  const handleConvertToGhs = async (usdAmount: number) => {
    if (!exchangeRate || !user || !firestore) return;
    const ghsAmount = usdAmount * exchangeRate;
    const userRef = doc(firestore, 'users', user.uid);
    try {
      const batch = writeBatch(firestore);
      batch.update(userRef, {
        usdBalance: increment(-usdAmount),
        ghsBalance: increment(ghsAmount),
      });
      const transactionRef = doc(collection(firestore, 'users', user.uid, 'transactions'));
      batch.set(transactionRef, {
        userId: user.uid,
        type: 'convert-to-ghs',
        amount: -usdAmount,
        currency: 'USD',
        date: new Date().toISOString(),
        description: `Converted $${usdAmount.toFixed(2)} to GHS ${ghsAmount.toFixed(2)}`,
      });
      await batch.commit();
      toast({ title: 'Success', description: `Converted $${usdAmount.toFixed(2)} to GHS ${ghsAmount.toFixed(2)}.` });
    } catch(e) {
      toast({ title: "Conversion Failed", variant: "destructive" });
    }
  };

  const handleWithdraw = async (ghsAmount: number, momoNumber: string) => {
    if (!user || !firestore || !exchangeRate) return;
    setIsWithdrawing(true);
    try {
      const result = await processMomoWithdrawal({
        amount: ghsAmount,
        momoNumber: momoNumber,
        transactionId: `wd-${user.uid}-${Date.now()}`,
      });
      if (!result.success) throw new Error(result.message);

      const batch = writeBatch(firestore);
      batch.update(doc(firestore, 'users', user.uid), { ghsBalance: increment(-ghsAmount) });
      batch.set(doc(collection(firestore, 'users', user.uid, 'transactions')), {
        userId: user.uid,
        type: 'withdraw',
        amount: -ghsAmount,
        currency: 'GHS',
        date: new Date().toISOString(),
        description: `Withdrawal to ${momoNumber}`,
      });
      batch.set(doc(collection(firestore, 'users', user.uid, 'withdrawalRequests')), {
        userId: user.uid,
        requestDate: new Date().toISOString(),
        amountGHS: ghsAmount,
        amountUSD: ghsAmount / exchangeRate,
        exchangeRate: exchangeRate,
        momoNumber: momoNumber,
        status: 'completed',
        providerTransactionId: result.providerTransactionId,
      });
      await batch.commit();
      toast({ title: 'Withdrawal Successful' });
    } catch (e: any) {
      toast({ title: "Withdrawal Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'transactions', transactionId));
      toast({ title: 'Transaction Deleted' });
    } catch (e) {
      toast({ title: "Deletion Failed", variant: "destructive" });
    }
  };

  const handleDeleteAllTransactions = async () => {
    if (!user || !firestore) return;
    try {
      const querySnapshot = await getDocs(collection(firestore, 'users', user.uid, 'transactions'));
      const batch = writeBatch(firestore);
      querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      toast({ title: 'History Cleared' });
    } catch (e) {
      toast({ title: "Deletion Failed", variant: "destructive" });
    }
  };

  const isLoading = userLoading || profileLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
      </div>
    );
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <StatCards
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
            goals={goals}
            onGoalsUpdate={handleGoalsUpdate}
          />
          <WalletCard 
            transactions={transactions ?? []} 
            onDeleteTransaction={handleDeleteTransaction}
            onDeleteAllTransactions={handleDeleteAllTransactions} 
          />
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
            isWithdrawing={isWithdrawing}
          />
        </div>
      </div>
    </div>
  );
}
