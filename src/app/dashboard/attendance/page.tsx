import { CalendarCheck, UserCheck, UserX, CalendarOff } from "lucide-react";
import { requireStudent } from "@/lib/session";
import { getAttendanceSummary } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  AttendanceCalendar,
  type DayStatus,
} from "@/components/attendance/attendance-calendar";

export default async function AttendancePage() {
  const user = await requireStudent();
  const summary = await getAttendanceSummary(user.id);

  const statusByDate: Record<string, DayStatus> = {};
  for (const r of summary.records) {
    const d = r.date;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    statusByDate[key] = r.status as DayStatus;
  }

  return (
    <div>
      <PageHeader
        title="My attendance"
        description="Your class-by-class attendance record."
      />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1">
          <Card>
            <CardContent className="flex items-center justify-center gap-4 p-6">
              <CircularProgress
                value={summary.percent}
                colorClass={
                  summary.percent >= 75 ? "stroke-success" : "stroke-warning"
                }
              />
              <div>
                <p className="text-sm text-body">Overall</p>
                <p className="text-xs text-muted-foreground">
                  {summary.present} of {summary.total} classes
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 lg:grid-cols-1">
            <StatCard label="Present" value={summary.present} icon={UserCheck} tone="success" />
            <StatCard label="Absent" value={summary.absent} icon={UserX} tone="danger" />
            <StatCard label="Holidays" value={summary.holiday} icon={CalendarOff} />
          </div>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.records.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No attendance recorded yet.
              </p>
            ) : (
              <AttendanceCalendar statusByDate={statusByDate} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
