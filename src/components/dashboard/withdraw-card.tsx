"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface WithdrawCardProps {
    ghsBalance: number;
    usdBalance: number;
    minWithdrawalUsd: number;
    onWithdraw: (ghsAmount: number, momoNumber: string) => Promise<void>;
    isWithdrawing: boolean;
}

export function WithdrawCard({ ghsBalance, usdBalance, minWithdrawalUsd, onWithdraw, isWithdrawing }: WithdrawCardProps) {
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [momoNumber, setMomoNumber] = useState("");
    
    const isEligible = usdBalance >= minWithdrawalUsd;
    const canWithdraw = isEligible && ghsBalance > 0;

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        
        if (isNaN(amount) || amount <= 0 || amount > ghsBalance || !momoNumber) {
            return;
        }

        try {
            await onWithdraw(amount, momoNumber);
            setWithdrawAmount("");
            setMomoNumber("");
        } catch (error) {
            // Error handling is managed in main-dashboard via toast
        }
    }

    const amountValue = parseFloat(withdrawAmount);
    const isInvalidAmount = isNaN(amountValue) || amountValue <= 0 || amountValue > ghsBalance;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Withdraw Funds</CardTitle>
                <CardDescription>
                    {isEligible 
                        ? "Transfer GHS to your MTN MoMo account."
                        : `You need at least $${minWithdrawalUsd.toFixed(2)} USD to be eligible for withdrawals.`
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="ghs-withdraw">Amount (GHS)</Label>
                    <Input 
                        id="ghs-withdraw" 
                        type="number" 
                        placeholder="0.00" 
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        disabled={isWithdrawing}
                    />
                    <p className="text-xs text-muted-foreground">Available for withdrawal: GHS {ghsBalance.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="momo-number">MTN MoMo Number</Label>
                    <Input 
                        id="momo-number" 
                        type="tel" 
                        placeholder="024XXXXXXX"
                        value={momoNumber}
                        onChange={e => setMomoNumber(e.target.value)}
                        disabled={isWithdrawing}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Button 
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={!canWithdraw || isInvalidAmount || !momoNumber || isWithdrawing}
                >
                    {isWithdrawing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isWithdrawing ? 'Processing...' : `Withdraw GHS ${!isNaN(amountValue) && amountValue > 0 ? amountValue.toFixed(2) : ''}`}
                </Button>
            </CardFooter>
        </Card>
    )
}
