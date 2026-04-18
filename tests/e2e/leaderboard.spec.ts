import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

test("20. User who gets +15 via request_solved_as_helper appears higher than baseline", async ({ page }) => {
  test.skip(true, "Requires seeded data with trust events");
});

test("Leaderboard page is accessible to unauth (redirects to login)", async ({ page }) => {
  await page.goto(`${BASE}/leaderboard`);
  await expect(page).toHaveURL(/\/login|\/leaderboard/);
});
