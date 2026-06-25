import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { MarkAttendance } from "@/components/attendance/mark-attendance";

export default async function StaffAttendancePage() {
  await requireStaff();

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, rollNo: true, classOf: true },
    orderBy: [{ classOf: "asc" }, { rollNo: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Mark attendance"
        description="Pick a class and date, then mark each student."
      />
      <MarkAttendance students={students} />
    </div>
  );
}
