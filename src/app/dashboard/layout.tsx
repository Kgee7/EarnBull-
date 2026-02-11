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
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from '@/firebase/auth/utils';
import { useAuth } from '@/firebase';
import type { User } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';

function Header({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <img src="public/logo.png" width={32} height={32} />
      </Link>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.displayName || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{user.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
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
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <img src="public/logo.png" alt="EarnBull Logo" width={32} height={32} />
          <span className="sr-only">EarnBull</span>
        </Link>
        <div className="flex items-center gap-4">
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


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

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
      <Header user={user} onLogout={handleLogout} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
