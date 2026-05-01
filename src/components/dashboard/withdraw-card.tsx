"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface WithdrawCardProps {
    ghsBalance: number;
    usdBalance: number;
    minWithdrawalUsd: number;
    onWithdraw: (ghsAmount: number) => Promise<void>;
    isWithdrawing: boolean;
    linkedAccountDisplay: string;
}

export function WithdrawCard({ ghsBalance, usdBalance, minWithdrawalUsd, onWithdraw, isWithdrawing, linkedAccountDisplay }: WithdrawCardProps) {
    const { toast } = useToast();
    const [withdrawAmount, setWithdrawAmount] = useState("");
    
    const isEligible = usdBalance >= minWithdrawalUsd;
    const amountValue = parseFloat(withdrawAmount);

    const handleWithdraw = async () => {
        if (isNaN(amountValue) || amountValue <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid amount to withdraw.",
                variant: "destructive"
            });
            return;
        }

        if (amountValue > ghsBalance) {
            toast({
                title: "Insufficient Balance",
                description: "The amount entered exceeds your available GHS balance.",
                variant: "destructive"
            });
            return;
        }

        if (!isEligible) {
            toast({
                title: "Minimum Withdrawal",
                description: `You must have at least $${minWithdrawalUsd.toFixed(2)} USD total balance to withdraw.`,
                variant: "destructive"
            });
            return;
        }

        await onWithdraw(amountValue);
        setWithdrawAmount("");
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Withdraw Funds</CardTitle>
                <CardDescription>
                    Transfer GHS to your linked MoMo account.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!isEligible && (
                    <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Note: You need a balance of at least ${minWithdrawalUsd.toFixed(2)} USD to withdraw.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="p-4 rounded-lg bg-secondary/50 border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Linked Account</p>
                            <p className="text-xs text-muted-foreground font-mono">{linkedAccountDisplay}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                        <Link href="/dashboard/payout">Change</Link>
                    </Button>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="ghs-withdraw">Amount (GHS)</Label>
                    <Input 
                        id="ghs-withdraw" 
                        type="number" 
                        placeholder="0.00" 
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        disabled={isWithdrawing}
                        className="bg-background focus:ring-2 focus:ring-primary h-12 text-lg"
                    />
                    <p className="text-xs text-muted-foreground">Available for withdrawal: GHS {ghsBalance.toFixed(2)}</p>
                </div>
            </CardContent>
            <CardFooter>
                 <Button 
                    className="w-full h-12 text-lg"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                >
                    {isWithdrawing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <ArrowRight className="mr-2 h-5 w-5" />
                    )}
                    {isWithdrawing ? 'Processing...' : `Withdraw GHS ${!isNaN(amountValue) ? amountValue.toFixed(2) : ''}`}
                </Button>
            </CardFooter>
        </Card>
    )
}
