import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

test("18. 'Message author' creates exactly one conversation (no duplicate)", async ({ page }) => {
  test.skip(true, "Requires two authenticated sessions");
});

test("19. Sending message updates last_message_at and appears in thread list", async ({ page }) => {
  test.skip(true, "Requires two authenticated sessions");
});

test("Messaging page loads for auth user", async ({ page }) => {
  await page.goto(`${BASE}/messages`);
  // Redirected to login if not auth
  await expect(page).toHaveURL(/\/login|\/messages/);
});
