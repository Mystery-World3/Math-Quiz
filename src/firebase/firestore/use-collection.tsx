'use client';

import { useEffect, useState } from 'react';
import {
  Query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';

/**
 * Hook untuk mendengarkan perubahan koleksi secara real-time.
 * Memastikan ID dokumen selalu disertakan dalam objek data.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => {
          const docData = doc.data() as any;
          return {
            ...docData,
            id: doc.id, // Menjamin ID dokumen asli Firestore digunakan
          } as T;
        });
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Listen Error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
