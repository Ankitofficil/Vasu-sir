import { test, expect, type Page } from "@playwright/test";

// Security guarantee: the active-quiz payload must never include the correct
// answer or explanation — grading happens only server-side on submit.

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /Sign in as/ }).click();
  await page.waitForURL("**/dashboard");
}

test("GET /api/quiz does not leak answers", async ({ page }) => {
  await login(page, "aarav@coach.local", "student123");

  const res = await page.request.get(
    "/api/quiz?chapterId=11-01-introduction&classOf=11&count=5&difficulty=ALL"
  );
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  const raw = JSON.stringify(body);

  expect(body.questions.length).toBeGreaterThan(0);
  for (const q of body.questions) {
    expect(q).not.toHaveProperty("correctIndex");
    expect(q).not.toHaveProperty("explanation");
    expect(q).not.toHaveProperty("answer");
  }
  expect(raw).not.toContain("correctIndex");
  expect(raw).not.toContain("explanation");
});

test("unauthenticated request to /api/quiz is rejected", async ({ request }) => {
  const res = await request.get(
    "/api/quiz?chapterId=11-01-introduction&classOf=11&count=5&difficulty=ALL"
  );
  expect(res.status()).toBe(401);
});
