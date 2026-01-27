"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footprints, Wallet, CircleDollarSign } from "lucide-react";

interface StatCardsProps {
    steps: number;
    bullCoins: number;
    usdBalance: number;
    ghsBalance: number;
}

const GhanianCediIcon = () => (
    <span className="font-bold">₵</span>
)

export function StatCards({ steps, bullCoins, usdBalance, ghsBalance }: StatCardsProps) {
    const stats = [
        { title: "Steps Today", value: steps.toLocaleString(), icon: <Footprints className="h-4 w-4 text-muted-foreground" />, description: "Keep it up!" },
        { title: "Bull Coin Balance", value: bullCoins.toFixed(2), icon: <Wallet className="h-4 w-4 text-muted-foreground" />, description: "BC" },
        { title: "USD Balance", value: `$${usdBalance.toFixed(2)}`, icon: <CircleDollarSign className="h-4 w-4 text-muted-foreground" />, description: "Ready to convert" },
        { title: "GHS Balance", value: `GHS ${ghsBalance.toFixed(2)}`, icon: <GhanianCediIcon />, description: "Ready to withdraw" },
    ]

    return (
        <>
            {stats.map(stat => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        {stat.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-headline">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </>
    )
}
