
"use client";

import { Question, Submission, ClassLevelData } from './types';

const QUESTIONS_KEY = 'learnscape_questions';
const SUBMISSIONS_KEY = 'learnscape_submissions';
const CLASSES_KEY = 'learnscape_classes';

const INITIAL_CLASSES: ClassLevelData[] = [
  { id: 'c1', name: 'Kelas 7' },
  { id: 'c2', name: 'Kelas 8' },
  { id: 'c3', name: 'Kelas 9' }
];

const INITIAL_QUESTIONS: Question[] = [
  {
    id: '1',
    classLevel: 'Kelas 7',
    type: 'multiple-choice',
    text: 'Siapa penemu gaya gravitasi?',
    options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'],
    correctAnswer: '0'
  },
  {
    id: '2',
    classLevel: 'Kelas 8',
    type: 'numeric',
    text: 'Berapakah hasil dari 15 x 3?',
    correctAnswer: '45'
  }
];

// Class Management
export function getClasses(): ClassLevelData[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CLASSES_KEY);
  if (!stored) {
    localStorage.setItem(CLASSES_KEY, JSON.stringify(INITIAL_CLASSES));
    return INITIAL_CLASSES;
  }
  return JSON.parse(stored);
}

export function saveClass(classData: ClassLevelData) {
  const classes = getClasses();
  const index = classes.findIndex(c => c.id === classData.id);
  if (index > -1) {
    classes[index] = classData;
  } else {
    classes.push(classData);
  }
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
}

export function deleteClass(id: string) {
  const classes = getClasses().filter(c => c.id !== id);
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
}

// Question Management
export function getQuestions(): Question[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(QUESTIONS_KEY);
  if (!stored) {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
    return INITIAL_QUESTIONS;
  }
  return JSON.parse(stored);
}

export function saveQuestion(question: Question) {
  const questions = getQuestions();
  const index = questions.findIndex(q => q.id === question.id);
  if (index > -1) {
    questions[index] = question;
  } else {
    questions.push(question);
  }
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}

export function deleteQuestion(id: string) {
  const questions = getQuestions().filter(q => q.id !== id);
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}

// Submission Management
export function getSubmissions(): Submission[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SUBMISSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveSubmission(submission: Submission) {
  const submissions = getSubmissions();
  submissions.push(submission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}
