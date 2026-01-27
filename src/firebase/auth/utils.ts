'use client';
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  type Auth,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Error signing in with Google:', error);
  }
}

export async function handleSignInWithGoogleRedirect(auth: Auth) {
  try {
    const result = await getRedirectResult(auth);

    if (result) {
      const user = result.user;
      const db = getFirestore(auth.app);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const { displayName, email, photoURL } = user;
        const userData = { displayName, email, photoURL };
        
        setDoc(userRef, userData, { merge: true })
          .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userRef.path,
              operation: 'create',
              requestResourceData: userData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
      }
    }
  } catch (error) {
    console.error('Error handling redirect result:', error);
  }
}

export async function signOut(auth: Auth) {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
