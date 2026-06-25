import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DIFFICULTIES } from "@/lib/enums";
import { getChapter } from "@/lib/chapters";
import { serializeOptions } from "@/lib/questions";

async function requireStaffSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "STAFF" ? session : null;
}

const baseSchema = z.object({
  classOf: z.union([z.literal(11), z.literal(12)]),
  chapterId: z.string().min(1),
  question: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  difficulty: z.enum(DIFFICULTIES),
  explanation: z.string().min(3),
  marks: z.number().int().positive().default(1),
});

export async function POST(req: Request) {
  if (!(await requireStaffSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = baseSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const chapter = getChapter(d.chapterId);
  if (!chapter || chapter.classOf !== d.classOf) {
    return NextResponse.json(
      { error: "Chapter does not match the class" },
      { status: 400 }
    );
  }
  const created = await prisma.question.create({
    data: {
      classOf: d.classOf,
      chapterId: d.chapterId,
      question: d.question,
      options: serializeOptions(d.options),
      correctIndex: d.correctIndex,
      difficulty: d.difficulty,
      explanation: d.explanation,
      marks: d.marks,
    },
  });
  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}

export async function PATCH(req: Request) {
  if (!(await requireStaffSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const schema = baseSchema.extend({ id: z.string() });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  await prisma.question.update({
    where: { id: d.id },
    data: {
      classOf: d.classOf,
      chapterId: d.chapterId,
      question: d.question,
      options: serializeOptions(d.options),
      correctIndex: d.correctIndex,
      difficulty: d.difficulty,
      explanation: d.explanation,
      marks: d.marks,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await requireStaffSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
