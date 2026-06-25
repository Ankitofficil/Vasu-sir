import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  date: z.string(), // ISO date (YYYY-MM-DD)
  classOf: z.union([z.literal(11), z.literal(12)]),
  entries: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "HOLIDAY"]),
    })
  ),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { date, classOf, entries } = parsed.data;
  const dayStart = new Date(`${date}T00:00:00.000Z`);

  await prisma.$transaction(
    entries.map((e) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: e.studentId, date: dayStart } },
        update: { status: e.status, markedBy: session.user.id, classOf },
        create: {
          studentId: e.studentId,
          date: dayStart,
          status: e.status,
          classOf,
          markedBy: session.user.id,
        },
      })
    )
  );

  return NextResponse.json({ ok: true, count: entries.length });
}
