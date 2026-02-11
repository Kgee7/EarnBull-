'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Footprints, Wallet, CircleDollarSign } from 'lucide-react';
import type { User } from 'firebase/auth';
import Image from 'next/image';

interface StatCardsProps {
  user: User | null;
  steps: number;
  bullCoins: number;
  usdBalance: number;
  ghsBalance: number;
}

const GhanianCediIcon = () => <span className="font-bold">₵</span>;

export function StatCards({
  user,
  steps,
  bullCoins,
  usdBalance,
  ghsBalance,
}: StatCardsProps) {
  const otherStats = [
    {
      title: 'Steps Today',
      value: steps.toLocaleString(),
      icon: <Footprints className="h-4 w-4 text-muted-foreground" />,
      description: 'Keep it up!',
    },
    {
      title: 'Bull Coin Balance',
      value: bullCoins.toFixed(2),
      icon: <Wallet className="h-4 w-4 text-muted-foreground" />,
      description: 'BC',
    },
    {
      title: 'USD Balance',
      value: `$${usdBalance.toFixed(2)}`,
      icon: <CircleDollarSign className="h-4 w-4 text-muted-foreground" />,
      description: 'Ready to convert',
    },
  ];

  return (
    <>
       <Card>
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-2 gap-4">
           <Image src="/logo.png" alt="EarnBull Logo" width={40} height={40} />
           <CardTitle className="text-sm font-medium">
             {`Welcome, ${user?.displayName?.split(' ')[0] || 'User'}!`}
           </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">
            Let's get moving
          </div>
          <p className="text-xs text-muted-foreground">Your daily progress</p>
        </CardContent>
      </Card>

      {otherStats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
       <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GHS Balance</CardTitle>
            <GhanianCediIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{`GHS ${ghsBalance.toFixed(2)}`}</div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>
    </>
  );
}
