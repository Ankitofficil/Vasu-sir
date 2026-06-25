import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Check,
  X,
  RotateCcw,
  Home,
} from "lucide-react";
import { requireStudent } from "@/lib/session";
import { prisma } from "@/lib/db";
import { parseAnswers, parseOptions } from "@/lib/questions";
import { chapterName } from "@/lib/chapters";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/layout/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResultReveal } from "@/components/quiz/result-reveal";

export default async function QuizResultPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const user = await requireStudent();
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: params.attemptId },
  });
  if (!attempt || attempt.studentId !== user.id) notFound();

  const answers = parseAnswers(attempt.answers);
  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  });
  const qMap = new Map(questions.map((q) => [q.id, q]));

  const scorePct =
    attempt.totalMarks > 0
      ? Math.round((attempt.score / attempt.totalMarks) * 100)
      : 0;
  const correctCount = answers.filter((a) => a.correct).length;
  const accuracy =
    answers.length > 0
      ? Math.round((correctCount / answers.length) * 100)
      : 0;

  // Class average for the same chapter/class.
  const peers = await prisma.quizAttempt.findMany({
    where: {
      classOf: attempt.classOf,
      chapterId: attempt.chapterId,
    },
  });
  const classAvgPct =
    peers.length > 0
      ? Math.round(
          (peers.reduce(
            (acc, a) => acc + (a.totalMarks > 0 ? a.score / a.totalMarks : 0),
            0
          ) /
            peers.length) *
            100
        )
      : scorePct;

  const mm = Math.floor(attempt.timeTakenSec / 60);
  const ss = attempt.timeTakenSec % 60;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Quiz result"
        description={chapterName(attempt.chapterId)}
      />

      <ResultReveal scorePct={scorePct}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Score"
            value={`${attempt.score}/${attempt.totalMarks}`}
            icon={Trophy}
            hint={`${scorePct}%`}
            tone={scorePct >= 60 ? "success" : "warning"}
          />
          <StatCard label="Accuracy" value={`${accuracy}%`} icon={Target} />
          <StatCard
            label="Time taken"
            value={`${mm}m ${ss}s`}
            icon={Clock}
          />
          <StatCard
            label="vs class avg"
            value={`${classAvgPct}%`}
            icon={TrendingUp}
            tone={scorePct >= classAvgPct ? "success" : "danger"}
            hint={
              scorePct >= classAvgPct ? "Above average" : "Below average"
            }
          />
        </div>
      </ResultReveal>

      {/* Per-question review */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="text-base">Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {answers.map((a, idx) => {
            const q = qMap.get(a.questionId);
            if (!q) return null;
            const options = parseOptions(q.options);
            return (
              <div key={a.questionId} className="rounded-lg border p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="font-medium">
                    {idx + 1}. {q.question}
                  </p>
                  <Badge variant={a.correct ? "success" : "destructive"}>
                    {a.correct ? "Correct" : a.chosenIndex === null ? "Skipped" : "Wrong"}
                  </Badge>
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {options.map((opt, i) => {
                    const isCorrect = i === q.correctIndex;
                    const isChosen = i === a.chosenIndex;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm",
                          isCorrect &&
                            "border-success/40 bg-success/10 text-success",
                          isChosen &&
                            !isCorrect &&
                            "border-destructive/40 bg-destructive/10 text-destructive"
                        )}
                      >
                        {isCorrect ? (
                          <Check className="h-4 w-4 shrink-0" />
                        ) : isChosen ? (
                          <X className="h-4 w-4 shrink-0" />
                        ) : (
                          <span className="h-4 w-4 shrink-0" />
                        )}
                        {opt}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Explanation:{" "}
                  </span>
                  {q.explanation}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link
            href={`/dashboard/quiz/${attempt.chapterId ?? "mixed"}`}
          >
            <RotateCcw className="h-4 w-4" /> Retry full
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/dashboard/quiz">
            <Home className="h-4 w-4" /> Back to hub
          </Link>
        </Button>
        <Button asChild variant="secondary" className="flex-1">
          <Link href="/dashboard/leaderboard">
            <Trophy className="h-4 w-4" /> Leaderboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
