
export type ClassLevel = 'Kelas 7' | 'Kelas 8' | 'Kelas 9';

export interface Question {
  id: string;
  classLevel: ClassLevel;
  text: string;
  options: string[];
  correctAnswer: number; // Index in options
}

export interface Submission {
  id: string;
  studentName: string;
  classLevel: ClassLevel;
  score: number;
  totalQuestions: number;
  answers: number[]; // Index of student's choice for each question
  timestamp: string;
}
