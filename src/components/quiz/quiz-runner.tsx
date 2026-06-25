"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Flag,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Send,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DIFFICULTIES } from "@/lib/enums";
import { useQuizStore } from "@/stores/quizStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Phase = "config" | "active" | "submitting";

export function QuizRunner({
  chapterId,
  classOf,
  title,
}: {
  chapterId: string;
  classOf: number;
  title: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = React.useState<Phase>("config");
  const [count, setCount] = React.useState("10");
  const [difficulty, setDifficulty] = React.useState("ALL");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    questions,
    current,
    chosen,
    marked,
    init,
    goto,
    next,
    prev,
    choose,
    toggleMark,
    elapsedSec,
    reset,
  } = useQuizStore();

  React.useEffect(() => {
    return () => reset();
  }, [reset]);

  async function startQuiz() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      chapterId,
      classOf: String(classOf),
      count,
      difficulty,
    });
    const res = await fetch(`/api/quiz?${params.toString()}`);
    setLoading(false);
    if (!res.ok) {
      setError("Could not load questions. Please try again.");
      return;
    }
    const data = await res.json();
    if (!data.questions?.length) {
      setError("No questions available for this selection.");
      return;
    }
    init(data.questions);
    setPhase("active");
  }

  async function submitQuiz() {
    setPhase("submitting");
    const answers = questions.map((q) => ({
      questionId: q.id,
      chosenIndex: chosen[q.id] ?? null,
    }));
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterId,
        classOf,
        timeTakenSec: elapsedSec(),
        answers,
      }),
    });
    if (!res.ok) {
      setError("Submission failed.");
      setPhase("active");
      return;
    }
    const data = await res.json();
    reset();
    router.push(`/dashboard/quiz/result/${data.attemptId}`);
  }

  // ---------- Config phase ----------
  if (phase === "config") {
    return (
      <div className="mx-auto max-w-lg">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard/quiz">
            <ArrowLeft className="h-4 w-4" /> Back to hub
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="count">Number of questions</Label>
              <Select
                id="count"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              >
                <option value="10">10 questions</option>
                <option value="20">20 questions</option>
                <option value="30">30 questions</option>
                <option value="100">All available</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="ALL">All difficulties</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </div>
            <p className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
              You can mark questions for review and revisit them via the palette.
              Your time is tracked and affects leaderboard points.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={startQuiz} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Start quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------- Active / submitting phase ----------
  const q = questions[current];
  const answeredCount = questions.filter((x) => chosen[x.id] != null).length;
  const progress = ((current + 1) / questions.length) * 100;
  const isLast = current === questions.length - 1;

  const palette = (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((question, i) => {
        const isAnswered = chosen[question.id] != null;
        const isMarked = marked.has(question.id);
        return (
          <button
            key={question.id}
            onClick={() => goto(i)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-colors",
              i === current && "ring-2 ring-ring ring-offset-1",
              isMarked
                ? "bg-warning/20 border-warning/40 text-warning"
                : isAnswered
                  ? "bg-success/20 border-success/40 text-success"
                  : "bg-muted/40 text-muted-foreground"
            )}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold">{title}</h1>
          <p className="text-xs text-muted-foreground">
            Question {current + 1} of {questions.length} · {answeredCount}{" "}
            answered
          </p>
        </div>
        <QuizTimer />
      </div>

      <Progress value={progress} className="mb-5" />

      <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
        {/* Question */}
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="secondary">{q.difficulty}</Badge>
              <Button
                variant={marked.has(q.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMark(q.id)}
              >
                <Flag className="h-4 w-4" />
                {marked.has(q.id) ? "Marked" : "Mark for review"}
              </Button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-base font-medium sm:text-lg">{q.question}</p>

                <div className="mt-5 space-y-2.5">
                  {q.options.map((opt, i) => {
                    const selected = chosen[q.id] === i;
                    return (
                      <motion.button
                        key={i}
                        onClick={() => choose(q.id, i)}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                          selected
                            ? "border-primary bg-primary/10"
                            : "hover:bg-hover"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={prev}
                disabled={current === 0}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button variant="ghost" onClick={next} disabled={isLast}>
                <SkipForward className="h-4 w-4" /> Skip
              </Button>

              {/* Mobile palette trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <LayoutGrid className="h-4 w-4" /> Palette
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="pb-8">
                  <SheetHeader>
                    <SheetTitle>Question palette</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">{palette}</div>
                </SheetContent>
              </Sheet>

              <div className="ml-auto flex gap-2">
                {!isLast ? (
                  <Button onClick={next}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={submitQuiz}
                    disabled={phase === "submitting"}
                    variant="success"
                  >
                    {phase === "submitting" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop palette */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {palette}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-success/40 bg-success/20" />
                  Answered
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-warning/40 bg-warning/20" />
                  Marked
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border bg-muted/40" />
                  Not visited
                </p>
              </div>
              <Button
                onClick={submitQuiz}
                disabled={phase === "submitting"}
                variant="success"
                className="w-full"
              >
                {phase === "submitting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuizTimer() {
  const startedAt = useQuizStore((s) => s.startedAt);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const sec = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <div className="flex h-11 items-center gap-2 rounded-lg border bg-card px-4 font-mono text-sm font-semibold tabular-nums">
      {mm}:{ss}
    </div>
  );
}
