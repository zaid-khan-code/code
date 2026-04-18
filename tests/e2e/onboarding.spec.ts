import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PASSWORD = "testpass123!";

function email() {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
}

async function signupAndGoToOnboarding(page: Page) {
  await page.goto(`${BASE}/signup`);
  await page.fill('input[name="email"]', email());
  await page.fill('input[name="full_name"]', "Onboarding Tester");
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/onboarding/);
}

test("7. Cannot skip step 3 — skills required", async ({ page }) => {
  await signupAndGoToOnboarding(page);
  // Fill step 1
  await page.fill('input[name="username"]', `user_${Date.now()}`);
  await page.click('button[type="submit"]');
  // Step 2 — pick mode
  await expect(page).toHaveURL(/step=2/);
  await page.click("button:has-text('Both')");
  // Step 3 — try to continue with 0 skills
  await expect(page).toHaveURL(/step=3/);
  await page.click("button:has-text('Continue')");
  await expect(page).toHaveURL(/step=3/);
  await expect(page.locator("body")).toContainText(/skill/i);
});

test("8. Finishing onboarding sets onboarded=true → redirects /dashboard", async ({ page }) => {
  await signupAndGoToOnboarding(page);
  // Step 1
  await page.fill('input[name="username"]', `user_${Date.now()}`);
  await page.click('button[type="submit"]');
  // Step 2
  await expect(page).toHaveURL(/step=2/);
  await page.click("button:has-text('Both')");
  // Step 3 — select first skill
  await expect(page).toHaveURL(/step=3/);
  await page.locator(".skill-chip, [data-skill], div[role='button']").first().click().catch(() => {
    page.locator("div").filter({ hasText: /JavaScript/ }).first().click();
  });
  await page.click("button:has-text('Continue')");
  // Step 4 — select 3 interests
  await expect(page).toHaveURL(/step=4/);
  const interestBtns = await page.locator("button[type='button']").all();
  for (const btn of interestBtns.slice(0, 3)) {
    await btn.click();
  }
  await page.click("button[type='submit']");
  await expect(page).toHaveURL(/\/dashboard/);
});

test("9. AI skill suggestion returns ≥1 skill for bio 'I am a React developer'", async ({ page }) => {
  const res = await page.request.post(`${BASE}/api/ai/suggest-tags`, {
    data: { title: "React developer", description: "I am a React developer who loves design systems" },
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json();
  const tags: string[] = body.tags ?? [];
  expect(tags.length).toBeGreaterThanOrEqual(1);
});
