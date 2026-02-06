
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

export async function getClasses(db: Firestore): Promise<ClassLevelData[]> {
  const colRef = collection(db, 'classes');
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClassLevelData));
}

export async function saveClass(db: Firestore, classData: ClassLevelData) {
  const colRef = collection(db, 'classes');
  if (classData.id && classData.id.length > 5) {
    const docRef = doc(db, 'classes', classData.id);
    await updateDoc(docRef, { name: classData.name });
  } else {
    await addDoc(colRef, { name: classData.name });
  }
}

export async function deleteClass(db: Firestore, id: string) {
  await deleteDoc(doc(db, 'classes', id));
}

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
  
  // Bersihkan nilai undefined agar tidak menyebabkan error di Firestore
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  
  if (id && id.length > 5) {
    await updateDoc(doc(db, 'questions', id), cleanData);
  } else {
    await addDoc(colRef, cleanData);
  }
}

export async function deleteQuestion(db: Firestore, id: string) {
  await deleteDoc(doc(db, 'questions', id));
}

export async function getSubmissions(db: Firestore): Promise<Submission[]> {
  const colRef = collection(db, 'submissions');
  const q = query(colRef, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
}

export async function saveSubmission(db: Firestore, submission: Submission) {
  const colRef = collection(db, 'submissions');
  const { id, ...data } = submission;
  await addDoc(colRef, data);
}
