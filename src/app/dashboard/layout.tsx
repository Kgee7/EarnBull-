
'use client';

import Link from 'next/link';
import { CircleUser, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from '@/firebase/auth/utils';
import { useAuth } from '@/firebase';
import type { User } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';

function Header({ user, profile }: { user: User; profile: UserProfile | null }) {
  const displayName = profile?.displayName || user.displayName || 'User';
  const photoURL = profile?.photoURL || user.photoURL || '';

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <img 
          src="/logo.png" 
          alt="EarnBull Logo" 
          width="40" 
          height="40" 
          style={{ borderRadius: '20px' }}
          className="shadow-sm"
        />
        <span className="hidden sm:inline font-headline text-primary">EarnBull</span>
      </Link>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={photoURL} />
                <AvatarFallback>
                  <CircleUser className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">{user.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button className="w-full flex items-center" onClick={() => signOut(getAuth())}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col">
       <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50">
        <div className="flex items-center gap-2 px-4">
          <Skeleton className="h-10 w-10 rounded-[20px]" />
        </div>
        <div className="flex items-center gap-4 px-4">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
         <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
         </div>
      </main>
    </div>
  )
}

import { getAuth } from 'firebase/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: profile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  if (isUserLoading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={user} profile={profile} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
