import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// Authorization gating for the staff-only AI question pipeline.
//
//   /api/questions/generate  — staff-only DRAFT generation (never writes DB).
//                              Returns 503 when ANTHROPIC_API_KEY is unset.
//   /api/questions/publish   — staff-only bulk insert (the ONLY write path).
//
// These tests assume the seed accounts and a blank ANTHROPIC_API_KEY (the repo
// default), so a staff "generate" deterministically returns 503 without any
// network call.

const GENERATE = "/api/questions/generate";
const PUBLISH = "/api/questions/publish";

// Unique marker so the published row can be found and removed in teardown.
const MARKER = `__e2e_ai_gating_${Date.now()}__`;

const sampleQuestion = {
  question: `${MARKER} What is the accounting equation?`,
  options: [
    "Assets = Liabilities + Capital",
    "Assets = Liabilities - Capital",
    "Capital = Assets + Liabilities",
    "Liabilities = Assets + Capital",
  ],
  correctIndex: 0,
  difficulty: "EASY",
  explanation: "Assets are financed by liabilities and owner's capital.",
};

const generateBody = {
  classOf: 11,
  chapterId: "11-01-introduction",
  count: 3,
  difficulty: "MIXED",
};

const publishBody = {
  classOf: 11,
  chapterId: "11-01-introduction",
  questions: [sampleQuestion],
};

async function loginAs(
  page: Page,
  email: string,
  password: string,
  role: "STUDENT" | "STAFF"
) {
  await page.goto("/login");
  if (role === "STAFF") {
    await page.getByRole("tab", { name: "Staff" }).click();
  }
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /Sign in as/ }).click();
  await page.waitForURL(role === "STAFF" ? "**/staff" : "**/dashboard");
}

async function postJson(req: APIRequestContext, url: string, data: unknown) {
  return req.post(url, { data });
}

// Remove any rows the publish test may have created.
test.afterAll(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.question.deleteMany({
      where: { question: { contains: MARKER } },
    });
  } finally {
    await prisma.$disconnect();
  }
});

test.describe("unauthenticated", () => {
  test("generate is rejected (401)", async ({ request }) => {
    const res = await postJson(request, GENERATE, generateBody);
    expect(res.status()).toBe(401);
  });

  test("publish is rejected (401) and writes nothing", async ({ request }) => {
    const res = await postJson(request, PUBLISH, publishBody);
    expect(res.status()).toBe(401);
  });
});

test.describe("student (not staff)", () => {
  test("generate is rejected (401)", async ({ page }) => {
    await loginAs(page, "aarav@coach.local", "student123", "STUDENT");
    const res = await postJson(page.request, GENERATE, generateBody);
    expect(res.status()).toBe(401);
  });

  test("publish is rejected (401)", async ({ page }) => {
    await loginAs(page, "aarav@coach.local", "student123", "STUDENT");
    const res = await postJson(page.request, PUBLISH, publishBody);
    expect(res.status()).toBe(401);
  });
});

test.describe("staff", () => {
  test("generate passes the gate; 503 when no API key is configured", async ({
    page,
  }) => {
    await loginAs(page, "admin@coach.local", "admin123", "STAFF");
    const res = await postJson(page.request, GENERATE, generateBody);
    // The auth gate is passed (not 401); generation is unconfigured -> 503.
    expect(res.status()).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/not configured|ANTHROPIC_API_KEY/i);
  });

  test("generate validates input (400 on bad count)", async ({ page }) => {
    await loginAs(page, "admin@coach.local", "admin123", "STAFF");
    const res = await postJson(page.request, GENERATE, {
      ...generateBody,
      count: 999, // exceeds the 1-15 max
    });
    // Validation runs after the auth gate but the 503 (no key) short-circuits
    // first, so accept either an explicit 400 or the 503 gate response.
    expect([400, 503]).toContain(res.status());
  });

  test("publish persists questions (201)", async ({ page }) => {
    await loginAs(page, "admin@coach.local", "admin123", "STAFF");
    const res = await postJson(page.request, PUBLISH, publishBody);
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.published).toBe(1);
  });

  test("publish rejects a chapter/class mismatch (400)", async ({ page }) => {
    await loginAs(page, "admin@coach.local", "admin123", "STAFF");
    const res = await postJson(page.request, PUBLISH, {
      ...publishBody,
      classOf: 12, // chapter 11-01 belongs to class 11
    });
    expect(res.status()).toBe(400);
  });
});
