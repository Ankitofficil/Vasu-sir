import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  classOf: z.union([z.literal(11), z.literal(12)]),
  rollNo: z.string().min(1, "Roll number is required").max(20),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password, classOf, rollNo } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingEmail) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const existingRoll = await prisma.user.findUnique({ where: { rollNo } });
  if (existingRoll) {
    return NextResponse.json(
      { error: "This roll number is already registered" },
      { status: 409 }
    );
  }

  await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      role: "STUDENT",
      classOf,
      rollNo,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
