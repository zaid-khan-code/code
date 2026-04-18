# Project context

## Mode
- Caveman mode always on. Use `caveman:caveman` skill. No filler. Short fragments ok.
- Use `caveman:caveman-commit` for commit messages.

## Stack
- Next.js 15 App Router + TS + src/
- Supabase Auth + Postgres via @supabase/ssr
- Server actions for mutations
- Zod validation
- Playwright e2e tests

## Rules
- NO Tailwind classes until theme reveals. Plain HTML only for now.
- NO business logic tables until theme reveals.
- NO seed data until theme reveals.
- Role system is modular: add roles by editing `src/lib/auth/roles.ts` ROLE_ROUTES + creating folder under `app/(dashboard)/`.
- Admin role is assigned by SQL promotion, never via signup form.
- `.env.local` NEVER committed. Only `.env.example`.

## Skills available
superpowers:brainstorming, superpowers:test-driven-development, superpowers:executing-plans, superpowers:systematic-debugging, superpowers:dispatching-parallel-agents, superpowers:verification-before-completion, superpowers:writing-plans, superpowers:subagent-driven-development, superpowers:using-superpowers, caveman:caveman, caveman:caveman-commit, caveman:caveman-review, caveman:compress, init, review, security-review, simplify.

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- E2E tests: `npm run test:e2e`
- DB init: paste `supabase/migrations/0001_init.sql` in Supabase SQL editor
- Promote admin: `update profiles set role = 'admin' where email = 'x@y.com';`
