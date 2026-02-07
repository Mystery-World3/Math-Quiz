
export interface ClassLevelData {
  id: string;
  name: string;
  isActive?: boolean;
}

export type QuestionType = 'multiple-choice' | 'numeric' | 'short-answer';

export interface Question {
  id: string;
  classLevel: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string; // Menyimpan index (untuk MC) atau nilai jawaban (untuk Numeric/Short Answer) sebagai string
}

export interface Submission {
  id: string;
  studentName: string;
  classLevel: string;
  score: number;
  totalQuestions: number;
  answers: string[]; // Menyimpan jawaban mentah siswa
  gradingResults?: boolean[]; // Hasil koreksi (true = benar, false = salah) dari AI/Sistem
  timestamp: string;
}
