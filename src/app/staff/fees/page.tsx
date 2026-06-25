import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { StaffFeesManager, type StudentFees } from "@/components/fees/staff-fees-manager";

export default async function StaffFeesPage() {
  await requireStaff();

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      rollNo: true,
      classOf: true,
      feeRecords: { orderBy: { installment: "asc" } },
    },
    orderBy: [{ classOf: "asc" }, { rollNo: "asc" }],
  });

  const data: StudentFees[] = students.map((s) => ({
    id: s.id,
    name: s.name,
    rollNo: s.rollNo,
    classOf: s.classOf,
    records: s.feeRecords.map((r) => ({
      id: r.id,
      installment: r.installment,
      amount: r.amount,
      dueDate: r.dueDate.toISOString(),
      paidOn: r.paidOn ? r.paidOn.toISOString() : null,
      status: r.status,
    })),
  }));

  return (
    <div>
      <PageHeader
        title="Manage fees"
        description="Update installment status, add installments and send reminders."
      />
      <StaffFeesManager students={data} />
    </div>
  );
}
