'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon } from '@/components/icons/google-icon';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signInWithGoogle, handleRedirectResult, signInWithEmail, signUpWithEmail } from '@/firebase/auth/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Mail, Lock, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
            Loading your profile...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Skeleton className='h-11 w-full' />
            <Skeleton className='h-11 w-full' />
            <Skeleton className='h-11 w-full' />
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
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

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

  const handleGoogleSignIn = async () => {
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setIsSigningIn(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (!displayName) throw new Error("Please enter a display name.");
        await signUpWithEmail(auth, email, password, displayName);
      } else {
        await signInWithEmail(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      setIsSigningIn(false);
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
          <div className="flex flex-col gap-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      className="pl-9" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-9" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-9" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSigningIn}>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground uppercase">Or continue with</span>
              <Separator className="flex-1" />
            </div>

            <Button variant="outline" className="w-full py-6" onClick={handleGoogleSignIn} disabled={isSigningIn}>
              <GoogleIcon className="mr-2 h-6 w-6" />
              Google
            </Button>

            <div className="text-center text-sm">
              {mode === 'signin' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button 
                    onClick={() => setMode('signup')} 
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button 
                    onClick={() => setMode('signin')} 
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
            
            <p className="px-8 text-center text-xs text-muted-foreground">
              By clicking continue, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
