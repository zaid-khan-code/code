import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

test("23. /api/ai/categorize returns category=Programming for React error text", async ({ page }) => {
  const res = await page.request.post(`${BASE}/api/ai/categorize`, {
    data: {
      title: "React error",
      description: "React error Cannot read properties of undefined reading map",
    },
    headers: { "Content-Type": "application/json" },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.category).toBe("Programming");
});

test("24. /api/ai/urgency returns critical for ASAP deadline text", async ({ page }) => {
  const res = await page.request.post(`${BASE}/api/ai/urgency`, {
    data: {
      text: "ASAP, deadline in 2 hours, emergency submission",
    },
    headers: { "Content-Type": "application/json" },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.urgency).toBe("critical");
});
