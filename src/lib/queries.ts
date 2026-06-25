import { prisma } from "@/lib/db";

/** Attendance summary for a single student. */
export async function getAttendanceSummary(studentId: string) {
  const records = await prisma.attendance.findMany({
    where: { studentId },
    orderBy: { date: "asc" },
  });
  const classes = records.filter((r) => r.status !== "HOLIDAY");
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const holiday = records.filter((r) => r.status === "HOLIDAY").length;
  const total = classes.length;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;
  return { records, present, absent, holiday, total, percent };
}

/** Fee summary for a single student (amounts in paise). */
export async function getFeeSummary(studentId: string) {
  const records = await prisma.feeRecord.findMany({
    where: { studentId },
    orderBy: { installment: "asc" },
  });
  const total = records.reduce((acc, r) => acc + r.amount, 0);
  const paid = records
    .filter((r) => r.status === "PAID")
    .reduce((acc, r) => acc + r.amount, 0);
  const pending = total - paid;
  const nextDue = records
    .filter((r) => r.status !== "PAID")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
  return { records, total, paid, pending, nextDue: nextDue ?? null };
}

/** Leaderboard rows aggregated from quiz attempts. */
export interface LeaderboardRow {
  studentId: string;
  name: string;
  classOf: number | null;
  rollNo: string | null;
  points: number;
  quizzes: number;
  accuracy: number; // 0-100
}

export async function getLeaderboard(opts: {
  classOf?: number;
  chapterId?: string;
  since?: Date;
}): Promise<LeaderboardRow[]> {
  const where = {
    ...(opts.classOf ? { classOf: opts.classOf } : {}),
    ...(opts.chapterId ? { chapterId: opts.chapterId } : {}),
    ...(opts.since ? { createdAt: { gte: opts.since } } : {}),
  };

  // Aggregate points/score/marks/count per student in the DB rather than
  // pulling every attempt row (with its full student relation + JSON blobs).
  const grouped = await prisma.quizAttempt.groupBy({
    by: ["studentId"],
    where,
    _sum: { points: true, score: true, totalMarks: true },
    _count: { _all: true },
  });
  if (grouped.length === 0) return [];

  // One query to resolve the student names/class for just the ranked students.
  const students = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.studentId) } },
    select: { id: true, name: true, classOf: true, rollNo: true },
  });
  const byId = new Map(students.map((s) => [s.id, s]));

  return grouped
    .map((g) => {
      const s = byId.get(g.studentId);
      const score = g._sum.score ?? 0;
      const marks = g._sum.totalMarks ?? 0;
      return {
        studentId: g.studentId,
        name: s?.name ?? "Unknown",
        classOf: s?.classOf ?? null,
        rollNo: s?.rollNo ?? null,
        points: g._sum.points ?? 0,
        quizzes: g._count._all,
        accuracy: marks > 0 ? Math.round((score / marks) * 100) : 0,
      };
    })
    .sort((a, b) => b.points - a.points);
}

export async function getStudentRank(
  studentId: string,
  classOf: number | null
): Promise<number | null> {
  // Rank = (number of students in the cohort with strictly more points) + 1.
  // Computed with a single grouped aggregation instead of building the whole board.
  const grouped = await prisma.quizAttempt.groupBy({
    by: ["studentId"],
    where: classOf ? { classOf } : {},
    _sum: { points: true },
  });
  const self = grouped.find((g) => g.studentId === studentId);
  if (!self) return null;
  const myPoints = self._sum.points ?? 0;
  const ahead = grouped.filter((g) => (g._sum.points ?? 0) > myPoints).length;
  return ahead + 1;
}
