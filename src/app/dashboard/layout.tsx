'use client';

import Link from 'next/link';
import { CircleUser, LogOut, User as UserIcon, Menu, LayoutDashboard, Wallet, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from '@/firebase/auth/utils';
import { useAuth } from '@/firebase';
import type { User } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { cn } from '@/lib/utils';

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Withdraw', href: '/dashboard/withdraw', icon: Wallet },
    { label: 'Bind Payout', href: '/dashboard/payout', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col gap-4 py-4">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Header({ user, profile }: { user: User; profile: UserProfile | null }) {
  const displayName = profile?.displayName || user.displayName || 'User';
  const photoURL = profile?.photoURL || user.photoURL || '';

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:flex">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px]">
            <SheetHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
              <SheetTitle className="font-headline text-primary">EarnBull Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold"
        >
           <img 
               src="/logo.png" 
               alt="EarnBull Logo" 
               width="32" 
               height="32" 
               style={{ borderRadius: '6px' }}
               className="shadow-sm object-cover"
             />
          <span className="hidden sm:inline font-headline text-primary">EarnBull</span>
        </Link>
      </div>
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
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="w-full flex items-center cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button className="w-full flex items-center text-destructive focus:text-destructive" onClick={() => signOut(getAuth())}>
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
        <div className="flex items-center gap-4 px-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-6 w-32 hidden sm:block" />
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
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
