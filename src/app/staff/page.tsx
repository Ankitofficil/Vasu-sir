import Link from "next/link";
import {
  Users,
  UserCheck,
  CalendarCheck,
  Wallet,
  AlertTriangle,
  Database,
  FileText,
  ArrowRight,
} from "lucide-react";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/db";
import { formatINR, formatDate, performanceTone, cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function StaffDashboard() {
  await requireStaff();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalStudents,
    presentToday,
    presentCount,
    nonHolidayCount,
    feesPaidAgg,
    overdue,
    recentAttempts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.attendance.count({
      where: { date: { gte: today, lt: tomorrow }, status: "PRESENT" },
    }),
    // Average attendance computed from two counts, not every row.
    prisma.attendance.count({ where: { status: "PRESENT" } }),
    prisma.attendance.count({ where: { status: { not: "HOLIDAY" } } }),
    // Sum fees paid this month in the DB.
    prisma.feeRecord.aggregate({
      where: { status: "PAID", paidOn: { gte: startOfMonth() } },
      _sum: { amount: true },
    }),
    prisma.feeRecord.count({ where: { status: "OVERDUE" } }),
    prisma.quizAttempt.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        classOf: true,
        score: true,
        totalMarks: true,
        createdAt: true,
        student: { select: { name: true } },
      },
    }),
  ]);

  const avgAttendance =
    nonHolidayCount > 0
      ? Math.round((presentCount / nonHolidayCount) * 100)
      : 0;
  const feesThisMonth = feesPaidAgg._sum.amount ?? 0;

  const quickActions = [
    { href: "/staff/attendance", label: "Mark attendance", icon: CalendarCheck },
    { href: "/staff/question-bank", label: "Add MCQ", icon: Database },
    { href: "/staff/notes", label: "Upload notes", icon: FileText },
    { href: "/staff/fees", label: "Fee reminders", icon: Wallet },
  ];

  return (
    <div>
      <PageHeader
        title="Staff dashboard"
        description="Institute overview and quick actions."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total students" value={totalStudents} icon={Users} />
        <StatCard
          label="Present today"
          value={presentToday}
          icon={UserCheck}
          tone="success"
          hint={presentToday === 0 ? "No attendance marked yet" : undefined}
        />
        <StatCard
          label="Avg attendance"
          value={`${avgAttendance}%`}
          icon={CalendarCheck}
        />
        <StatCard
          label="Fees this month"
          value={formatINR(feesThisMonth)}
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label="Fees overdue"
          value={overdue}
          icon={AlertTriangle}
          tone="danger"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group flex flex-col items-center gap-2 rounded-lg border p-4 text-center text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-hover"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  {a.label}
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent quiz activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/leaderboard">
                Leaderboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentAttempts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No quiz attempts yet.
              </p>
            ) : (
              <ul className="divide-y">
                {recentAttempts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Class {a.classOf} · {formatDate(a.createdAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "font-mono font-semibold tabular-nums",
                        a.totalMarks > 0 &&
                          {
                            success: "text-success",
                            warning: "text-warning",
                            destructive: "text-destructive",
                          }[performanceTone((a.score / a.totalMarks) * 100)]
                      )}
                    >
                      {a.score}/{a.totalMarks}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
