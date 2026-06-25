import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { StudentsTable, type StudentRow } from "@/components/students/students-table";

export default async function StaffStudentsPage() {
  await requireStaff();

  // Fetch the roster, then aggregate attendance / fees / quiz counts for ALL
  // students in a few grouped queries — not 3 queries per student (N+1).
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: [{ classOf: "asc" }, { rollNo: "asc" }],
    select: { id: true, name: true, email: true, rollNo: true, classOf: true },
  });
  const ids = students.map((s) => s.id);

  const [attendance, fees, quizCounts] = await Promise.all([
    prisma.attendance.groupBy({
      by: ["studentId", "status"],
      where: { studentId: { in: ids } },
      _count: { _all: true },
    }),
    prisma.feeRecord.groupBy({
      by: ["studentId", "status"],
      where: { studentId: { in: ids } },
      _sum: { amount: true },
    }),
    prisma.quizAttempt.groupBy({
      by: ["studentId"],
      where: { studentId: { in: ids } },
      _count: { _all: true },
    }),
  ]);

  // attendance %: present / (present + absent), holidays excluded
  const attStats = new Map<string, { present: number; counted: number }>();
  for (const a of attendance) {
    if (a.status === "HOLIDAY") continue;
    const cur = attStats.get(a.studentId) ?? { present: 0, counted: 0 };
    cur.counted += a._count._all;
    if (a.status === "PRESENT") cur.present += a._count._all;
    attStats.set(a.studentId, cur);
  }

  // pending = total - paid (in paise)
  const feeStats = new Map<string, { total: number; paid: number }>();
  for (const f of fees) {
    const cur = feeStats.get(f.studentId) ?? { total: 0, paid: 0 };
    const amt = f._sum.amount ?? 0;
    cur.total += amt;
    if (f.status === "PAID") cur.paid += amt;
    feeStats.set(f.studentId, cur);
  }

  const quizMap = new Map(quizCounts.map((q) => [q.studentId, q._count._all]));

  const rows: StudentRow[] = students.map((s) => {
    const att = attStats.get(s.id);
    const fee = feeStats.get(s.id);
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      rollNo: s.rollNo,
      classOf: s.classOf,
      attendancePercent:
        att && att.counted > 0
          ? Math.round((att.present / att.counted) * 100)
          : 0,
      pendingPaise: fee ? fee.total - fee.paid : 0,
      quizzes: quizMap.get(s.id) ?? 0,
    };
  });

  return (
    <div>
      <PageHeader
        title="Students"
        description="Enrolled students with attendance, fees and quiz activity."
      />
      <StudentsTable rows={rows} />
    </div>
  );
}
