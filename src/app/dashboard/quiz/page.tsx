import { requireStudent } from "@/lib/session";
import { prisma } from "@/lib/db";
import { chaptersForClass } from "@/lib/chapters";
import { PageHeader } from "@/components/layout/page-header";
import { QuizHub, type ChapterCard } from "@/components/quiz/quiz-hub";

export default async function QuizHubPage() {
  const user = await requireStudent();
  const classOf = user.classOf ?? 11;
  const chapters = chaptersForClass(classOf);

  const [counts, attempts] = await Promise.all([
    prisma.question.groupBy({
      by: ["chapterId"],
      where: { classOf },
      _count: { _all: true },
    }),
    prisma.quizAttempt.findMany({
      where: { studentId: user.id, classOf },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const countMap = new Map(counts.map((c) => [c.chapterId, c._count._all]));

  const cards: ChapterCard[] = chapters.map((ch) => {
    const chAttempts = attempts.filter((a) => a.chapterId === ch.id);
    const best = chAttempts.reduce((max, a) => {
      const pct = a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0;
      return Math.max(max, Math.round(pct));
    }, 0);
    const last = chAttempts[0];
    return {
      id: ch.id,
      name: ch.name,
      questionCount: countMap.get(ch.id) ?? 0,
      bestScore: chAttempts.length > 0 ? best : null,
      lastAttempt: last ? last.createdAt.toISOString() : null,
      attempted: chAttempts.length > 0,
    };
  });

  return (
    <div>
      <PageHeader
        title="Quiz hub"
        description={`Chapter-wise MCQs for Class ${classOf} Accountancy.`}
      />
      <QuizHub classOf={classOf} chapters={cards} />
    </div>
  );
}
