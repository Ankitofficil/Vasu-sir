import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FEE_STATUSES } from "@/lib/enums";

async function requireStaffSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "STAFF" ? session : null;
}

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(FEE_STATUSES),
});

const createSchema = z.object({
  studentId: z.string(),
  installment: z.number().int().positive(),
  amount: z.number().int().positive(), // paise
  dueDate: z.string(),
});

// Update a fee record's status (PAID sets paidOn).
export async function PATCH(req: Request) {
  if (!(await requireStaffSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { id, status } = parsed.data;
  const updated = await prisma.feeRecord.update({
    where: { id },
    data: {
      status,
      paidOn: status === "PAID" ? new Date() : null,
      receiptUrl:
        status === "PAID" ? `/uploads/receipts/${id}.pdf` : null,
    },
  });
  return NextResponse.json({ ok: true, record: updated });
}

// Add a new installment.
export async function POST(req: Request) {
  if (!(await requireStaffSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { studentId, installment, amount, dueDate } = parsed.data;
  const record = await prisma.feeRecord.create({
    data: {
      studentId,
      installment,
      amount,
      dueDate: new Date(`${dueDate}T00:00:00.000Z`),
      status: "PENDING",
    },
  });
  return NextResponse.json({ ok: true, record }, { status: 201 });
}
