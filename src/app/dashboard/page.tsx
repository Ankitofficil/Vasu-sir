import Link from "next/link";
import {
  Wallet,
  Trophy,
  ListChecks,
  CalendarClock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { requireStudent } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  getAttendanceSummary,
  getFeeSummary,
  getStudentRank,
} from "@/lib/queries";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { chapterName } from "@/lib/chapters";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem, AnimatedNumber } from "@/components/motion";

export default async function StudentDashboard() {
  const user = await requireStudent();

  const [attendance, fees, rank, lastAttempt] = await Promise.all([
    getAttendanceSummary(user.id),
    getFeeSummary(user.id),
    getStudentRank(user.id, user.classOf),
    prisma.quizAttempt.findFirst({
      where: { studentId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const lastScorePct = lastAttempt
    ? Math.round((lastAttempt.score / lastAttempt.totalMarks) * 100)
    : null;

  return (
    <div>
      <PageHeader
        title={`Hi, ${user.name?.split(" ")[0]}`}
        description="Here's your snapshot for today."
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Attendance ring */}
        <StaggerItem className="sm:col-span-2 lg:col-span-1">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <CircularProgress
              value={attendance.percent}
              size={96}
              colorClass={
                attendance.percent >= 75 ? "stroke-success" : "stroke-warning"
              }
            />
            <div>
              <p className="text-sm text-body">Attendance</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                <AnimatedNumber value={attendance.percent} suffix="%" />
              </p>
              <p className="text-xs text-muted-foreground">
                {attendance.present}/{attendance.total} classes
              </p>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>

        {/* Pending fees */}
        <StaggerItem>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg border",
                fees.pending > 0
                  ? "border-warning/20 bg-warning/10 text-warning"
                  : "border-success/20 bg-success/10 text-success"
              )}
            >
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-body">Pending fees</p>
              <p
                className={cn(
                  "font-mono text-2xl font-bold tabular-nums",
                  fees.pending > 0 ? "text-warning" : "text-success"
                )}
              >
                {formatINR(fees.pending)}
              </p>
              <p className="text-xs text-muted-foreground">
                {fees.pending > 0 ? "Due soon" : "All cleared"}
              </p>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>

        {/* Last quiz */}
        <StaggerItem>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <ListChecks className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-body">Last quiz</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                {lastScorePct !== null ? `${lastScorePct}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lastAttempt ? chapterName(lastAttempt.chapterId) : "No attempts yet"}
              </p>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>

        {/* Rank */}
        <StaggerItem>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent-text">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-body">Class rank</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
                {rank ? `#${rank}` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {rank ? `Class ${user.classOf}` : "Take a quiz to rank"}
              </p>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>
      </Stagger>

      {/* CTAs */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Continue learning</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                {lastAttempt
                  ? `Pick up where you left off — ${chapterName(lastAttempt.chapterId)}`
                  : "Start your first quiz"}
              </p>
              <p className="text-sm text-muted-foreground">
                Sharpen your accountancy with chapter-wise MCQs.
              </p>
            </div>
            <Button variant="accent" asChild>
              <Link href="/dashboard/quiz">
                Go to quizzes <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming class */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Accountancy · Class {user.classOf}</p>
                <p className="text-sm text-muted-foreground">
                  Tomorrow, 9:00 AM
                </p>
                <Badge variant="secondary" className="mt-2">
                  Revision: Trial Balance
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {fees.nextDue && fees.pending > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
          <span>
            Next fee installment of{" "}
            <strong className="font-mono">{formatINR(fees.nextDue.amount)}</strong>{" "}
            is due on {formatDate(fees.nextDue.dueDate)}.
          </span>
          <Button variant="outline" size="sm" asChild className="ml-auto hidden sm:inline-flex">
            <Link href="/dashboard/fees">View fees</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
