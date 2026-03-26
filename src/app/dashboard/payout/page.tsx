
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, ArrowLeft, RotateCcw, Save } from "lucide-react";
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
                description: "Your information has been securely linked and is ready for withdrawals."
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

    const handleReset = () => {
        setAccountName("");
        setMomoNumber("");
        toast({
            title: "Fields cleared",
            description: "You can now enter new payout information."
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const hasChanges = accountName !== (profile?.payoutDetails?.accountName || "") || 
                        momoNumber !== (profile?.payoutDetails?.momoNumber || "");

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
                    <p className="text-muted-foreground">Manage your linked payment account for fast withdrawals.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Payout Information
                    </CardTitle>
                    <CardDescription>
                        Linked details will be used automatically for all your future withdrawal requests.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="account-name">MTN Account Name</Label>
                        <Input 
                            id="account-name" 
                            placeholder="e.g. John Doe"
                            value={accountName}
                            onChange={e => setAccountName(e.target.value)}
                            disabled={isSaving}
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="momo-number">MTN Mobile Money Number</Label>
                        <Input 
                            id="momo-number" 
                            type="tel" 
                            placeholder="024XXXXXXX"
                            value={momoNumber}
                            onChange={e => setMomoNumber(e.target.value)}
                            disabled={isSaving}
                            className="h-11 font-mono"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button 
                        className="w-full h-11" 
                        onClick={handleSave} 
                        disabled={isSaving || !accountName || !momoNumber || !hasChanges}
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {isSaving ? 'Updating...' : profile?.payoutDetails ? 'Update Payout Details' : 'Link Payout Details'}
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="w-full h-11" 
                        onClick={handleReset} 
                        disabled={isSaving || (!accountName && !momoNumber)}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset / Clear Fields
                    </Button>
                </CardFooter>
            </Card>

            <div className="bg-muted/50 p-4 rounded-lg text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Security Note:</p>
                <p>Ensure your account name matches the name registered with MTN to avoid transaction delays or rejection.</p>
            </div>
        </div>
    );
}
