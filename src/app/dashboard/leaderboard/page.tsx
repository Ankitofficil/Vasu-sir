import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { getLeaderboard } from "@/lib/queries";
import { ALL_CHAPTERS } from "@/lib/chapters";
import { PageHeader } from "@/components/layout/page-header";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";

type SearchParams = {
  scope?: string; // "ALL" | "11" | "12"
  chapter?: string;
  period?: string; // "ALL" | "MONTH" | "WEEK"
};

function sinceFor(period: string | undefined): Date | undefined {
  const now = new Date();
  if (period === "WEEK") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === "MONTH") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return undefined;
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const scope = searchParams.scope ?? "ALL";
  const chapter = searchParams.chapter;
  const period = searchParams.period ?? "ALL";

  const classOf = scope === "11" ? 11 : scope === "12" ? 12 : undefined;
  const rows = await getLeaderboard({
    classOf,
    chapterId: chapter && chapter !== "ALL" ? chapter : undefined,
    since: sinceFor(period),
  });

  const chapters = ALL_CHAPTERS.filter((c) =>
    classOf ? c.classOf === classOf : true
  ).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        description="Rankings update as students take quizzes."
      />
      <Suspense fallback={null}>
        <LeaderboardView
          rows={rows}
          chapters={chapters}
          currentUserId={user.role === "STUDENT" ? user.id : null}
          scope={scope}
          chapter={chapter ?? "ALL"}
          period={period}
        />
      </Suspense>
    </div>
  );
}
