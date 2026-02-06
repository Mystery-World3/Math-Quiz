
export interface ClassLevelData {
  id: string;
  name: string;
}

export type QuestionType = 'multiple-choice' | 'numeric';

export interface Question {
  id: string;
  classLevel: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string; // Menyimpan index (untuk MC) atau nilai angka (untuk Numeric) sebagai string
}

export interface Submission {
  id: string;
  studentName: string;
  classLevel: string;
  score: number;
  totalQuestions: number;
  answers: string[]; // Menyimpan jawaban siswa sebagai string
  timestamp: string;
}
