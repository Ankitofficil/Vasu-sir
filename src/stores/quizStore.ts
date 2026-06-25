import { create } from "zustand";
import type { ClientQuestion } from "@/lib/questions";

interface QuizState {
  questions: ClientQuestion[];
  current: number;
  chosen: Record<string, number | null>; // questionId -> option index
  marked: Set<string>; // marked-for-review question ids
  startedAt: number | null;

  init: (questions: ClientQuestion[]) => void;
  goto: (index: number) => void;
  next: () => void;
  prev: () => void;
  choose: (questionId: string, index: number) => void;
  toggleMark: (questionId: string) => void;
  reset: () => void;
  elapsedSec: () => number;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  current: 0,
  chosen: {},
  marked: new Set(),
  startedAt: null,

  init: (questions) =>
    set({
      questions,
      current: 0,
      chosen: {},
      marked: new Set(),
      startedAt: Date.now(),
    }),

  goto: (index) =>
    set((s) => ({
      current: Math.max(0, Math.min(index, s.questions.length - 1)),
    })),

  next: () =>
    set((s) => ({
      current: Math.min(s.current + 1, s.questions.length - 1),
    })),

  prev: () => set((s) => ({ current: Math.max(s.current - 1, 0) })),

  choose: (questionId, index) =>
    set((s) => ({ chosen: { ...s.chosen, [questionId]: index } })),

  toggleMark: (questionId) =>
    set((s) => {
      const marked = new Set(s.marked);
      if (marked.has(questionId)) marked.delete(questionId);
      else marked.add(questionId);
      return { marked };
    }),

  reset: () =>
    set({
      questions: [],
      current: 0,
      chosen: {},
      marked: new Set(),
      startedAt: null,
    }),

  elapsedSec: () => {
    const startedAt = get().startedAt;
    return startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  },
}));
