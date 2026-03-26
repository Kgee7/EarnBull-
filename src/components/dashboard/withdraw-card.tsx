"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    const amountValue = parseFloat(withdrawAmount);
    const hasSufficientBalance = !isNaN(amountValue) && amountValue > 0 && amountValue <= ghsBalance;
    const isValidMomo = momoNumber.length >= 10;

    const handleWithdraw = async () => {
        if (isNaN(amountValue) || amountValue <= 0 || amountValue > ghsBalance || !isValidMomo) {
            return;
        }

        try {
            await onWithdraw(amountValue, momoNumber);
            setWithdrawAmount("");
            setMomoNumber("");
        } catch (error) {
            // Error handled in parent
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Withdraw Funds</CardTitle>
                <CardDescription>
                    Transfer GHS to your MTN MoMo account.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isEligible && (
                    <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            You need at least ${minWithdrawalUsd.toFixed(2)} USD to be eligible for withdrawals.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="space-y-1">
                    <Label htmlFor="ghs-withdraw">Amount (GHS)</Label>
                    <Input 
                        id="ghs-withdraw" 
                        type="number" 
                        placeholder="0.00" 
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        disabled={isWithdrawing}
                        className="bg-background opacity-100"
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
                        className="bg-background opacity-100"
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Button 
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={!isEligible || !hasSufficientBalance || !isValidMomo || isWithdrawing}
                >
                    {isWithdrawing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isWithdrawing ? 'Processing...' : `Withdraw GHS ${hasSufficientBalance ? amountValue.toFixed(2) : ''}`}
                </Button>
            </CardFooter>
        </Card>
    )
}
