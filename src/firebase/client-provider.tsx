'use client';
import { initializeFirebase, FirebaseContextType } from '@/firebase';
import { FirebaseProvider } from './provider';
import React, { ReactNode, useState, useEffect } from 'react';

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const [firebase, setFirebase] = useState<FirebaseContextType | null>(null);

  useEffect(() => {
    const app = initializeFirebase();
    setFirebase(app);
  }, []);

  if (!firebase) {
    return null; // or a loading indicator
  }

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
};
