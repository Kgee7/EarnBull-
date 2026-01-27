"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WithdrawCardProps {
    ghsBalance: number;
    usdBalance: number;
    minWithdrawalUsd: number;
    onWithdraw: (ghsAmount: number, momoNumber: string) => void;
}

export function WithdrawCard({ ghsBalance, usdBalance, minWithdrawalUsd, onWithdraw }: WithdrawCardProps) {
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [momoNumber, setMomoNumber] = useState("");
    
    const isEligible = usdBalance >= minWithdrawalUsd;
    const canWithdraw = isEligible && ghsBalance > 0;

    const handleWithdraw = () => {
        onWithdraw(parseFloat(withdrawAmount), momoNumber);
        setWithdrawAmount("");
    }

    return (
        <Card className={!isEligible ? 'bg-muted/50' : ''}>
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
                        disabled={!canWithdraw}
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
                        disabled={!canWithdraw}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Button 
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={!canWithdraw || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > ghsBalance || !momoNumber}
                >
                    Withdraw GHS {parseFloat(withdrawAmount) > 0 ? parseFloat(withdrawAmount).toFixed(2) : ''}
                </Button>
            </CardFooter>
        </Card>
    )
}
