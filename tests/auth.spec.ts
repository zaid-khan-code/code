import { test, expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function randomEmail() {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
}

const TEST_PASSWORD = 'testpass123';
const ADMIN_EMAIL = `admin_${Date.now()}@example.com`;

async function deleteUser(email: string) {
  const { data } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single();
  if (data?.id) {
    await supabaseAdmin.auth.admin.deleteUser(data.id);
  }
}

async function createUser(email: string, password: string): Promise<string> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user.id;
}

async function promoteToAdmin(email: string) {
  await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('email', email);
}

async function signInAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}

let adminEmail: string;
const createdUsers: string[] = [];

test.beforeAll(async () => {
  adminEmail = ADMIN_EMAIL;
  await createUser(adminEmail, TEST_PASSWORD);
  await promoteToAdmin(adminEmail);
  createdUsers.push(adminEmail);
});

test.afterAll(async () => {
  for (const email of createdUsers) {
    await deleteUser(email).catch(() => {});
  }
});

test('1. Signup new user → redirects to /user', async ({ page }) => {
  const email = randomEmail();
  createdUsers.push(email);
  await page.goto('/signup');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/user/);
});

test('2. Signup duplicate email → error shown', async ({ page }) => {
  const email = randomEmail();
  createdUsers.push(email);
  await createUser(email, TEST_PASSWORD);
  await page.goto('/signup');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).not.toHaveURL(/\/user/);
  await expect(page.locator('p')).toContainText(/already|registered|exist/i);
});

test('3. Signup weak password → Zod error shown', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('input[name="email"]', randomEmail());
  await page.fill('input[name="password"]', 'short');
  await page.click('button[type="submit"]');
  await expect(page).not.toHaveURL(/\/user/);
  await expect(page.locator('p')).toContainText(/8/i);
});

test('4. Login valid user → redirects to /user', async ({ page }) => {
  const email = randomEmail();
  createdUsers.push(email);
  await createUser(email, TEST_PASSWORD);
  await signInAs(page, email, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/user/);
});

test('5. Login wrong password → error shown', async ({ page }) => {
  const email = randomEmail();
  createdUsers.push(email);
  await createUser(email, TEST_PASSWORD);
  await signInAs(page, email, 'wrongpassword');
  await expect(page).not.toHaveURL(/\/user/);
  await expect(page.locator('p')).toBeVisible();
});

test('6. Login as admin → redirects to /admin', async ({ page }) => {
  await signInAs(page, adminEmail, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/admin/);
});

test('7. User hits /admin directly → redirected to /user', async ({ page }) => {
  const email = randomEmail();
  createdUsers.push(email);
  await createUser(email, TEST_PASSWORD);
  await signInAs(page, email, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/user/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/user/);
});

test('8. Admin hits /user directly → redirected to /admin', async ({ page }) => {
  await signInAs(page, adminEmail, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/admin/);
  await page.goto('/user');
  await expect(page).toHaveURL(/\/admin/);
});

test('9. Unauthed hits /admin → redirected to /login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});

test('10. Unauthed hits /user → redirected to /login', async ({ page }) => {
  await page.goto('/user');
  await expect(page).toHaveURL(/\/login/);
});

test('11. Authed hits /login → redirected to role dashboard', async ({ page }) => {
  const email = randomEmail();
  createdUsers.push(email);
  await createUser(email, TEST_PASSWORD);
  await signInAs(page, email, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/user/);
  await page.goto('/login');
  await expect(page).toHaveURL(/\/user/);
});

test('12. Logout → /admin → redirected to /login', async ({ page }) => {
  await signInAs(page, adminEmail, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/admin/);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});
