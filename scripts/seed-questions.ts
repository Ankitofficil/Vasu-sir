/**
 * Loads the question bank from data/questions/class-11/*.json and
 * data/questions/class-12/*.json into the database. The chapterId and classOf
 * are derived from the file name (e.g. "12-06-share-capital.json"). Re-runnable:
 * it clears existing Questions first.
 */
import * as fs from "fs";
import * as path from "path";
import type { PrismaClient } from "@prisma/client";
import { ALL_CHAPTERS } from "../src/lib/chapters";
import { serializeOptions } from "../src/lib/questions";

interface RawQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  explanation: string;
  marks?: number;
}

export async function seedQuestions(prisma: PrismaClient): Promise<number> {
  const baseDir = path.join(process.cwd(), "data", "questions");
  await prisma.question.deleteMany();

  let count = 0;
  for (const chapter of ALL_CHAPTERS) {
    const sub = chapter.classOf === 11 ? "class-11" : "class-12";
    const file = path.join(baseDir, sub, `${chapter.id}.json`);
    if (!fs.existsSync(file)) continue;

    const raw: RawQuestion[] = JSON.parse(fs.readFileSync(file, "utf-8"));
    for (const q of raw) {
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(
          `Question in ${chapter.id} must have exactly 4 options: "${q.question}"`
        );
      }
      await prisma.question.create({
        data: {
          classOf: chapter.classOf,
          chapterId: chapter.id,
          question: q.question,
          options: serializeOptions(q.options),
          correctIndex: q.correctIndex,
          difficulty: q.difficulty,
          explanation: q.explanation,
          marks: q.marks ?? 1,
        },
      });
      count++;
    }
  }
  return count;
}
