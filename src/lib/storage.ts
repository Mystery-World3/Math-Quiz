
"use client";

import { Question, Submission, ClassLevel } from './types';

const QUESTIONS_KEY = 'learnscape_questions';
const SUBMISSIONS_KEY = 'learnscape_submissions';

const INITIAL_QUESTIONS: Question[] = [
  {
    id: '1',
    classLevel: 'Kelas 7',
    text: 'Siapa penemu gaya gravitasi?',
    options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'],
    correctAnswer: 0
  },
  {
    id: '2',
    classLevel: 'Kelas 8',
    text: 'Berapakah hasil dari 15 x 3?',
    options: ['35', '40', '45', '50'],
    correctAnswer: 2
  }
];

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
