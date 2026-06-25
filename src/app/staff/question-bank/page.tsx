import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/db";
import { parseOptions } from "@/lib/questions";
import { PageHeader } from "@/components/layout/page-header";
import {
  QuestionBank,
  type BankQuestion,
} from "@/components/quiz/question-bank";

export default async function QuestionBankPage() {
  await requireStaff();

  const questions = await prisma.question.findMany({
    orderBy: [{ classOf: "asc" }, { chapterId: "asc" }],
  });

  const items: BankQuestion[] = questions.map((q) => ({
    id: q.id,
    classOf: q.classOf,
    chapterId: q.chapterId,
    question: q.question,
    options: parseOptions(q.options),
    correctIndex: q.correctIndex,
    difficulty: q.difficulty,
    explanation: q.explanation,
    marks: q.marks,
  }));

  return (
    <div>
      <PageHeader
        title="Question bank"
        description="Add, edit and remove MCQs across all chapters."
      />
      <QuestionBank questions={items} />
    </div>
  );
}
