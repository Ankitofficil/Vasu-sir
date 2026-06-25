import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/session";
import { getChapter, chapterName } from "@/lib/chapters";
import { QuizRunner } from "@/components/quiz/quiz-runner";

export default async function ActiveQuizPage({
  params,
}: {
  params: { chapterId: string };
}) {
  const user = await requireStudent();
  const classOf = user.classOf ?? 11;
  const { chapterId } = params;

  if (chapterId !== "mixed") {
    const chapter = getChapter(chapterId);
    if (!chapter || chapter.classOf !== classOf) notFound();
  }

  return (
    <QuizRunner
      chapterId={chapterId}
      classOf={classOf}
      title={chapterId === "mixed" ? "Random Mix" : chapterName(chapterId)}
    />
  );
}
