"use client"

import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WalletCardProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number, currency: string) => {
    switch (currency) {
        case 'USD':
            return `$${amount.toFixed(2)}`;
        case 'GHS':
            return `GHS ${amount.toFixed(2)}`;
        case 'BC':
            return `${amount.toFixed(2)} BC`;
        default:
            return `${amount}`;
    }
}

export function WalletCard({ transactions }: WalletCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline">Transaction History</CardTitle>
        <CardDescription>A record of your earnings and withdrawals.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions && transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <TableRow key={tx.id}>
                            <TableCell>
                                <div className="font-medium">{tx.description}</div>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount, tx.currency)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{new Date(tx.date).toLocaleDateString()}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant={tx.type === 'earn' ? 'default' : 'secondary'} className={tx.type === 'earn' ? 'bg-primary/20 text-primary' : ''}>{tx.type}</Badge>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                            No transactions yet. Start walking to earn!
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
