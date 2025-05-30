export interface Exam {
  _id?: string;
  title: string;
  description: string;
  duration: number; // in minutes
  passingScore: number;
  questions: Question[];
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  createdBy?: string | { _id: string; username?: string; email?: string };
  teacherId?: string | { _id: string; name?: string; email?: string };
  createdAt?: Date;
  updatedAt?: Date;
  dateCreated?: string; // ISO date string format
  attempts?: number; // Number of times the exam has been attempted
  views?: number; // Number of times the exam has been viewed
}

export interface Question {
  _id?: string;
  text: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  points: number;
}

export interface ExamAttempt {
  _id?: string;
  userId: string | { _id: string; username?: string; email?: string };
  examId: string | { _id: string; title?: string; description?: string };
  teacherId?: string;
  startTime: Date;
  endTime?: Date;
  answers?: Answer[];
  score: number;
  isCompleted: boolean;
  totalPoints: number;
  passed: boolean;
  percentageScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Answer {
  questionId: string;
  selectedOption: number;
  isCorrect?: boolean;
}
