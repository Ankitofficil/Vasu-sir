import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DIFFICULTIES } from "@/lib/enums";
import { getChapter } from "@/lib/chapters";
import { serializeOptions } from "@/lib/questions";

// Staff-only: publish reviewed (AI-generated or hand-written) MCQs into the
// question bank in bulk. This is the single gate that writes drafts to the DB —
// students can never reach it, and AI generation alone never persists anything.
const itemSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  difficulty: z.enum(DIFFICULTIES),
  explanation: z.string().min(3),
  marks: z.number().int().positive().default(1),
});

const schema = z.object({
  classOf: z.union([z.literal(11), z.literal(12)]),
  chapterId: z.string().min(1),
  questions: z.array(itemSchema).min(1).max(50),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { classOf, chapterId, questions } = parsed.data;
  const chapter = getChapter(chapterId);
  if (!chapter || chapter.classOf !== classOf) {
    return NextResponse.json(
      { error: "Chapter does not match the class" },
      { status: 400 }
    );
  }

  const result = await prisma.question.createMany({
    data: questions.map((q) => ({
      classOf,
      chapterId,
      question: q.question,
      options: serializeOptions(q.options),
      correctIndex: q.correctIndex,
      difficulty: q.difficulty,
      explanation: q.explanation,
      marks: q.marks,
    })),
  });

  return NextResponse.json({ ok: true, published: result.count }, { status: 201 });
}
