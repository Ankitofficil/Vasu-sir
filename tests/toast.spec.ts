import { test, expect, type Page } from "@playwright/test";

async function loginStaff(page: Page) {
  await page.goto("/login");
  await page.getByRole("tab", { name: "Staff" }).click();
  await page.getByLabel("Email").fill("admin@coach.local");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: /Sign in as Staff/ }).click();
  await page.waitForURL("**/staff");
}

test("toast appears on fee status change", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await loginStaff(page);
  await page.goto("/staff/fees", { waitUntil: "domcontentloaded" });

  const select = page.locator("select").first();
  await select.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(800); // let the client component hydrate
  const current = await select.inputValue();
  await select.selectOption(current === "PAID" ? "PENDING" : "PAID");

  await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 4000 });
  await page.screenshot({ path: "tests/screenshots/toast.png", fullPage: false });
});
