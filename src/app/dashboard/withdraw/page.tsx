
'use client';

import { useState, useEffect } from 'react';
import { getUsdToGhsExchangeRate } from '@/ai/flows/usd-to-ghs-exchange';
import { processMomoWithdrawal } from '@/ai/flows/momo-withdrawal';
import type { Transaction, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { WithdrawCard } from '@/components/dashboard/withdraw-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import {
  doc,
  collection,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MIN_WITHDRAWAL_USD = 1;

export default function WithdrawPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: profileLoading } =
    useDoc<UserProfile>(userDocRef);
  
  const ghsBalance = Number(userProfile?.ghsBalance) || 0;
  const usdBalance = Number(userProfile?.usdBalance) || 0;

  useEffect(() => {
    async function fetchRate() {
      try {
        const result = await getUsdToGhsExchangeRate();
        setExchangeRate(result.exchangeRate);
      } catch (error) {
        setExchangeRate(12.5);
      }
    }
    fetchRate();
  }, []);

  const handleWithdraw = async (ghsAmount: number, momoNumber: string) => {
    const amountVal = Number(ghsAmount);
    if (!user || !firestore || !exchangeRate || isNaN(amountVal) || amountVal <= 0) {
        toast({ title: "Invalid Amount", description: "Please enter a valid amount.", variant: "destructive" });
        return;
    }
    
    setIsWithdrawing(true);
    try {
      const result = await processMomoWithdrawal({
        amount: amountVal,
        momoNumber: momoNumber,
        transactionId: `wd-${user.uid}-${Date.now()}`,
      });
      
      if (!result.success) throw new Error(result.message);

      const batch = writeBatch(firestore);
      batch.update(doc(firestore, 'users', user.uid), { ghsBalance: increment(-amountVal) });
      batch.set(doc(collection(firestore, 'users', user.uid, 'transactions')), {
        userId: user.uid,
        type: 'withdraw',
        amount: -amountVal,
        currency: 'GHS',
        date: new Date().toISOString(),
        description: `Withdrawal to ${momoNumber}`,
      });
      batch.set(doc(collection(firestore, 'users', user.uid, 'withdrawalRequests')), {
        userId: user.uid,
        requestDate: new Date().toISOString(),
        amountGHS: amountVal,
        amountUSD: amountVal / exchangeRate,
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

  if (profileLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
            </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-bold font-headline">Withdraw Earnings</h1>
            <p className="text-muted-foreground">Transfer your GHS balance to your mobile money account.</p>
        </div>
      </div>

      <WithdrawCard
        ghsBalance={ghsBalance}
        usdBalance={usdBalance}
        minWithdrawalUsd={MIN_WITHDRAWAL_USD}
        onWithdraw={handleWithdraw}
        isWithdrawing={isWithdrawing}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Withdrawal Policy</CardTitle>
          <CardDescription className="text-xs">
            Minimum withdrawal is $1.00 USD equivalent. Transfers are usually processed instantly but can take up to 24 hours depending on the network.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
