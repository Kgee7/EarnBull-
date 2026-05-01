'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, ArrowLeft, RotateCcw, Save, Smartphone, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { UserProfile, PayoutMethod } from "@/lib/types";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GHANA_BANKS = [
  {'name': 'Absa Bank Ghana Ltd', 'code': '030100'}, 
  {'name': 'Access Bank', 'code': '280100'}, 
  {'name': 'ADB Bank Limited', 'code': '080100'}, 
  {'name': 'ARB Apex Bank', 'code': '070101'}, 
  {'name': 'Bank of Africa Ghana', 'code': '210100'}, 
  {'name': 'CAL Bank Limited', 'code': '140100'}, 
  {'name': 'Consolidated Bank Ghana Limited', 'code': '340100'}, 
  {'name': 'Ecobank Ghana Limited', 'code': '130100'}, 
  {'name': 'FBNBank Ghana Limited', 'code': '200100'}, 
  {'name': 'Fidelity Bank Ghana Limited', 'code': '240100'}, 
  {'name': 'First Atlantic Bank Limited', 'code': '170100'}, 
  {'name': 'First National Bank Ghana Limited', 'code': '330100'}, 
  {'name': 'GCB Bank Limited', 'code': '040100'}, 
  {'name': 'Guaranty Trust Bank (Ghana) Limited', 'code': '230100'}, 
  {'name': 'National Investment Bank Limited', 'code': '050100'}, 
  {'name': 'OmniBSCI Bank', 'code': '360100'}, 
  {'name': 'Prudential Bank Limited', 'code': '180100'}, 
  {'name': 'Republic Bank (GH) Limited', 'code': '110100'}, 
  {'name': 'Société Générale Ghana Limited', 'code': '090100'}, 
  {'name': 'Stanbic Bank Ghana Limited', 'code': '190100'}, 
  {'name': 'Standard Chartered Bank Ghana Limited', 'code': '020100'}, 
  {'name': 'United Bank for Africa Ghana Limited', 'code': '060100'}, 
  {'name': 'Universal Merchant Bank Ghana Limited', 'code': '100100'}, 
  {'name': 'Zenith Bank Ghana', 'code': '120100'}
];

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

    const [method, setMethod] = useState<PayoutMethod>("momo");
    const [accountName, setAccountName] = useState("");
    
    // MoMo
    const [momoNumber, setMomoNumber] = useState("");
    const [momoNetwork, setMomoNetwork] = useState("MTN");

    // Bank
    const [bankCode, setBankCode] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    useEffect(() => {
        if (profile?.payoutDetails) {
            setMethod(profile.payoutDetails.method || "momo");
            setAccountName(profile.payoutDetails.accountName || "");
            
            setMomoNumber(profile.payoutDetails.momoNumber || "");
            setMomoNetwork(profile.payoutDetails.momoNetwork || "MTN");
            
            setBankCode(profile.payoutDetails.bankCode || "");
            setAccountNumber(profile.payoutDetails.accountNumber || "");
        }
    }, [profile]);

    const handleSave = async () => {
        if (!user || !userDocRef) return;
        setIsSaving(true);
        try {
            const bankName = GHANA_BANKS.find(b => b.code === bankCode)?.name || "";

            await updateDoc(userDocRef, {
                payoutDetails: {
                    method,
                    accountName,
                    momoNumber: method === 'momo' ? momoNumber : "",
                    momoNetwork: method === 'momo' ? momoNetwork : "",
                    bankCode: method === 'bank' ? bankCode : "",
                    bankName: method === 'bank' ? bankName : "",
                    accountNumber: method === 'bank' ? accountNumber : "",
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
        setMomoNetwork("MTN");
        setBankCode("");
        setAccountNumber("");
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

    const isFormValid = () => {
        if (!accountName) return false;
        if (method === 'momo') return momoNumber.length > 5;
        if (method === 'bank') return bankCode && accountNumber.length > 5;
        return false;
    };

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
                    <Tabs value={method} onValueChange={(v) => setMethod(v as PayoutMethod)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="momo" className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                Mobile Money
                            </TabsTrigger>
                            <TabsTrigger value="bank" className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Bank Account
                            </TabsTrigger>
                        </TabsList>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="account-name">Account Name (Must match exactly)</Label>
                                <Input 
                                    id="account-name" 
                                    placeholder="e.g. John Doe"
                                    value={accountName}
                                    onChange={e => setAccountName(e.target.value)}
                                    disabled={isSaving}
                                    className="h-11"
                                />
                            </div>

                            <TabsContent value="momo" className="space-y-4 mt-0">
                                <div className="space-y-2">
                                    <Label htmlFor="network">Mobile Money Network</Label>
                                    <Select value={momoNetwork} onValueChange={setMomoNetwork}>
                                        <SelectTrigger id="network" className="h-11">
                                            <SelectValue placeholder="Select Network" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                                            <SelectItem value="VODAFONE">Vodafone Cash</SelectItem>
                                            <SelectItem value="AT">AirtelTigo Money</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="momo-number">Mobile Money Number</Label>
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
                            </TabsContent>

                            <TabsContent value="bank" className="space-y-4 mt-0">
                                <div className="space-y-2">
                                    <Label htmlFor="bank">Select Bank</Label>
                                    <Select value={bankCode} onValueChange={setBankCode}>
                                        <SelectTrigger id="bank" className="h-11">
                                            <SelectValue placeholder="Select your bank" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GHANA_BANKS.map(bank => (
                                                <SelectItem key={bank.code} value={bank.code}>
                                                    {bank.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account-number">Account Number</Label>
                                    <Input 
                                        id="account-number" 
                                        type="tel" 
                                        placeholder="Enter account number"
                                        value={accountNumber}
                                        onChange={e => setAccountNumber(e.target.value)}
                                        disabled={isSaving}
                                        className="h-11 font-mono"
                                    />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button 
                        className="w-full h-11" 
                        onClick={handleSave} 
                        disabled={isSaving || !isFormValid()}
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
                        disabled={isSaving}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset / Clear Fields
                    </Button>
                </CardFooter>
            </Card>

            <div className="bg-muted/50 p-4 rounded-lg text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Security Note:</p>
                <p>Ensure your account name matches the name registered with your bank or mobile network to avoid transaction delays or rejection.</p>
            </div>
        </div>
    );
}
