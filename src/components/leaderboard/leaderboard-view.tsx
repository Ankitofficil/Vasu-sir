"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Trophy, Medal, Award } from "lucide-react";
import type { LeaderboardRow } from "@/lib/queries";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
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

interface Props {
  rows: LeaderboardRow[];
  chapters: { id: string; name: string }[];
  currentUserId: string | null;
  scope: string;
  chapter: string;
  period: string;
}

const PODIUM = [
  {
    icon: Trophy,
    ring: "ring-amber-400",
    tile: "bg-amber-500 text-white",
    card: "border-amber-300/60 dark:border-amber-500/30",
    label: "1st",
  },
  {
    icon: Medal,
    ring: "ring-slate-300",
    tile: "bg-slate-400 text-white",
    card: "",
    label: "2nd",
  },
  {
    icon: Award,
    ring: "ring-orange-600",
    tile: "bg-orange-600 text-white",
    card: "",
    label: "3rd",
  },
];

export function LeaderboardView({
  rows,
  chapters,
  currentUserId,
  scope,
  chapter,
  period,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "ALL" && key !== "chapter") next.delete(key);
    next.set(key, value);
    if (key === "scope") next.delete("chapter"); // chapters depend on scope
    router.push(`/dashboard/leaderboard?${next.toString()}`);
  }

  const top3 = rows.slice(0, 3);
  const selfRow = currentUserId
    ? rows.find((r) => r.studentId === currentUserId)
    : null;
  const selfRank = selfRow
    ? rows.findIndex((r) => r.studentId === currentUserId) + 1
    : null;

  return (
    <div className="space-y-5 pb-16">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          value={scope}
          onChange={(e) => update("scope", e.target.value)}
          className="sm:w-40"
        >
          <option value="ALL">Overall</option>
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
        </Select>
        <Select
          value={chapter}
          onChange={(e) => update("chapter", e.target.value)}
          className="sm:flex-1"
        >
          <option value="ALL">All chapters</option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={period}
          onChange={(e) => update("period", e.target.value)}
          className="sm:w-40"
        >
          <option value="ALL">All time</option>
          <option value="MONTH">This month</option>
          <option value="WEEK">This week</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Trophy}
            title="The leaderboard is empty"
            description="No quiz attempts match this filter yet. Be the first to put your name on the board."
            action={
              currentUserId ? (
                <Button asChild>
                  <Link href="/dashboard/quiz">Take a quiz</Link>
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {top3.map((r, i) => {
                const p = PODIUM[i];
                const Icon = p.icon;
                return (
                  <motion.div
                    key={r.studentId}
                    className={cn(
                      i === 0 && "sm:order-2 sm:-translate-y-2",
                      i === 1 && "sm:order-1",
                      i === 2 && "sm:order-3"
                    )}
                    initial={{ opacity: 0, scale: 0.85, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 180,
                      damping: 14,
                      delay: 0.1 + i * 0.12,
                    }}
                  >
                  <Card
                    className={cn(
                      "ring-1 ring-offset-2 ring-offset-background",
                      p.ring,
                      p.card
                    )}
                  >
                    <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full",
                          p.tile
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                          {initials(r.name)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold leading-tight">{r.name}</p>
                      <p
                        className={cn(
                          "font-mono text-xl font-bold tabular-nums",
                          i === 0 && "text-2xl"
                        )}
                      >
                        {r.points}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.label} · {r.accuracy}% acc
                      </p>
                    </CardContent>
                  </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <Card>
            <CardContent className="p-0 sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8 px-2 sm:w-12 sm:px-4">#</TableHead>
                    <TableHead className="px-2 sm:px-4">Student</TableHead>
                    <TableHead className="px-2 text-right sm:px-4">
                      Points
                    </TableHead>
                    <TableHead className="hidden text-right sm:table-cell">
                      Quizzes
                    </TableHead>
                    <TableHead className="px-2 text-right sm:px-4">Acc.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => {
                    const isSelf = r.studentId === currentUserId;
                    return (
                      <TableRow
                        key={r.studentId}
                        className={cn(isSelf && "bg-primary/10 font-medium")}
                      >
                        <TableCell className="px-2 font-mono tabular-nums sm:px-4">
                          {i + 1}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                                {initials(r.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate">{r.name}</span>
                                {isSelf && (
                                  <Badge
                                    variant="secondary"
                                    className="shrink-0 px-1.5 py-0 text-[10px]"
                                  >
                                    You
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Class {r.classOf}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 text-right font-mono font-semibold tabular-nums sm:px-4">
                          {r.points}
                        </TableCell>
                        <TableCell className="hidden text-right tabular-nums sm:table-cell">
                          {r.quizzes}
                        </TableCell>
                        <TableCell className="px-2 text-right tabular-nums sm:px-4">
                          {r.accuracy}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Sticky self row */}
      {selfRow && selfRank && selfRank > 3 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 backdrop-blur md:left-64">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-lg bg-primary/10 px-4 py-2">
            <span className="font-mono font-bold tabular-nums">#{selfRank}</span>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials(selfRow.name)}</AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate font-medium">{selfRow.name}</span>
            <span className="font-mono font-semibold tabular-nums">
              {selfRow.points} pts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
