import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DIFFICULTIES } from "@/lib/enums";
import { generateQuestions, isAIConfigured } from "@/lib/ai";

// Staff-only: generate DRAFT MCQs with Claude Haiku. This does NOT save to the
// question bank — staff review the drafts and publish them separately.
const schema = z.object({
  classOf: z.union([z.literal(11), z.literal(12)]),
  chapterId: z.string().min(1),
  count: z.number().int().min(1).max(15),
  difficulty: z.enum(["MIXED", ...DIFFICULTIES]),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAIConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI generation is not configured. Add ANTHROPIC_API_KEY to the server environment.",
      },
      { status: 503 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const questions = await generateQuestions(parsed.data);
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "The model returned no usable questions. Try again." },
        { status: 502 }
      );
    }
    return NextResponse.json({ questions });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generation failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
