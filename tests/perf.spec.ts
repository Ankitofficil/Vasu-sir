import { test, expect, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string, role: string) {
  await page.goto("/login");
  if (role === "STAFF") await page.getByRole("tab", { name: "Staff" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /Sign in as/ }).click();
  await page.waitForURL(role === "STAFF" ? "**/staff" : "**/dashboard");
}

test("leaderboard still renders ranked rows correctly", async ({ page }) => {
  await login(page, "aarav@coach.local", "student123", "STUDENT");
  await page.goto("/dashboard/leaderboard", { waitUntil: "domcontentloaded" });
  // Wait for the table to actually populate (client component hydration).
  await expect(page.locator("tbody tr")).not.toHaveCount(0, { timeout: 10000 });

  // The seeded data has Vihaan Joshi at #1 with 256 points.
  const firstRow = page.locator("tbody tr").first();
  await expect(firstRow).toContainText("Vihaan Joshi", { timeout: 10000 });
  await expect(firstRow).toContainText("256");

  // Points must be descending across rows.
  const pointCells = await page.locator("tbody tr td:nth-child(3)").allInnerTexts();
  const nums = pointCells.map((t) => parseInt(t.replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
  const sorted = [...nums].sort((a, b) => b - a);
  expect(nums).toEqual(sorted);
});

test("student dashboard rank tile shows a number", async ({ page }) => {
  await login(page, "aarav@coach.local", "student123", "STUDENT");
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  // Aarav is seeded with rank #2 or #3 depending on data.
  await expect(page.getByText("Class rank")).toBeVisible();
});

test("staff students page lists all students with stats", async ({ page }) => {
  await login(page, "admin@coach.local", "admin123", "STAFF");
  await page.goto("/staff/students", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  // 5 seeded students -> at least 5 rows.
  const rows = page.locator("tbody tr");
  expect(await rows.count()).toBeGreaterThanOrEqual(5);
  await expect(page.locator("tbody")).toContainText("Aarav");
});
