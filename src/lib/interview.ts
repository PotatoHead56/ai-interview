export const DEFAULT_QUESTIONS = 3;
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 10;

export type ChatMessage = {
  role: "interviewer" | "candidate";
  content: string;
};

export type QuestionReview = {
  feedback: string;
  modelAnswer: string;
};

export type Evaluation = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
};

export type InterviewRequest = {
  jobDescription: string;
  totalQuestions: number;
  history: ChatMessage[];
};

// review 是「上一題」的點評與參考解答；第一題出題時沒有 review
export type InterviewResponse =
  | { type: "question"; questionNumber: number; content: string; review?: QuestionReview }
  | { type: "evaluation"; review: QuestionReview; evaluation: Evaluation };
