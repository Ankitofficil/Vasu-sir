// Leaderboard scoring.
//
// Points formula (per quiz attempt):
//
//   points = round( scorePercent * difficultyMultiplier - timePenalty )
//
// where:
//   scorePercent          = (score / totalMarks) * 100        // 0..100
//   difficultyMultiplier  = avg multiplier of the questions in the attempt
//                           EASY = 1.0, MEDIUM = 1.25, HARD = 1.5
//   timePenalty           = floor(timeTakenSec / 30)          // 1 pt per 30s
//
// Points are floored at 0 (a slow, wrong attempt never goes negative).
// Stored on QuizAttempt.points so the leaderboard is a cheap SUM.

import type { Difficulty } from "@/lib/enums";

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  EASY: 1.0,
  MEDIUM: 1.25,
  HARD: 1.5,
};

export function difficultyMultiplier(difficulties: Difficulty[]): number {
  if (difficulties.length === 0) return 1;
  const sum = difficulties.reduce(
    (acc, d) => acc + DIFFICULTY_MULTIPLIER[d],
    0
  );
  return sum / difficulties.length;
}

export function computePoints(params: {
  score: number;
  totalMarks: number;
  timeTakenSec: number;
  difficulties: Difficulty[];
}): number {
  const { score, totalMarks, timeTakenSec, difficulties } = params;
  if (totalMarks <= 0) return 0;
  const scorePercent = (score / totalMarks) * 100;
  const multiplier = difficultyMultiplier(difficulties);
  const timePenalty = Math.floor(timeTakenSec / 30);
  const points = Math.round(scorePercent * multiplier - timePenalty);
  return Math.max(0, points);
}
