import { test, type Page } from "@playwright/test";

const viewports = [
  { name: "mobile-sm", width: 375, height: 667 },
  { name: "mobile-lg", width: 414, height: 896 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1920, height: 1080 },
];

const publicRoutes = ["/", "/login", "/register"];

const studentRoutes = [
  "/dashboard",
  "/dashboard/attendance",
  "/dashboard/notes",
  "/dashboard/fees",
  "/dashboard/quiz",
  "/dashboard/leaderboard",
];

const staffRoutes = [
  "/staff",
  "/staff/attendance",
  "/staff/notes",
  "/staff/fees",
  "/staff/students",
  "/staff/question-bank",
];

async function login(page: Page, email: string, password: string, role: string) {
  await page.goto("/login");
  await page.getByRole("tab", { name: role === "STAFF" ? "Staff" : "Student" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /Sign in as/ }).click();
  await page.waitForURL(role === "STAFF" ? "**/staff" : "**/dashboard");
}

async function shoot(page: Page, route: string) {
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    // `domcontentloaded` (not `networkidle`): Next.js dev keeps an HMR
    // websocket open, so `networkidle`/`load` can stall under compile load.
    // A short settle lets `"use client"` components hydrate before the shot.
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const slug = route.replace(/\//g, "_") || "home";
    await page.screenshot({
      path: `tests/screenshots/${slug}_${vp.name}.png`,
      fullPage: true,
    });
  }
}

test.describe("public pages", () => {
  for (const route of publicRoutes) {
    test(`public ${route}`, async ({ page }) => {
      await shoot(page, route);
    });
  }
});

test.describe("student pages", () => {
  test("student area", async ({ page }) => {
    await login(page, "aarav@coach.local", "student123", "STUDENT");
    for (const route of studentRoutes) await shoot(page, route);
  });
});

test.describe("staff pages", () => {
  test("staff area", async ({ page }) => {
    await login(page, "admin@coach.local", "admin123", "STAFF");
    for (const route of staffRoutes) await shoot(page, route);
  });
});
