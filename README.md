# Hackathon Boilerplate

Next.js 15 App Router + Supabase Auth + Role-based routing.

## Setup

### 1. Environment variables

Copy `.env.example` to `.env.local` and fill in values:

```
NEXT_PUBLIC_SUPABASE_URL=<your project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
```

> **Security:** Rotate the DB password in Supabase dashboard before first real use.
> Service role key is server-side only — never import it in client components.

### 2. Initialize Supabase schema

Paste the contents of `supabase/migrations/0001_init.sql` into the Supabase SQL editor and run it.

This creates:
- `user_role` enum (`admin`, `user`)
- `profiles` table with RLS
- Trigger that auto-creates profile on signup

### 3. Promote a user to admin

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

Run this in the Supabase SQL editor. Admin role is never set via signup form.

### 4. Run dev

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint |
| `npm run test:e2e` | Run Playwright e2e tests |

## Adding a new role

1. Add enum value in Supabase SQL: `alter type user_role add value 'manager';`
2. Add to `ROLES` and `ROLE_ROUTES` in `src/lib/auth/roles.ts`
3. Create `src/app/(dashboard)/manager/page.tsx`

That is all. Middleware, guards, redirects all read from `ROLE_ROUTES`.

## Architecture

```
src/lib/auth/roles.ts     — single source of truth for role→path mapping
src/lib/auth/actions.ts   — signUp / signIn / signOut server actions
src/lib/supabase/         — Supabase client helpers (browser + server + middleware)
middleware.ts             — route protection + role enforcement
```
