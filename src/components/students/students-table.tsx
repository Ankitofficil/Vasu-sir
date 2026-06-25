"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { formatINR, initials } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  rollNo: string | null;
  classOf: number | null;
  attendancePercent: number;
  pendingPaise: number;
  quizzes: number;
}

export function StudentsTable({ rows }: { rows: StudentRow[] }) {
  const [search, setSearch] = React.useState("");
  const [classFilter, setClassFilter] = React.useState<"ALL" | "11" | "12">("ALL");

  const filtered = rows.filter((r) => {
    const matchesClass =
      classFilter === "ALL" || String(r.classOf) === classFilter;
    const matchesSearch = `${r.name} ${r.rollNo} ${r.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, roll or email…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={classFilter}
          onChange={(e) =>
            setClassFilter(e.target.value as "ALL" | "11" | "12")
          }
          className="sm:w-40"
        >
          <option value="ALL">All classes</option>
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 sm:p-6">
          {/* Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Pending fees</TableHead>
                  <TableHead>Quizzes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-secondary/60">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(r.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Roll {r.rollNo}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Class {r.classOf}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          r.attendancePercent >= 75
                            ? "text-success"
                            : "text-warning"
                        }
                      >
                        {r.attendancePercent}%
                      </span>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      <span
                        className={
                          r.pendingPaise > 0 ? "text-destructive" : "text-success"
                        }
                      >
                        {formatINR(r.pendingPaise)}
                      </span>
                    </TableCell>
                    <TableCell>{r.quizzes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y md:hidden">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-4">
                <Avatar>
                  <AvatarFallback>{initials(r.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Class {r.classOf} · Roll {r.rollNo}
                  </p>
                  <div className="mt-1 flex gap-3 text-xs">
                    <span className={r.attendancePercent >= 75 ? "text-success" : "text-warning"}>
                      {r.attendancePercent}% att.
                    </span>
                    <span className={r.pendingPaise > 0 ? "text-destructive" : "text-success"}>
                      {formatINR(r.pendingPaise)} due
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No students match your filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
