'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon } from '@/components/icons/google-icon';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signInWithGoogle } from '@/firebase/auth/utils';
import { Skeleton } from '@/components/ui/skeleton';


function LoginSkeleton() {
  return (
     <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20">
            <img src="/logo.png" alt="EarnBull Logo" className="h-full w-full rounded-full object-cover" />
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
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    if (auth) {
      await signInWithGoogle(auth);
    }
  };

  if (loading || user) {
    return <LoginSkeleton />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20">
            <img src="/logo.png" alt="EarnBull Logo" className="h-full w-full rounded-full object-cover" />
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
            <Button size="lg" className="w-full" onClick={handleSignIn}>
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
