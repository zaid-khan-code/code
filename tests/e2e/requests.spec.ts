import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

test("10. Create request → detail page shows AI category + urgency pill", async ({ page }) => {
  test.skip(true, "Requires authenticated session — run with auth state file");
  await page.goto(`${BASE}/requests/new`);
  await page.fill('input[name="title"]', "React useEffect memory leak ASAP tonight");
  await page.fill('textarea[name="description"]', "I have a React component that leaks memory via useEffect. The listener is not cleaned up properly and causes warnings. Need help urgently tonight.");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/requests\//);
  await expect(page.locator("body")).toContainText(/Programming/i);
  await expect(page.locator("body")).toContainText(/high|critical/i);
});

test("11. Author sees 'Mark solved'; non-author does not", async () => {
  test.skip(true, "Requires two authenticated sessions");
});

test("12. Non-author clicks 'I can help' → notification fires", async () => {
  test.skip(true, "Requires two authenticated sessions");
});

test("13. Marking solved sets solved_at and status badge", async () => {
  test.skip(true, "Requires authenticated session");
});

test("14. Rewrite with AI button returns non-empty text", async ({ page }) => {
  const res = await page.request.post(`${BASE}/api/ai/summarize`, {
    data: { text: "I kinda have a problem with my react code its not working properly and stuff", mode: "rewrite" },
    headers: { "Content-Type": "application/json" },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  const result: string = body.summary ?? body.rewrite ?? "";
  expect(result.length).toBeGreaterThan(0);
});
