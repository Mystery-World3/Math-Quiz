
'use client';

import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { Question, Submission, ClassLevelData } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Management for Classes
export async function getClasses(db: Firestore): Promise<ClassLevelData[]> {
  const colRef = collection(db, 'classes');
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(d => ({ 
    ...d.data(), 
    id: d.id,
    isActive: d.data().isActive !== false // Default true if not defined
  } as ClassLevelData));
}

export async function saveClass(db: Firestore, classData: ClassLevelData, oldName?: string) {
  const { id, name, isActive } = classData;
  const data = { name, isActive: isActive !== false };

  if (id && id.length > 5) {
    const docRef = doc(db, 'classes', id);
    await updateDoc(docRef, data).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: data
      }));
    });

    // If name changed, update all questions associated with this class
    if (oldName && oldName !== name) {
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, where('classLevel', '==', oldName));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => {
          batch.update(d.ref, { classLevel: name });
        });
        await batch.commit();
      }
    }
  } else {
    const colRef = collection(db, 'classes');
    await addDoc(colRef, data).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: colRef.path,
        operation: 'write',
        requestResourceData: data
      }));
    });
  }
}

export function deleteClass(db: Firestore, id: string) {
  if (!id) return;
  const docRef = doc(db, 'classes', id);
  deleteDoc(docRef).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete'
    }));
  });
}

// Management for Questions
export async function getQuestions(db: Firestore, classLevel?: string): Promise<Question[]> {
  const colRef = collection(db, 'questions');
  let q = query(colRef);
  
  if (classLevel) {
    q = query(colRef, where('classLevel', '==', classLevel));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Question));
}

export function saveQuestion(db: Firestore, question: Question) {
  const { id, ...data } = question;
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  
  if (id && id.length > 5) {
    const docRef = doc(db, 'questions', id);
    updateDoc(docRef, cleanData).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: cleanData
      }));
    });
  } else {
    const colRef = collection(db, 'questions');
    addDoc(colRef, cleanData).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: colRef.path,
        operation: 'write',
        requestResourceData: cleanData
      }));
    });
  }
}

export function deleteQuestion(db: Firestore, id: string) {
  if (!id) return;
  const docRef = doc(db, 'questions', id);
  deleteDoc(docRef).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete'
    }));
  });
}

// Management for Submissions
export function saveSubmission(db: Firestore, submission: Omit<Submission, 'id'>) {
  const colRef = collection(db, 'submissions');
  return addDoc(colRef, submission).catch(async (err) => {
    console.error("Error saving submission:", err);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: colRef.path,
      operation: 'write',
      requestResourceData: submission
    }));
    throw err;
  });
}

export function updateSubmission(db: Firestore, id: string, data: Partial<Submission>) {
  if (!id) return;
  const docRef = doc(db, 'submissions', id);
  const { id: _, ...cleanData } = data as any;
  updateDoc(docRef, cleanData).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'write',
      requestResourceData: cleanData
    }));
  });
}

export function deleteSubmission(db: Firestore, id: string) {
  if (!id) return;
  const docRef = doc(db, 'submissions', id);
  deleteDoc(docRef).catch(async (err) => {
    console.error("Error deleting submission:", err);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete'
    }));
  });
}
