'use client';
import {
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const db = getFirestore(auth.app);
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
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
      
      await setDoc(userRef, userData, { merge: true })
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
          throw permissionError;
        });
    }
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      // This is not an application error. The user simply closed the login popup.
      console.log("Sign-in popup closed by user.");
    } else {
      // For any other unexpected error, log it and let the framework handle it.
      console.error('Error during Google sign-in:', error);
      throw error;
    }
  }
}

export async function signOut(auth: Auth) {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

    