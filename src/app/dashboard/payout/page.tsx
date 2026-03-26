
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import Link from "next/link";

export default function PayoutPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const [isSaving, setIsSaving] = useState(false);

    const userDocRef = useMemoFirebase(
      () => (user ? doc(firestore, 'users', user.uid) : null),
      [user, firestore]
    );
    const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);

    const [accountName, setAccountName] = useState("");
    const [momoNumber, setMomoNumber] = useState("");

    useEffect(() => {
        if (profile?.payoutDetails) {
            setAccountName(profile.payoutDetails.accountName || "");
            setMomoNumber(profile.payoutDetails.momoNumber || "");
        }
    }, [profile]);

    const handleSave = async () => {
        if (!user || !userDocRef) return;
        setIsSaving(true);
        try {
            await updateDoc(userDocRef, {
                payoutDetails: {
                    accountName,
                    momoNumber
                }
            });
            toast({
                title: "Payout details updated",
                description: "Your information has been securely linked."
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Update failed",
                description: "There was an error saving your payout details."
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="max-w-2xl mx-auto"><Loader2 className="animate-spin" /></div>;
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
                    <h1 className="text-3xl font-bold font-headline">Bind Payout</h1>
                    <p className="text-muted-foreground">Link your payment information for faster withdrawals.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <CreditCard className="h-5 w-5" />
                        Payout Information
                    </CardTitle>
                    <CardDescription>
                        Ensure your name matches your MTN Mobile Money account registration.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="account-name">MTN Account Name</Label>
                        <Input 
                            id="account-name" 
                            placeholder="e.g. John Doe"
                            value={accountName}
                            onChange={e => setAccountName(e.target.value)}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="momo-number">MTN Mobile Money Number</Label>
                        <Input 
                            id="momo-number" 
                            type="tel" 
                            placeholder="024XXXXXXX"
                            value={momoNumber}
                            onChange={e => setMomoNumber(e.target.value)}
                            disabled={isSaving}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleSave} disabled={isSaving || !accountName || !momoNumber}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Linking...' : 'Link Payout Details'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
