
export interface ClassLevelData {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  classLevel: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index in options
}

export interface Submission {
  id: string;
  studentName: string;
  classLevel: string;
  score: number;
  totalQuestions: number;
  answers: number[]; // Index of student's choice for each question
  timestamp: string;
}
