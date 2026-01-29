"use client"

import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WalletCardProps {
  transactions: Transaction[];
  onDeleteTransaction: (transactionId: string) => void;
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

export function WalletCard({ transactions, onDeleteTransaction }: WalletCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline">Transaction History</CardTitle>
        <CardDescription>A record of your earnings and withdrawals. You can delete individual records.</CardDescription>
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
                <TableHead className="text-right">Action</TableHead>
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
                            <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                      <span className="sr-only">Delete transaction</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this transaction record.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => onDeleteTransaction(tx.id)}>
                                        Continue
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
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
