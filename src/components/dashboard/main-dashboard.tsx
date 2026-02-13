'use client';

import { useState, useEffect, useRef } from 'react';
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
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
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
  addDoc,
} from 'firebase/firestore';

// Constants
const BC_PER_1000_STEPS = 10;
const USD_PER_10_BC = 0.15;
const MIN_WITHDRAWAL_USD = 1;

export function MainDashboard() {
  const { toast } = useToast();
  const { user, isUserLoading: userLoading } = useUser();
  const firestore = useFirestore();

  // State
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isRateLoading, setIsRateLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [steps, setSteps] = useState(0);
  const processedStepsRef = useRef(0);

  // Firestore data hooks
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

  // Effect to handle step-to-coin conversion
  useEffect(() => {
    // Guard against running if the profile or user isn't ready.
    if (profileLoading || !userProfile || !user || !firestore) {
      return;
    }

    const lastProcessed = processedStepsRef.current;
    const newSteps = steps;

    if (newSteps === lastProcessed) {
      return; // No change to process.
    }

    const previous1kMilestone = Math.floor(lastProcessed / 1000);
    const new1kMilestone = Math.floor(newSteps / 1000);
    
    const bcEarned = (new1kMilestone - previous1kMilestone) * BC_PER_1000_STEPS;

    if (bcEarned !== 0) {
      const userRef = doc(firestore, 'users', user.uid);
      
      // Important: Update the processed steps reference immediately
      // to prevent re-processing the same steps.
      processedStepsRef.current = newSteps;

      updateDoc(userRef, { bullCoinBalance: increment(bcEarned) })
        .then(() => {
          const newTransaction: Omit<Transaction, 'id'> = {
            userId: user.uid,
            type: 'earn',
            amount: bcEarned,
            currency: 'BC',
            date: new Date().toISOString(),
            description: `Reward for step milestone`,
          };
          return addDoc(collection(firestore, 'users', user.uid, 'transactions'), newTransaction);
        })
        .then(() => {
          if (bcEarned > 0) {
            toast({ title: 'Coins Earned!', description: `You earned ${bcEarned} BC.` });
          } else {
            toast({ title: 'Coins Reclaimed', description: `${-bcEarned} BC were reclaimed.` });
          }
        })
        .catch(e => {
          // If the update fails, revert the processed steps ref to the last known good value.
          processedStepsRef.current = lastProcessed;
          console.error("Error updating coin balance:", e);
          toast({ title: "Error", description: "Could not update coin balance.", variant: "destructive"});
        });
    }
  }, [steps, profileLoading, userProfile, user, firestore, toast]);

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

  const handleGoalsUpdate = async (newGoals: Goal[]) => {
    if (!user || !firestore || !userDocRef) return;

    try {
      await updateDoc(userDocRef, { dailyGoals: newGoals });
      toast({
        title: 'Goals Updated',
        description: 'Your daily goals have been successfully saved.',
      });
    } catch (e) {
      console.error("Error updating goals:", e);
      toast({
        title: "Update Failed",
        description: "Could not save your new goals. Please try again.",
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
    if (!user || !firestore || !exchangeRate) return;
    if (ghsAmount <= 0 || ghsAmount > ghsBalance) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount to withdraw.', variant: 'destructive' });
      return;
    }
    if (!/^\d{10}$/.test(momoNumber)) {
      toast({ title: 'Invalid Number', description: 'Please enter a valid 10-digit MTN MoMo number.', variant: 'destructive' });
      return;
    }

    setIsWithdrawing(true);

    try {
      const clientTransactionId = `wd-${user.uid}-${Date.now()}`;
      
      const result = await processMomoWithdrawal({
        amount: ghsAmount,
        momoNumber: momoNumber,
        transactionId: clientTransactionId,
      });

      if (!result.success) {
        throw new Error(result.message || 'Withdrawal was declined by the payment provider.');
      }

      const userRef = doc(firestore, 'users', user.uid);
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
      
      const withdrawalRequestRef = doc(collection(firestore, 'users', user.uid, 'withdrawalRequests'));
      batch.set(withdrawalRequestRef, {
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

      toast({
        title: 'Withdrawal Successful',
        description: `GHS ${ghsAmount.toFixed(2)} has been sent to ${momoNumber}.`,
      });
    } catch (e: any) {
      console.error("Error during withdrawal process:", e);
      toast({
        title: "Withdrawal Failed",
        description: e.message || "An unexpected error occurred during withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user || !firestore) return;

    const transactionRef = doc(firestore, 'users', user.uid, 'transactions', transactionId);

    try {
      await deleteDoc(transactionRef);
      toast({
        title: 'Transaction Deleted',
        description: 'The transaction has been removed from your history.',
      });
    } catch (e) {
      console.error("Error deleting transaction:", e);
      toast({
        title: "Deletion Failed",
        description: "Could not delete the transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllTransactions = async () => {
    if (!user || !firestore) return;

    const transactionsCollectionRef = collection(firestore, 'users', user.uid, 'transactions');
    
    try {
        const querySnapshot = await getDocs(transactionsCollectionRef);
        
        if (querySnapshot.empty) {
            toast({
                title: 'History Already Clear',
                description: 'There are no transactions to delete.',
            });
            return;
        }

        const batch = writeBatch(firestore);
        querySnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        
        toast({
            title: 'History Cleared',
            description: 'Your transaction history has been deleted.',
        });
    } catch (e) {
        console.error("Error clearing transaction history:", e);
        toast({
            title: "Deletion Failed",
            description: "Could not clear your transaction history. Please try again.",
            variant: "destructive",
        });
    }
  };

  const isLoading = userLoading || profileLoading || transactionsLoading;

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
            onStepUpdate={setSteps}
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
