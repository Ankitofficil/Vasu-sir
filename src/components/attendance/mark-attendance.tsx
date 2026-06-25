"use client";

import * as React from "react";
import { Loader2, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/stores/toastStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Status = "PRESENT" | "ABSENT" | "HOLIDAY";

interface Student {
  id: string;
  name: string;
  rollNo: string | null;
  classOf: number | null;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_OPTIONS: { value: Status; label: string; cls: string }[] = [
  { value: "PRESENT", label: "Present", cls: "data-[on=true]:bg-success data-[on=true]:text-success-foreground" },
  { value: "ABSENT", label: "Absent", cls: "data-[on=true]:bg-destructive data-[on=true]:text-destructive-foreground" },
  { value: "HOLIDAY", label: "Holiday", cls: "data-[on=true]:bg-primary data-[on=true]:text-primary-foreground" },
];

export function MarkAttendance({ students }: { students: Student[] }) {
  const [classOf, setClassOf] = React.useState<11 | 12>(11);
  const [date, setDate] = React.useState(todayISO());
  const [statuses, setStatuses] = React.useState<Record<string, Status>>({});
  const [saving, setSaving] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState<string | null>(null);

  const roster = students.filter((s) => s.classOf === classOf);

  function setStatus(id: string, status: Status) {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    setSavedMsg(null);
  }

  function markAllPresent() {
    const next: Record<string, Status> = { ...statuses };
    for (const s of roster) next[s.id] = "PRESENT";
    setStatuses(next);
    setSavedMsg(null);
  }

  async function save() {
    setSaving(true);
    setSavedMsg(null);
    const entries = roster.map((s) => ({
      studentId: s.id,
      status: statuses[s.id] ?? "PRESENT",
    }));
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, classOf, entries }),
    });
    setSaving(false);
    if (res.ok) {
      const msg = `Saved attendance for ${entries.length} students.`;
      setSavedMsg(msg);
      toast.success("Attendance saved", {
        description: `${entries.length} students marked.`,
      });
    } else {
      setSavedMsg("Failed to save.");
      toast.error("Could not save attendance", {
        description: "Please try again.",
      });
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 gap-4 sm:max-w-md sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="class">Class</Label>
              <Select
                id="class"
                value={classOf}
                onChange={(e) => setClassOf(Number(e.target.value) as 11 | 12)}
              >
                <option value={11}>Class 11</option>
                <option value={12}>Class 12</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={markAllPresent}
            className="gap-2 sm:w-auto"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all present
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {roster.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No students enrolled in Class {classOf}.
            </p>
          ) : (
            <ul className="divide-y">
              {roster.map((s) => {
                const current = statuses[s.id] ?? "PRESENT";
                return (
                  <li
                    key={s.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Roll {s.rollNo}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          data-on={current === opt.value}
                          onClick={() => setStatus(s.id, opt.value)}
                          className={cn(
                            "h-9 min-w-[44px] rounded-md border px-3 text-xs font-medium transition-colors",
                            opt.cls
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving || roster.length === 0}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save attendance
        </Button>
        {savedMsg && (
          <span className="text-sm text-muted-foreground">{savedMsg}</span>
        )}
      </div>
    </div>
  );
}
