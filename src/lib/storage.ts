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
  orderBy,
  Firestore
} from 'firebase/firestore';
import { Question, Submission, ClassLevelData } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

// Management for Classes
export async function getClasses(db: Firestore): Promise<ClassLevelData[]> {
  const colRef = collection(db, 'classes');
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClassLevelData));
}

export async function saveClass(db: Firestore, classData: ClassLevelData) {
  const colRef = collection(db, 'classes');
  if (classData.id && classData.id.length > 5) {
    const docRef = doc(db, 'classes', classData.id);
    updateDoc(docRef, { name: classData.name }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { name: classData.name }
      }));
    });
  } else {
    addDoc(colRef, { name: classData.name }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: { name: classData.name }
      }));
    });
  }
}

export async function deleteClass(db: Firestore, id: string) {
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
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Question));
}

export async function saveQuestion(db: Firestore, question: Question) {
  const colRef = collection(db, 'questions');
  const { id, ...data } = question;
  
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  
  if (id && id.length > 5) {
    const docRef = doc(db, 'questions', id);
    updateDoc(docRef, cleanData).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: cleanData
      }));
    });
  } else {
    addDoc(colRef, cleanData).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: cleanData
      }));
    });
  }
}

export async function deleteQuestion(db: Firestore, id: string) {
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
export async function saveSubmission(db: Firestore, submission: Omit<Submission, 'id'>) {
  const colRef = collection(db, 'submissions');
  addDoc(colRef, submission).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: submission
    }));
  });
}

export async function updateSubmission(db: Firestore, id: string, data: Partial<Submission>) {
  if (!id) return;
  const docRef = doc(db, 'submissions', id);
  // Ensure we don't try to update the ID field itself
  const { id: _, ...cleanData } = data as any;
  updateDoc(docRef, cleanData).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: cleanData
    }));
  });
}

export async function deleteSubmission(db: Firestore, id: string) {
  if (!id) return;
  const docRef = doc(db, 'submissions', id);
  
  deleteDoc(docRef).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete'
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}
