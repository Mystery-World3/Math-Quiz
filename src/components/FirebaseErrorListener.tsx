
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Re-throw the error to trigger the Next.js development overlay
      // This is crucial for developer debugging of Security Rules.
      setTimeout(() => {
        throw error;
      }, 0);

      toast({
        variant: "destructive",
        title: "Izin Ditolak",
        description: `Anda tidak memiliki izin untuk melakukan ${error.context.operation} pada data ini. Periksa Firebase Security Rules Anda.`,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
