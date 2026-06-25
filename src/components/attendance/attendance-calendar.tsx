"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type DayStatus = "PRESENT" | "ABSENT" | "HOLIDAY" | "NONE";

interface AttendanceCalendarProps {
  /** Map of "YYYY-MM-DD" -> status. */
  statusByDate: Record<string, DayStatus>;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Cell surface stays neutral so the day NUMBER is always high-contrast; the
// status is carried by a small dot, not by tinting the whole cell + number.
const CELL_STYLES: Record<DayStatus, string> = {
  PRESENT: "bg-success/5 border-success/20",
  ABSENT: "bg-destructive/5 border-destructive/20",
  HOLIDAY: "bg-primary/5 border-primary/20",
  NONE: "bg-card border-border",
};

const DOT_STYLES: Record<DayStatus, string> = {
  PRESENT: "bg-success",
  ABSENT: "bg-destructive",
  HOLIDAY: "bg-primary",
  NONE: "bg-transparent",
};

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function AttendanceCalendar({ statusByDate }: AttendanceCalendarProps) {
  const [cursor, setCursor] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = cursor.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const todayStr = ymd(new Date());

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous month"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-semibold sm:text-base">{monthLabel}</h3>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next month"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="pb-2 text-[10px] font-medium uppercase text-muted-foreground sm:text-xs"
          >
            {w}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const key = ymd(date);
          const status = statusByDate[key] ?? "NONE";
          const isToday = key === todayStr;
          return (
            <div
              key={key}
              className={cn(
                "flex aspect-square min-h-[40px] flex-col items-center justify-center gap-1 rounded-md border text-xs font-medium text-foreground sm:text-sm",
                CELL_STYLES[status],
                isToday && "ring-2 ring-ring ring-offset-1"
              )}
            >
              <span className={status === "NONE" ? "text-muted-foreground" : undefined}>
                {date.getDate()}
              </span>
              <span
                className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLES[status])}
                aria-hidden
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {(
          [
            ["PRESENT", "Present"],
            ["ABSENT", "Absent"],
            ["HOLIDAY", "Holiday"],
            ["NONE", "No class"],
          ] as const
        ).map(([s, label]) => (
          <span key={s} className="flex items-center gap-1.5 text-body">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                s === "NONE" ? "border border-border" : DOT_STYLES[s]
              )}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
