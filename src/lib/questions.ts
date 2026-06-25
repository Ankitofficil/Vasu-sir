// Helpers for working with Question.options (JSON-encoded string on SQLite)
// and QuizAttempt.answers.

import type { Question } from "@prisma/client";
import type { Difficulty } from "@/lib/enums";

export interface AnswerRecord {
  questionId: string;
  chosenIndex: number | null; // null = skipped
  correct: boolean;
}

export function parseOptions(options: string): string[] {
  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function serializeOptions(options: string[]): string {
  return JSON.stringify(options);
}

export function parseAnswers(answers: string): AnswerRecord[] {
  try {
    const parsed = JSON.parse(answers);
    return Array.isArray(parsed) ? (parsed as AnswerRecord[]) : [];
  } catch {
    return [];
  }
}

/** Shape sent to the quiz client (options parsed, correct answer stripped). */
export interface ClientQuestion {
  id: string;
  classOf: number;
  chapterId: string;
  question: string;
  options: string[];
  difficulty: Difficulty;
  marks: number;
}

export function toClientQuestion(q: Question): ClientQuestion {
  return {
    id: q.id,
    classOf: q.classOf,
    chapterId: q.chapterId,
    question: q.question,
    options: parseOptions(q.options),
    difficulty: q.difficulty as Difficulty,
    marks: q.marks,
  };
}
