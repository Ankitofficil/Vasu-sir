import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NOTE_TAGS } from "@/lib/enums";
import { getChapter } from "@/lib/chapters";

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  classOf: z.union([z.literal(11), z.literal(12)]),
  chapterId: z.string().min(1),
  tag: z.enum(NOTE_TAGS),
  fileType: z.string().default("pdf"),
  sizeKb: z.number().int().positive().default(100),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const chapter = getChapter(data.chapterId);
  if (!chapter || chapter.classOf !== data.classOf) {
    return NextResponse.json(
      { error: "Chapter does not belong to the selected class" },
      { status: 400 }
    );
  }

  // Dev: we don't process real uploads; store a synthetic file URL.
  const note = await prisma.noteMaterial.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      classOf: data.classOf,
      chapterId: data.chapterId,
      tag: data.tag,
      fileUrl: `/uploads/notes/${data.chapterId}-${Date.now()}.${data.fileType}`,
      fileType: data.fileType,
      sizeKb: data.sizeKb,
      uploadedBy: session.user.id,
    },
  });

  return NextResponse.json({ ok: true, note }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.noteMaterial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
