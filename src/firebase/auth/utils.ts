'use client';
import {
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const db = getFirestore(auth.app);
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user;
      await setDoc(
        userRef,
        {
          displayName,
          email,
          photoURL,
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
  }
}

export async function signOut(auth: Auth) {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
