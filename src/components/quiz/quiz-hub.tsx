"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Shuffle, Sparkles, Trophy, Clock } from "lucide-react";
import { cn, formatDate, performanceTone } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion";

export interface ChapterCard {
  id: string;
  name: string;
  questionCount: number;
  bestScore: number | null;
  lastAttempt: string | null;
  attempted: boolean;
}

type Filter = "ALL" | "UNTOUCHED";

export function QuizHub({
  classOf,
  chapters,
}: {
  classOf: number;
  chapters: ChapterCard[];
}) {
  const [filter, setFilter] = React.useState<Filter>("ALL");

  const visible = chapters.filter((c) =>
    filter === "UNTOUCHED" ? !c.attempted : true
  );

  return (
    <div className="space-y-5">
      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shuffle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Random mix</p>
                <p className="text-xs text-muted-foreground">
                  Questions from all chapters
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="accent">
              <Link href={`/dashboard/quiz/mixed`}>
                <Play className="h-4 w-4" /> Start
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-2 p-3">
            <Sparkles className="ml-1 h-4 w-4 text-muted-foreground" />
            <div className="flex flex-1 gap-1.5">
              {(
                [
                  ["ALL", "All chapters"],
                  ["UNTOUCHED", "Untouched only"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    "h-9 flex-1 rounded-md border px-3 text-xs font-medium transition-colors",
                    filter === key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-body hover:bg-hover"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chapter grid */}
      <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" gap={0.04}>
        {visible.map((ch) => (
          <StaggerItem key={ch.id} className="h-full">
          <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
            <CardContent className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium leading-snug">{ch.name}</h3>
                {ch.bestScore !== null && (
                  <Badge
                    variant={performanceTone(ch.bestScore)}
                    className="shrink-0 gap-1"
                  >
                    <Trophy className="h-3 w-3" />
                    {ch.bestScore}%
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {ch.questionCount} question{ch.questionCount === 1 ? "" : "s"}
              </p>
              {ch.lastAttempt && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last: {formatDate(ch.lastAttempt)}
                </p>
              )}
              <div className="mt-4 flex-1" />
              <Button
                asChild
                size="sm"
                variant="outline"
                disabled={ch.questionCount === 0}
                className="w-full"
              >
                <Link href={`/dashboard/quiz/${ch.id}`}>
                  <Play className="h-4 w-4" />
                  {ch.questionCount === 0
                    ? "No questions"
                    : ch.attempted
                      ? "Retake"
                      : "Start quiz"}
                </Link>
              </Button>
            </CardContent>
          </Card>
          </StaggerItem>
        ))}
      </Stagger>

      {visible.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          You&apos;ve attempted every chapter. Great work!
        </p>
      )}
    </div>
  );
}
