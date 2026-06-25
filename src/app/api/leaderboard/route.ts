import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboard } from "@/lib/queries";

// JSON leaderboard endpoint (the page renders server-side; this is for any
// client-side polling or external use).
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");
  const chapter = searchParams.get("chapter");
  const period = searchParams.get("period");

  let since: Date | undefined;
  const now = new Date();
  if (period === "WEEK") {
    since = new Date(now);
    since.setDate(since.getDate() - 7);
  } else if (period === "MONTH") {
    since = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const rows = await getLeaderboard({
    classOf: scope === "11" ? 11 : scope === "12" ? 12 : undefined,
    chapterId: chapter && chapter !== "ALL" ? chapter : undefined,
    since,
  });

  return NextResponse.json({ rows });
}
