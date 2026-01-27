"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConversionCardProps {
    bullCoins: number;
    usdBalance: number;
    exchangeRate: number | null;
    onConvertToUsd: (bcAmount: number) => void;
    onConvertToGhs: (usdAmount: number) => void;
}

export function ConversionCard({ bullCoins, usdBalance, exchangeRate, onConvertToUsd, onConvertToGhs }: ConversionCardProps) {
    const [bcToUsdAmount, setBcToUsdAmount] = useState("");
    const [usdToGhsAmount, setUsdToGhsAmount] = useState("");

    const usdFromBc = (parseFloat(bcToUsdAmount) / 10) * 0.15;
    const ghsFromUsd = parseFloat(usdToGhsAmount) * (exchangeRate ?? 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Currency Converter</CardTitle>
                <CardDescription>Convert your earnings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="bc-usd">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="bc-usd">BC ➔ USD</TabsTrigger>
                        <TabsTrigger value="usd-ghs">USD ➔ GHS</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bc-usd" className="mt-4">
                        <div className="space-y-4">
                             <div className="text-sm text-center p-2 bg-secondary rounded-md">
                                <strong>Rate:</strong> 10 BC = $0.15 USD
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="bc-amount">Bull Coins (BC)</Label>
                                <Input id="bc-amount" type="number" placeholder="0.00" value={bcToUsdAmount} onChange={(e) => setBcToUsdAmount(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Available: {bullCoins.toFixed(2)} BC</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <ArrowRightLeft className="h-5 w-5 text-muted-foreground transform rotate-90" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="usd-value">US Dollars (USD)</Label>
                                <Input id="usd-value" type="number" value={!isNaN(usdFromBc) ? usdFromBc.toFixed(2) : "0.00"} disabled />
                            </div>
                            <Button className="w-full" onClick={() => onConvertToUsd(parseFloat(bcToUsdAmount))} disabled={parseFloat(bcToUsdAmount) <= 0 || parseFloat(bcToUsdAmount) > bullCoins}>Convert to USD</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="usd-ghs" className="mt-4">
                        <div className="space-y-4">
                             <div className="text-sm text-center p-2 bg-secondary rounded-md">
                                <strong>Rate:</strong> $1 USD = GHS {exchangeRate?.toFixed(2) ?? '...'}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="usd-amount">US Dollars (USD)</Label>
                                <Input id="usd-amount" type="number" placeholder="0.00" value={usdToGhsAmount} onChange={(e) => setUsdToGhsAmount(e.target.value)} />
                                 <p className="text-xs text-muted-foreground">Available: ${usdBalance.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <ArrowRightLeft className="h-5 w-5 text-muted-foreground transform rotate-90" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="ghs-value">Ghana Cedis (GHS)</Label>
                                <Input id="ghs-value" type="number" value={!isNaN(ghsFromUsd) ? ghsFromUsd.toFixed(2) : "0.00"} disabled />
                            </div>
                            <Button className="w-full" onClick={() => onConvertToGhs(parseFloat(usdToGhsAmount))} disabled={!exchangeRate || parseFloat(usdToGhsAmount) <= 0 || parseFloat(usdToGhsAmount) > usdBalance}>Convert to GHS</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
