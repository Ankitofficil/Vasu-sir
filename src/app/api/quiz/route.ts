import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DIFFICULTIES, type Difficulty } from "@/lib/enums";
import { toClientQuestion } from "@/lib/questions";
import { computePoints } from "@/lib/scoring";

// GET: fetch a quiz set.
//   ?chapterId=... (or "mixed") & count & difficulty
const getSchema = z.object({
  chapterId: z.string(),
  classOf: z.coerce.number().int(),
  count: z.coerce.number().int().min(1).max(100).default(10),
  difficulty: z.enum(["ALL", ...DIFFICULTIES]).default("ALL"),
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const parsed = getSchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { chapterId, classOf, count, difficulty } = parsed.data;

  const where = {
    classOf,
    ...(chapterId !== "mixed" ? { chapterId } : {}),
    ...(difficulty !== "ALL" ? { difficulty } : {}),
  };

  const pool = await prisma.question.findMany({ where });
  const selected = shuffle(pool).slice(0, count);

  return NextResponse.json({
    questions: selected.map(toClientQuestion),
  });
}

// POST: submit an attempt and score it.
const submitSchema = z.object({
  chapterId: z.string(), // "mixed" allowed
  classOf: z.number().int(),
  timeTakenSec: z.number().int().min(0),
  answers: z.array(
    z.object({
      questionId: z.string(),
      chosenIndex: z.number().int().min(0).max(3).nullable(),
    })
  ),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = submitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { chapterId, classOf, timeTakenSec, answers } = parsed.data;

  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  });
  const qMap = new Map(questions.map((q) => [q.id, q]));

  let score = 0;
  let totalMarks = 0;
  const graded = answers.map((a) => {
    const q = qMap.get(a.questionId);
    const correct = !!q && a.chosenIndex === q.correctIndex;
    if (q) {
      totalMarks += q.marks;
      if (correct) score += q.marks;
    }
    return { questionId: a.questionId, chosenIndex: a.chosenIndex, correct };
  });

  const points = computePoints({
    score,
    totalMarks,
    timeTakenSec,
    difficulties: questions.map((q) => q.difficulty as Difficulty),
  });

  const attempt = await prisma.quizAttempt.create({
    data: {
      studentId: session.user.id,
      chapterId: chapterId === "mixed" ? null : chapterId,
      classOf,
      score,
      totalMarks,
      timeTakenSec,
      points,
      answers: JSON.stringify(graded),
    },
  });

  return NextResponse.json({ ok: true, attemptId: attempt.id });
}
