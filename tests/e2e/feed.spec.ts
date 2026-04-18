import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

test("15. Filter by urgency=critical returns only critical requests", async ({ page: _page }) => {
  test.skip(true, "Requires authenticated session + seeded data");
  await page.goto(`${BASE}/explore?urgency=critical`);
  const cards = await page.locator("[data-urgency]").all();
  for (const card of cards) {
    await expect(card).toHaveAttribute("data-urgency", "critical");
  }
});

test("16. Filter by category narrows results", async ({ page: _p }) => {
  test.skip(true, "Requires authenticated session + seeded data");
  await page.goto(`${BASE}/explore?category=Programming`);
  await expect(page.locator("body")).toContainText(/Programming/i);
});

test("17. Pagination cursor works for >20 requests", async ({ page }) => {
  test.skip(true, "Requires seeded data with >20 requests");
  await page.goto(`${BASE}/explore`);
  const nextBtn = page.locator("a:has-text('Next'), button:has-text('Next')");
  if (await nextBtn.count() > 0) {
    await nextBtn.click();
    await expect(page).toHaveURL(/cursor=/);
  }
});
