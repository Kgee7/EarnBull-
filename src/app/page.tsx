'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon } from '@/components/icons/google-icon';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signInWithGoogle, handleRedirectResult } from '@/firebase/auth/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function LoginSkeleton() {
  return (
     <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Skeleton className="h-24 w-24 rounded-[20px]" />
          </div>
          <CardTitle className="font-headline text-3xl font-bold text-primary">
            EarnBull
          </CardTitle>
          <CardDescription className="pt-2 text-base">
            Walk, Earn, and Redeem. Your steps have value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Skeleton className='h-11 w-full' />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth) {
        handleRedirectResult(auth)
          .then((loggedInUser) => {
            if (loggedInUser) {
              router.push('/dashboard');
            }
          })
          .catch((err) => {
            console.error("Auth error:", err);
            setError(err.message || "An error occurred during sign-in.");
          });
    }
  }, [auth, router]);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async () => {
    if (auth) {
      setIsSigningIn(true);
      setError(null);
      try {
        await signInWithGoogle(auth);
      } catch (err: any) {
        setError(err.message || "Failed to initiate Google sign-in.");
        setIsSigningIn(false);
      }
    }
  };

  if (isUserLoading || isSigningIn || user) {
    return <LoginSkeleton />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
             <img 
               src="/logo.png" 
               alt="EarnBull Logo" 
               width="100" 
               height="100" 
               style={{ borderRadius: '20px' }}
               className="shadow-sm object-cover"
             />
          </div>
          <CardTitle className="font-headline text-3xl font-bold text-primary">
            EarnBull
          </CardTitle>
          <CardDescription className="pt-2 text-base">
            Walk, Earn, and Redeem. Your steps have value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sign-in Error</AlertTitle>
                <AlertDescription>
                  {error}.
                </AlertDescription>
              </Alert>
            )}
            
            <Button size="lg" className="w-full py-6 text-lg font-semibold" onClick={handleSignIn} disabled={isSigningIn}>
              <GoogleIcon className="mr-2 h-6 w-6" />
              Sign in with Google
            </Button>
            
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
