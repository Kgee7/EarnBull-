'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  doc,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setData(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data: data as T | null, loading, error };
}

export function useMemoizedDoc<T>(
  collectionPath: string,
  id: string | undefined
) {
  const firestore = useFirestore();
  const ref = useMemo(
    () =>
      firestore && id ? doc(firestore, collectionPath, id) : null,
    [firestore, collectionPath, id]
  );
  return useDoc<T>(ref as DocumentReference<T> | null);
}
