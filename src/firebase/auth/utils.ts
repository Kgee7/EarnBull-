'use client';
import {
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


// This new function runs in the background to create the user document if it doesn't exist.
// It is NOT awaited by the main sign-in flow to avoid blocking the UI.
async function manageUserDocument(user: User, db: Firestore) {
  const userRef = doc(db, 'users', user.uid);
  try {
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
      
      // This setDoc operation might fail due to permissions, and the error will be caught below.
      await setDoc(userRef, userData, { merge: true });
    }
  } catch (e: any) {
      // This will catch permission errors from either getDoc or setDoc.
      // We create a detailed error and emit it globally, where FirebaseErrorListener will catch it.
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'write', // 'write' is a safe generic operation for this create/check flow.
        requestResourceData: userData,
      });
      errorEmitter.emit('permission-error', permissionError);
  }
}


export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    // 1. Await the sign-in popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const db = getFirestore(auth.app);

    // 2. Start the database work in the background (fire-and-forget)
    //    This makes the login feel instant.
    manageUserDocument(user, db);

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

    