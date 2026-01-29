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
  await signInWithRedirect(auth, provider);
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
        const { uid, displayName, email } = user;
        const userData = {
          id: uid,
          googleId: uid,
          email: email || '',
          displayName: displayName || 'New User',
          creationDate: new Date().toISOString(),
        };
        
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
    // We can log this error for debugging, but we don't want to show the user a disruptive error screen.
    // The underlying issue is a configuration problem in the Firebase console.
    console.warn('Firebase redirect result error:', error);
  }
}

export async function signOut(auth: Auth) {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
