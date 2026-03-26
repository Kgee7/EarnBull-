'use client';
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  type Auth,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Ensures the user document exists in Firestore.
async function manageUserDocument(user: User, db: Firestore) {
  const userRef = doc(db, 'users', user.uid);
  
  const { uid, displayName, email } = user;
  const userData = {
    id: uid,
    googleId: uid,
    email: email || '',
    displayName: displayName || 'New User',
    creationDate: new Date().toISOString(),
    bullCoinBalance: 0,
    usdBalance: 0,
    ghsBalance: 0,
    dailyGoals: [
      { name: "Bronze", steps: 2000, reward: 20 },
      { name: "Silver", steps: 5000, reward: 50 },
      { name: "Gold", steps: 10000, reward: 100 },
    ],
  };

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, userData);
    }
  } catch (e: any) {
      console.error("Firestore document management error:", e);
      if (e.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'write',
          requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
      }
      throw e;
  }
}

export async function signInWithGoogle(auth: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  // Using simple redirect to avoid popup blocked issues
  try {
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.error('Error during Google sign-in redirect:', error);
    throw error;
  }
}

export async function handleRedirectResult(auth: Auth): Promise<User | null> {
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            const db = getFirestore(auth.app);
            await manageUserDocument(result.user, db);
            return result.user;
        }
    } catch (error: any) {
        console.error('Error handling redirect result:', error);
        throw error;
    }
    return null;
}

export async function signOut(auth: Auth) {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
