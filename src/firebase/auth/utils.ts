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

    // If it doesn't exist, create it. If it does, we can optionally update non-balance fields.
    // Using merge: true is safe for both new and existing users.
    await setDoc(userRef, userData, { merge: true });
  } catch (e: any) {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'write',
        requestResourceData: userData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw e; // Rethrow to ensure the login flow knows it failed
  }
}


export async function signInWithGoogle(auth: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.error('Error during Google sign-in redirect:', error);
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
