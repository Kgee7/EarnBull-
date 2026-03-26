
'use client';

import { ProfileCard } from "@/components/dashboard/profile-card";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !firestore || !userDocRef) return;
    try {
      await updateDoc(userDocRef, updates);
    } catch (e) {
      console.error("Failed to update profile", e);
      throw e;
    }
  };

  const handleResetProfile = async () => {
    if (!user || !firestore || !userDocRef) return;
    try {
        await updateDoc(userDocRef, {
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || ''
        });
    } catch (e) {
        console.error("Failed to reset profile", e);
        throw e;
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
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
            <h1 className="text-3xl font-bold font-headline">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and account settings.</p>
        </div>
      </div>

      <ProfileCard 
        profile={profile} 
        onUpdateProfile={handleUpdateProfile}
        onResetProfile={handleResetProfile}
      />
    </div>
  );
}
