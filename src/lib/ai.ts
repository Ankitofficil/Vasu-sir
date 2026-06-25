import Anthropic from "@anthropic-ai/sdk";
import { DIFFICULTIES, type Difficulty } from "@/lib/enums";
import { getChapter } from "@/lib/chapters";

// AI question generation with Claude Haiku 4.5.
//
// We use strict tool use so the model is forced to return MCQs in an exact
// schema (4 options, a correctIndex, difficulty, explanation) — far more
// reliable than parsing free-form JSON out of a text response.
//
// This module only *generates draft* questions. Persisting them to the
// question bank ("publish") is a separate, staff-gated step.

const MODEL = "claude-haiku-4-5";

export interface GeneratedQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  difficulty: Difficulty;
  explanation: string;
}

export function isAIConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const submitTool: Anthropic.Tool = {
  name: "submit_questions",
  description: "Submit the generated multiple-choice questions.",
  // strict: true guarantees the input validates exactly against this schema.
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      questions: {
        type: "array",
        description: "The generated MCQs.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            question: { type: "string", description: "The question stem." },
            options: {
              type: "array",
              description: "Exactly four answer options.",
              items: { type: "string" },
            },
            correctIndex: {
              type: "integer",
              description: "0-based index of the correct option (0-3).",
              enum: [0, 1, 2, 3],
            },
            difficulty: {
              type: "string",
              enum: [...DIFFICULTIES],
            },
            explanation: {
              type: "string",
              description: "A one or two sentence explanation of the answer.",
            },
          },
          required: [
            "question",
            "options",
            "correctIndex",
            "difficulty",
            "explanation",
          ],
        },
      },
    },
    required: ["questions"],
  },
};

export async function generateQuestions(params: {
  classOf: 11 | 12;
  chapterId: string;
  count: number;
  difficulty: Difficulty | "MIXED";
}): Promise<GeneratedQuestion[]> {
  const chapter = getChapter(params.chapterId);
  if (!chapter || chapter.classOf !== params.classOf) {
    throw new Error("Chapter does not match the selected class");
  }

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

  const difficultyLine =
    params.difficulty === "MIXED"
      ? "Use a mix of EASY, MEDIUM and HARD difficulties."
      : `All questions must be ${params.difficulty} difficulty.`;

  const system =
    "You are an expert CBSE Accountancy teacher writing multiple-choice questions " +
    "for Indian Class 11 and 12 students. Questions must be factually correct, " +
    "exam-relevant, unambiguous, and have exactly one correct option. Keep stems " +
    "concise. Avoid 'All of the above' / 'None of the above'. Vary the position of " +
    "the correct answer. Always call the submit_questions tool with your result.";

  const userPrompt =
    `Generate ${params.count} multiple-choice questions for ` +
    `CBSE Class ${params.classOf} Accountancy, chapter "${chapter.name}". ` +
    `${difficultyLine} Each question must have exactly 4 options and a short ` +
    `explanation of why the correct option is right.`;

  // Haiku 4.5: no `effort` param (errors on Haiku); thinking not needed here.
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system,
    tools: [submitTool],
    tool_choice: { type: "tool", name: "submit_questions" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("The model did not return any questions");
  }

  const input = toolUse.input as { questions?: unknown };
  const raw = Array.isArray(input.questions) ? input.questions : [];

  // Defensive validation — even with strict tool use we sanity-check shape.
  const valid: GeneratedQuestion[] = [];
  for (const q of raw as GeneratedQuestion[]) {
    if (
      typeof q?.question === "string" &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every((o) => typeof o === "string" && o.trim().length > 0) &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex <= 3 &&
      DIFFICULTIES.includes(q.difficulty) &&
      typeof q.explanation === "string"
    ) {
      valid.push(q);
    }
  }
  return valid;
}
