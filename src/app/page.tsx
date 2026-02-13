'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon } from '@/components/icons/google-icon';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signInWithGoogle } from '@/firebase/auth/utils';
import { Skeleton } from '@/components/ui/skeleton';

function LoginSkeleton() {
  return (
     <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Skeleton className="h-20 w-20 rounded-full" />
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

  // This effect handles the case where a user is already logged in when visiting the page.
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async () => {
    if (auth) {
      setIsSigningIn(true);
      const loggedInUser = await signInWithGoogle(auth);
      if (loggedInUser) {
        // The page will redirect as soon as the `user` state propagates from the useEffect hook.
      } else {
        // If sign-in fails or is cancelled, stop the loading indicator.
        setIsSigningIn(false);
      }
    }
  };

  // Show a skeleton if the auth state is loading, if we're actively signing in, or if a user object exists (and we're about to redirect).
  if (isUserLoading || isSigningIn || user) {
    return <LoginSkeleton />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
             <img src="/logo.png" alt="EarnBull Logo" width="80" height="80" />
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
            <Button size="lg" className="w-full" onClick={handleSignIn} disabled={isSigningIn}>
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
