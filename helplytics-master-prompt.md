# HELPLYTICS AI — CLAUDE CODE MASTER PROMPT

Paste this entire file into Claude Code in one shot after the hackathon theme is revealed. This is the day-of "theme dump" continuation of the pre-theme boilerplate.

---

## 0. STACK NOTE (READ FIRST)

The brief says Batch 16 = MERN. You are NOT using MongoDB. You are using **Next.js 15 App Router + TypeScript + Supabase (Postgres + Auth)** as locked in the pre-theme boilerplate chat. Reason: solo hackathon, single Vercel deploy, no CORS, no two-repo overhead. Supabase replaces both Mongo and Express. React + Node are still present via Next.js. If a trainer asks: this is "Next.js + Supabase fullstack, Postgres instead of Mongo for RLS + realtime out of the box." Move on.

---

## 0.1 REFERENCE MATERIAL (READ BEFORE CODING)

Full requirements + UI reference images are in the `@requirement/` folder at repo root. Also the original hackathon brief PDF — read it cover to cover.

Before writing any code, run:

```bash
ls -la @requirement/
```

Then for every file in that folder:
- **PDF / Markdown / text** → read in full.
- **Images (`.png`, `.jpg`, `.jpeg`, `.webp`)** → open each with the Read tool (Claude Code supports image reads). Build a mental model of:
  - layout structure (grid, rail positions, card rhythm)
  - color palette (override `tokens.ts` values in section 4 if the reference diverges)
  - typography scale and weight
  - spacing rhythm
  - component shapes (radius, borders, shadow depth)
  - empty states, loading states, hover states if shown
- **Any video / gif** → describe frame by frame, extract interaction patterns.

Rule of precedence when sources conflict:
1. UI reference images in `@requirement/` — **visual truth**
2. Hackathon brief PDF — **feature truth**
3. This master prompt — **architecture + implementation truth**

If a reference image shows a page not listed in section 8, add it. If section 8 describes a page the reference contradicts visually, the reference wins — rewrite the page spec in-line before building.

Output a one-file summary at `docs/reference-audit.md` before Wave 2 starts:

```markdown
# Reference audit
## Files reviewed
- @requirement/brief.pdf  — matches section 8 (noted diffs: ...)
- @requirement/landing.png — hero uses split layout, not stacked. OVERRIDE landing spec.
- @requirement/dashboard.png — sidebar is dark, not light. OVERRIDE tokens.color.bg for (app) shell.
- ...
## Overrides applied
- tokens.color.brand: was #4F46E5 → now <hex from image>
- Landing hero: stacked → split
- ...
## Open questions
- (list anything ambiguous; do NOT block on these, pick the nearest sensible interpretation)
```

Do this audit **before** Agent DESIGN builds primitives. Without it, the UI will drift from the reference and you will rework it on day-of.

---

## 1. MISSION

Build **Helplytics AI** — a multi-page community support platform where students post help requests and skilled community members offer help. Full spec below. Ship all mandatory pages + all 4 bonus features + multiple AI features. One commit per logical unit. Caveman mode for all output. No placeholder text beyond the pre-theme boilerplate — every page must work end to end.

---

## 2. PRE-FLIGHT (DO FIRST, ONE COMMAND EACH)

```bash
# Confirm you are in project root
pwd
ls -la

# Confirm reference folder present
ls -la @requirement/ && file @requirement/*

# Confirm boilerplate still builds
npm run build

# Confirm Supabase env vars loaded
grep -c SUPABASE .env.local   # must be >= 2

# Confirm git clean
git status
```

If `.env.local` is missing or the build breaks, STOP and fix before writing any feature code. If `@requirement/` is empty or missing, STOP and ask the user where the references live — do not guess UI without them.

**Security reminder:** Supabase password was exposed previously. Verify it was rotated in Supabase dashboard. Never echo `.env.local`. Never commit it. `.env.example` is the only committed env file.

---

## 3. CONVENTIONS (DO NOT DEVIATE)

- Caveman mode for all human-facing output. Short fragments. No filler. No pleasantries. No "Let me…" preambles. Technical terms intact. Code blocks unchanged.
- Commit with `caveman:caveman-commit` skill. One logical unit per commit.
- Use `superpowers:dispatching-parallel-agents` + `superpowers:subagent-driven-development` for all multi-file work.
- Run `superpowers:verification-before-completion` at end of every wave.
- Run `security-review` skill before final commit.
- Never widen RLS to bypass a bug. Fix the query.
- Never commit `service_role` key. Server-only code uses `createAdminClient()` from a file that imports the key from env at runtime.
- Zod-validate every server action input.
- TypeScript strict. No `any`. Use `Database` type from generated Supabase types.
- Tailwind allowed now (theme revealed). Use design tokens from `src/lib/design/tokens.ts` — no raw hex except inside tokens file.

---

## 4. DESIGN SYSTEM (LOCK BEFORE UI WORK)

Inspiration: Notion + Linear + Stripe. Calm, card-heavy, generous whitespace, quiet type.

Create `src/lib/design/tokens.ts`:

```ts
export const tokens = {
  color: {
    bg:        "#FAFAF9",
    surface:   "#FFFFFF",
    surface2:  "#F4F4F5",
    border:    "#E4E4E7",
    text:      "#18181B",
    textMuted: "#71717A",
    textDim:   "#A1A1AA",
    brand:     "#4F46E5",   // indigo-600
    brandFg:   "#FFFFFF",
    accent:    "#10B981",   // emerald-500
    warn:      "#F59E0B",
    danger:    "#EF4444",
    urgencyLow:      "#10B981",
    urgencyMedium:   "#F59E0B",
    urgencyHigh:     "#F97316",
    urgencyCritical: "#EF4444",
  },
  radius: { sm: "6px", md: "10px", lg: "14px", xl: "20px", pill: "999px" },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,.04)",
    md: "0 4px 12px rgba(0,0,0,.06)",
    lg: "0 12px 32px rgba(0,0,0,.08)",
  },
  font: {
    sans: `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto`,
    mono: `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo`,
  },
} as const;
```

Rules:
- Card radius = `lg`. Pill/badge radius = `pill`.
- Base padding = 16/20/24. Never 12 or 28. Grid step of 4.
- Text scale: 12 / 14 / 16 / 20 / 28 / 36 — nothing else.
- Line heights: 1.4 body, 1.2 headings.
- Borders over shadows. Use `border: 1px solid var(--border)` as default separator. Shadow only for popovers, modals, hover lift.
- No gradients except one — the hero on landing. Subtle, 180deg, brand → surface.

Add a minimal UI primitive set in `src/components/ui/`:
- `Card.tsx`, `Button.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Badge.tsx`, `Avatar.tsx`, `Empty.tsx`, `Stat.tsx`, `Tabs.tsx`, `Dialog.tsx`, `Toast.tsx`
- Each uses tokens only. Variants via discriminated props. No className prop bleed from parents.

---

## 5. FILE STRUCTURE (TARGET)

```
src/
  app/
    layout.tsx
    page.tsx                         # Landing
    globals.css
    (auth)/
      login/page.tsx
      signup/page.tsx
      actions.ts
    onboarding/
      page.tsx
      actions.ts
    (app)/
      layout.tsx                     # shell: sidebar + topbar, auth required
      dashboard/page.tsx
      explore/page.tsx
      explore/_components/FeedFilters.tsx
      requests/
        new/page.tsx
        new/actions.ts
        [id]/page.tsx
        [id]/actions.ts
      messages/page.tsx
      messages/[conversationId]/page.tsx
      messages/actions.ts
      leaderboard/page.tsx
      ai/page.tsx                    # AI Center
      notifications/page.tsx
      notifications/actions.ts
      profile/[username]/page.tsx
      profile/me/page.tsx
      profile/actions.ts
    admin/
      layout.tsx                     # admin-only
      page.tsx                       # dashboard
      requests/page.tsx
      users/page.tsx
      analytics/page.tsx
      actions.ts
    api/
      ai/categorize/route.ts
      ai/urgency/route.ts
      ai/summarize/route.ts
      ai/suggest-tags/route.ts
      ai/suggest-response/route.ts
      ai/insights/route.ts
  components/
    ui/...
    cards/RequestCard.tsx
    cards/UserCard.tsx
    cards/BadgeCard.tsx
    layout/Sidebar.tsx
    layout/Topbar.tsx
    layout/NotifBell.tsx
  lib/
    supabase/client.ts
    supabase/server.ts
    supabase/admin.ts
    supabase/middleware.ts
    supabase/types.ts                # generated
    auth/roles.ts                    # ROLE_ROUTES map, helpers
    auth/guards.ts                   # requireUser, requireAdmin, requireOnboarded
    design/tokens.ts
    ai/categorize.ts
    ai/urgency.ts
    ai/tags.ts
    ai/summarize.ts
    ai/suggest.ts
    ai/insights.ts
    ai/claude.ts                     # optional Anthropic API wrapper, feature-flagged
    ai/dictionaries.ts               # keyword -> category, urgency words, etc
    trust/score.ts                   # trust score rules
    notifications/emit.ts            # server helper to insert notification rows
    zod/schemas.ts
  middleware.ts
supabase/
  migrations/
    0001_boilerplate.sql             # existing
    0002_helplytics_schema.sql       # NEW (section 6)
    0003_helplytics_seed.sql         # NEW (section 6.5)
tests/
  e2e/
    auth.spec.ts
    onboarding.spec.ts
    requests.spec.ts
    feed.spec.ts
    messaging.spec.ts
    leaderboard.spec.ts
    admin.spec.ts
    ai.spec.ts
CLAUDE.md
README.md
```

---

## 6. DATABASE MIGRATION — `supabase/migrations/0002_helplytics_schema.sql`

Write this migration verbatim. Every table has RLS. Every policy is explicit.

```sql
-- =========================================================
-- HELPLYTICS SCHEMA
-- =========================================================

-- Profiles: extend existing from boilerplate
alter table public.profiles
  add column if not exists full_name     text,
  add column if not exists username      text unique,
  add column if not exists user_mode     text check (user_mode in ('need_help','can_help','both')),
  add column if not exists location      text,
  add column if not exists bio           text,
  add column if not exists avatar_url    text,
  add column if not exists trust_score   integer not null default 0,
  add column if not exists onboarded     boolean not null default false;

-- Skills catalog
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text not null,
  created_at timestamptz not null default now()
);

-- User <-> skill junction (both offer + need flags)
create table if not exists public.user_skills (
  user_id uuid references public.profiles(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  can_help boolean not null default false,
  needs_help boolean not null default false,
  primary key (user_id, skill_id)
);

-- Interests
create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);
create table if not exists public.user_interests (
  user_id uuid references public.profiles(id) on delete cascade,
  interest_id uuid references public.interests(id) on delete cascade,
  primary key (user_id, interest_id)
);

-- Requests
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text,
  urgency text not null default 'medium' check (urgency in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','in_progress','solved','closed')),
  tags text[] not null default '{}',
  location text,
  ai_category text,
  ai_urgency_score real,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  solved_at timestamptz
);
create index if not exists idx_requests_status on public.requests(status);
create index if not exists idx_requests_category on public.requests(category);
create index if not exists idx_requests_urgency on public.requests(urgency);
create index if not exists idx_requests_author on public.requests(author_id);
create index if not exists idx_requests_created on public.requests(created_at desc);

-- Helpers (offers on a request)
create table if not exists public.request_helpers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  helper_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'offered' check (status in ('offered','accepted','completed','declined')),
  note text,
  created_at timestamptz not null default now(),
  unique(request_id, helper_id)
);

-- Messaging
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests(id) on delete set null,
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  check (user_a <> user_b)
);
create unique index if not exists uniq_conversation_pair
  on public.conversations (least(user_a,user_b), greatest(user_a,user_b), coalesce(request_id::text,''));

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists idx_messages_conv on public.messages(conversation_id, created_at);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('new_helper','request_solved','new_message','badge_earned','request_commented','status_change','system')),
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user on public.notifications(user_id, created_at desc);

-- Badges
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  icon text not null,
  criteria jsonb not null
);
create table if not exists public.user_badges (
  user_id uuid references public.profiles(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- Trust events (audit + recompute source)
create table if not exists public.trust_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  delta integer not null,
  ref_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_trust_user on public.trust_events(user_id);

-- =========================================================
-- RLS
-- =========================================================
alter table public.skills            enable row level security;
alter table public.user_skills       enable row level security;
alter table public.interests         enable row level security;
alter table public.user_interests    enable row level security;
alter table public.requests          enable row level security;
alter table public.request_helpers   enable row level security;
alter table public.conversations     enable row level security;
alter table public.messages          enable row level security;
alter table public.notifications     enable row level security;
alter table public.badges            enable row level security;
alter table public.user_badges       enable row level security;
alter table public.trust_events      enable row level security;

-- Helper: is admin
create or replace function public.is_admin(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;

-- skills / interests: read for all authed, write admin only
create policy skills_read on public.skills for select to authenticated using (true);
create policy skills_admin on public.skills for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy interests_read on public.interests for select to authenticated using (true);
create policy interests_admin on public.interests for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- user_skills / user_interests: owner only
create policy us_own on public.user_skills for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ui_own on public.user_interests for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- requests: everyone authed reads; author writes; admin overrides
create policy req_read on public.requests for select to authenticated using (true);
create policy req_insert on public.requests for insert to authenticated with check (author_id = auth.uid());
create policy req_update_own on public.requests for update to authenticated using (author_id = auth.uid() or public.is_admin(auth.uid()));
create policy req_delete_admin on public.requests for delete to authenticated using (public.is_admin(auth.uid()));

-- helpers: request author + helper can read; anyone authed can insert as helper; only helper/author can update; admin all
create policy rh_read on public.request_helpers for select to authenticated using (
  helper_id = auth.uid()
  or exists (select 1 from public.requests r where r.id = request_id and r.author_id = auth.uid())
  or public.is_admin(auth.uid())
);
create policy rh_insert on public.request_helpers for insert to authenticated with check (helper_id = auth.uid());
create policy rh_update on public.request_helpers for update to authenticated using (
  helper_id = auth.uid()
  or exists (select 1 from public.requests r where r.id = request_id and r.author_id = auth.uid())
  or public.is_admin(auth.uid())
);

-- conversations: only participants
create policy conv_read on public.conversations for select to authenticated using (user_a = auth.uid() or user_b = auth.uid() or public.is_admin(auth.uid()));
create policy conv_insert on public.conversations for insert to authenticated with check (user_a = auth.uid() or user_b = auth.uid());
create policy msg_read on public.messages for select to authenticated using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.user_a = auth.uid() or c.user_b = auth.uid()))
  or public.is_admin(auth.uid())
);
create policy msg_insert on public.messages for insert to authenticated with check (sender_id = auth.uid());

-- notifications: owner only
create policy notif_owner on public.notifications for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- badges / user_badges: all authed read; admin manages catalog; user_badges server-writes via admin client
create policy badge_read on public.badges for select to authenticated using (true);
create policy badge_admin on public.badges for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy ub_read on public.user_badges for select to authenticated using (true);

-- trust_events: user reads own; server writes via admin
create policy te_read_own on public.trust_events for select to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- =========================================================
-- TRIGGERS
-- =========================================================

-- updated_at
create or replace function public.tg_touch_updated() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists requests_touch on public.requests;
create trigger requests_touch before update on public.requests
  for each row execute function public.tg_touch_updated();

-- conversation last_message_at
create or replace function public.tg_bump_conv() returns trigger language plpgsql as $$
begin update public.conversations set last_message_at = now() where id = new.conversation_id; return new; end $$;
drop trigger if exists msg_bump_conv on public.messages;
create trigger msg_bump_conv after insert on public.messages
  for each row execute function public.tg_bump_conv();

-- auto-solve timestamp
create or replace function public.tg_solved_at() returns trigger language plpgsql as $$
begin
  if new.status = 'solved' and (old.status is null or old.status <> 'solved') then
    new.solved_at = now();
  end if;
  return new;
end $$;
drop trigger if exists req_solved on public.requests;
create trigger req_solved before update on public.requests
  for each row execute function public.tg_solved_at();
```

---

## 6.5. SEED DATA — `supabase/migrations/0003_helplytics_seed.sql`

```sql
-- Skills (initial catalog, ~40)
insert into public.skills (name, category) values
  ('JavaScript','Programming'),('TypeScript','Programming'),('React','Programming'),
  ('Node.js','Programming'),('Python','Programming'),('SQL','Programming'),
  ('HTML/CSS','Programming'),('Git','Programming'),('Docker','DevOps'),
  ('AWS','DevOps'),('Linux','DevOps'),('Figma','Design'),('UI Design','Design'),
  ('UX Research','Design'),('Photoshop','Design'),('Illustration','Design'),
  ('Writing','Content'),('Editing','Content'),('Translation','Content'),
  ('Math','Academic'),('Physics','Academic'),('Chemistry','Academic'),
  ('Biology','Academic'),('Economics','Academic'),('Accounting','Business'),
  ('Marketing','Business'),('SEO','Business'),('Data Analysis','Data'),
  ('Excel','Data'),('Machine Learning','Data'),('Presentation','Soft'),
  ('Public Speaking','Soft'),('Arabic','Language'),('English','Language'),
  ('Urdu','Language'),('Research','Academic'),('Thesis Help','Academic'),
  ('Career Advice','Soft'),('Resume Review','Soft'),('Mock Interview','Soft')
  on conflict (name) do nothing;

-- Interests (~20)
insert into public.interests (name) values
  ('Web Dev'),('Mobile'),('AI/ML'),('Data Science'),('Startups'),('Open Source'),
  ('Design Systems'),('Writing'),('Photography'),('Reading'),('Gaming'),
  ('Fitness'),('Cooking'),('Travel'),('Music'),('Film'),('Finance'),
  ('Productivity'),('Teaching'),('Community')
  on conflict (name) do nothing;

-- Badges
insert into public.badges (slug, name, description, icon, criteria) values
  ('first_help','First Helper','Offered help on your first request','🌱','{"type":"helps","count":1}'),
  ('ten_helps','Helper x10','Helped on 10 requests','🔟','{"type":"helps","count":10}'),
  ('fifty_helps','Community Pillar','Helped on 50 requests','🏛️','{"type":"helps","count":50}'),
  ('first_ask','First Step','Posted your first request','🚀','{"type":"requests","count":1}'),
  ('fast_responder','Fast Responder','Replied within 1h on 5 requests','⚡','{"type":"fast","count":5}'),
  ('trusted','Trusted','Trust score ≥ 100','✅','{"type":"trust","min":100}'),
  ('streak_7','Weekly Streak','Active 7 days in a row','🔥','{"type":"streak","days":7}')
  on conflict (slug) do nothing;
```

After writing both migrations, run the Supabase CLI:

```bash
npx supabase db push
npx supabase gen types typescript --local > src/lib/supabase/types.ts
```

If CLI is not available, run the SQL inside Supabase SQL editor in order. Then run the gen types command against the remote project.

---

## 7. AUTH + ROLES (EXTEND BOILERPLATE)

Boilerplate already has: signup, login, logout, profiles table, `role` enum (`admin`, `user`), middleware.

Extend in `src/lib/auth/guards.ts`:

```ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOnboarded() {
  const user = await requireUser();
  const sb = await createClient();
  const { data: p } = await sb.from("profiles").select("onboarded,role").eq("id", user.id).single();
  if (!p?.onboarded && p?.role !== "admin") redirect("/onboarding");
  return { user, profile: p };
}

export async function requireAdmin() {
  const { user, profile } = await requireOnboarded();
  if (profile?.role !== "admin") redirect("/dashboard");
  return user;
}
```

Middleware must redirect:
- `/` authed + onboarded → `/dashboard` (optional, leave public if you want marketing)
- authed + NOT onboarded + NOT `/onboarding` → `/onboarding`
- authed + role `admin` hitting `/admin/*` → allow
- authed + role `user` hitting `/admin/*` → `/dashboard`
- unauthed hitting `(app)/*` or `/admin/*` → `/login?next=…`

Keep `ROLE_ROUTES` map from boilerplate. Admin still only created by SQL:

```sql
update public.profiles set role = 'admin' where id = '<uuid from auth.users>';
```

---

## 8. PAGES — FULL SPEC

Every page must render real data. No lorem ipsum. Empty states explicit and friendly. All mutations through server actions. All forms progressively enhanced (work without JS, enhanced with it). All lists paginated or limited.

### 8.1 Landing — `/` (public)

Sections:
1. **Topbar** — logo "Helplytics", links: Features, Leaderboard, Login, Signup (primary).
2. **Hero** — h1 "Ask for help. Offer what you know." sub "A community where knowledge moves both ways." Two CTAs: "Get started" (→ signup) and "Explore community" (→ login then explore). Background = single subtle gradient from `tokens.color.brand` 6% → surface.
3. **Community stats** — 4 stat cards: total members, open requests, solved this week, help offered. Fetch from Supabase counts (cached with `export const revalidate = 60`). If DB empty, show dummy allowed per brief but prefer real zeros.
4. **How it works** — 3 cards: Post your question · Get matched with helpers · Solve and pay it forward.
5. **Featured helpers** — top 4 by trust_score with avatar + name + badge count.
6. **Footer** — project name, year, GitHub link.

Server-rendered. No client components except the CTA button if animated.

### 8.2 Auth — `/login` + `/signup`

Already scaffolded. Augment:
- Signup form asks for: email, password, full_name. NOT role.
- On submit, insert into `auth.users` → trigger creates `profiles` row with default `role='user'`, `onboarded=false`. Redirect to `/onboarding`.
- Login → check `onboarded` → redirect `/onboarding` or `/dashboard`.
- Show Zod errors inline. Password min 8, email valid.

NO "role selection" on auth form despite brief. Role is system-managed (admin by SQL). `user_mode` (need_help / can_help / both) is captured in onboarding.

### 8.3 Onboarding — `/onboarding`

4-step wizard, single route with step state in URL query `?step=1..4`. Server actions advance.

- **Step 1 — Identity:** `full_name`, `username` (unique check), `location`.
- **Step 2 — Mode:** 3 large cards → `need_help` · `can_help` · `both`. Default `both`.
- **Step 3 — Skills:** multi-select chips from `skills` table. For each selected skill, show two toggles: "I can help with this" / "I want help with this". At least 1 required.
- **Step 4 — Interests:** multi-select chips from `interests`. Min 3. Also short `bio` textarea (optional). On finish: `profiles.onboarded = true` → redirect `/dashboard`.

**AI suggestion (section 11):** between step 2 and step 3, run `ai/suggest.suggestSkills(bio + interests)` — pre-select likely skills based on free text. Between step 3 and step 4, run `ai/suggest.suggestInterests(skills)` — pre-select likely interests.

### 8.4 Dashboard — `/dashboard`

Grid. 3 columns on desktop, 1 on mobile.

Top row — 4 stat cards:
- Your open requests
- Requests you're helping
- Trust score (with delta this week)
- Badges earned

Middle — "Recent activity" feed: last 10 events touching the user (new helper on your request, new message, request solved, badge earned). Pulled from `notifications` table.

Right rail — "AI insights" card:
- Top category in your area
- Trending skill this week
- "Requests matching your skills" count with link to filtered feed

Bottom — "Quick actions": Create request · Explore feed · Open messages · View leaderboard.

### 8.5 Explore / Feed — `/explore`

Full list of requests. Server component; filters in URL query.

**Filters** (pill bar at top):
- Category (dropdown, sourced from distinct `requests.category`)
- Urgency (low/medium/high/critical multi)
- Skills (multi, from `skills`)
- Location (text contains)
- Status (default: open)
- Sort: newest · most urgent · most offers

Each result = `RequestCard`:
- Title, 2-line description preview
- Author avatar + name + trust score
- Urgency pill (color from tokens)
- Category badge
- Tag chips (max 4 visible, "+N" if more)
- Offer count + time since posted
- Hover: subtle border tint

Paginate 20 per page with cursor pagination (`created_at` cursor).

### 8.6 Create Request — `/requests/new`

Form:
- Title (required, 10-120 chars)
- Description (required, 30-4000 chars, markdown-friendly textarea)
- Category (optional — AI will auto-suggest on blur/submit)
- Urgency (radio low/medium/high/critical — AI suggests based on text)
- Tags (multi, with autocomplete + AI suggestions)
- Location (optional)

**AI behavior (section 11):**
- On description blur/debounced-input: POST `/api/ai/categorize` with title+description → returns `{ category, confidence }`. Pre-fill category, show subtle "AI suggested" label, user can override.
- Same call returns urgency score → set urgency radio.
- POST `/api/ai/suggest-tags` → tag chips appear under the tag input.
- A "Rewrite with AI" button on description: POST `/api/ai/summarize` with `mode=rewrite` returns a cleaner rewrite. User can accept/reject.

On submit (server action):
1. Zod validate
2. Recompute AI category/urgency/tags server-side (don't trust client)
3. Insert `requests` row with `ai_*` fields
4. Trigger `notifications.emit` to all users whose `user_skills.can_help = true` matching any of the request tags (cap 50, rate-limited)
5. Log trust event `posted_request` +2
6. Redirect to `/requests/[id]`

### 8.7 Request Detail — `/requests/[id]`

Layout: two columns on desktop.

**Main column:**
- Breadcrumb
- Title, category pill, urgency pill, status pill, tags
- Author row (avatar, name, username, trust, posted time)
- AI summary box (collapsed by default, 2 sentences from `ai_summary`)
- Full description (markdown rendered)
- Action bar (context-dependent):
  - If viewer is NOT author and status=open: "I can help" button → creates `request_helpers` row
  - If viewer IS author: "Mark as solved" + "Edit" + "Delete"
  - If viewer already offered: "Offer sent" + "Message author"
- Comments/offers list below — each offer shows helper avatar, trust, a short note, and "Accept" (author only) / "Message" buttons.

**Side column:**
- "Suggested helpers" — top 3 users whose `user_skills.can_help` matches request tags/category, sorted by trust, excluding already-offered and author.
- "Related requests" — 3 by same category or overlapping tags.
- "AI response suggestions" — 3 short templates the helper can copy. Generated once per request and cached in a `ai_suggestions` JSON field or on demand.

Offering help emits a `new_helper` notification to the author.

### 8.8 Messaging — `/messages` + `/messages/[conversationId]`

Left pane: conversations list sorted by `last_message_at`, with unread count. Right pane: selected thread.

- Conversations are user-to-user, optionally tied to a `request_id`.
- "Message author" button on request detail creates-or-finds conversation (use the unique index).
- Message composer: textarea + send button. Enter submits, Shift+Enter newline.
- Poll every 10s OR use Supabase realtime on `messages` filtered by `conversation_id`.
- Mark messages as read on view.
- Unread total surfaces in `Topbar` icon.

### 8.9 Leaderboard — `/leaderboard`

Top 50 users by trust_score. Tabs:
- All time
- This week (events in last 7 days)
- By category (select)

Each row: rank, avatar, name, username, location, trust, badges (mini icons). Top 3 visually elevated (medal icons, subtle gradient top row).

Link each row to `/profile/[username]`.

### 8.10 AI Center — `/ai`

Aggregate insights across the platform, personal + community.

Cards:
1. **Your activity summary** — "You helped 8 people this month in Programming & Math. Trust +24."
2. **Category trends** — bar chart of request counts by category last 30 days. Use raw SVG, no chart lib.
3. **Urgency heatmap** — 7x24 grid, count of critical/high requests by day-of-week × hour.
4. **Skill gaps** — top 5 skills with most open requests and fewest helpers. Actionable: "Consider adding these to your skills."
5. **AI-suggested requests for you** — 5 open requests whose tags best match your `can_help` skills (cosine on tag sets).
6. **Response quality tip of the day** — rotated from a static list.

All computed server-side. Source queries live in `src/lib/ai/insights.ts`.

### 8.11 Notifications — `/notifications`

List of `notifications` rows, newest first, grouped by day.

Types render differently:
- `new_helper` → "X offered to help on your request: [title]"
- `request_solved` → "Your request [title] was marked solved"
- `new_message` → "X sent you a message"
- `badge_earned` → "You earned the [badge] badge"
- `status_change` → "Request [title] changed to [status]"
- `request_commented` → reserved
- `system` → plain text

Each row has "Mark read" and click-through target. Bulk "Mark all read".

`Topbar` bell shows unread count badge. Client component polls `/api/notifications/unread-count` every 30s OR Supabase realtime on `notifications` filtered by `user_id`.

### 8.12 Profile — `/profile/[username]` (public-ish to authed) and `/profile/me` (edit)

Public view:
- Avatar, name, username, location, join date
- Bio
- Trust score + rank on leaderboard
- Badges (all earned, with tooltip on criteria)
- Skills (can_help / needs_help tabs)
- Stats: requests posted, people helped, response avg
- Recent activity (5 events)

Me view additionally:
- Edit profile form: full_name, username, location, bio, avatar_url
- Manage skills (re-open step 3 of onboarding)
- Manage interests
- Change user_mode
- Delete account (danger zone, confirm modal, cascades)

### 8.13 Admin Panel — `/admin`

Layout: separate top-level section, sidebar with 4 items: Overview, Requests, Users, Analytics. Guarded by `requireAdmin()`.

**Overview** — stat cards: total users, DAU last 7d, open requests, solved requests, flagged items, avg solve time.

**Requests** — table: id, title, author, status, urgency, created, offers. Actions: view, delete, force-solve, re-run AI.

**Users** — table: avatar, name, username, role, trust, onboarded, joined. Actions: view profile, promote to admin (confirm), ban (soft — set `onboarded=false` + row in `banned_users` if we add it; leave as TODO if scoped out), demote.

**Analytics** — same content as AI Center plus:
- Requests by category (30d)
- Helpers leaderboard (copy of main)
- Signups per day (30d)
- Solve rate %
- Avg time to first helper

No write endpoints exposed unless gated through `requireAdmin()` AND `supabase/admin.ts` service-role client.

---

## 9. AI MODULE — `src/lib/ai/*`

Design rule: **rule-based first, Anthropic API optional**. Every AI function must work offline with heuristics. If `ANTHROPIC_API_KEY` is set and `AI_USE_CLAUDE === 'true'`, swap to model-backed version. This makes the demo bulletproof even if the API is down.

### 9.1 `dictionaries.ts`

```ts
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Programming":   ["code","bug","error","compile","javascript","typescript","react","node","python","sql","api","git","docker"],
  "Design":        ["figma","ui","ux","color","typography","wireframe","mockup","logo","illustration"],
  "Academic":      ["math","physics","chemistry","biology","thesis","essay","research","homework","assignment","exam"],
  "Career":        ["resume","cv","interview","job","internship","linkedin","offer","salary"],
  "Business":      ["marketing","seo","startup","pitch","customer","funnel","conversion"],
  "Data":          ["excel","spreadsheet","data","analysis","pandas","numpy","model","ml"],
  "Language":      ["translate","translation","grammar","ielts","toefl","arabic","urdu","english"],
  "Other":         [],
};

export const URGENCY_KEYWORDS = {
  critical: ["asap","urgent","today","deadline today","emergency","immediately","right now","in 1 hour"],
  high:     ["tomorrow","tonight","within 24","by end of day","soon","quick"],
  medium:   ["this week","a few days","when possible"],
  low:      ["whenever","no rush","eventually","long term"],
};

export const RESPONSE_TEMPLATES = [
  "Happy to help. Can you share what you've already tried?",
  "I think I can assist. Is the deadline firm?",
  "I've worked on similar before — shoot me a message with the details.",
  "Let me know the exact error/output you're seeing and I'll take a look.",
  "I can pair on this tonight — does a 30-min call work?",
];
```

### 9.2 `categorize.ts`

```ts
import { CATEGORY_KEYWORDS } from "./dictionaries";
export function categorize(text: string): { category: string; confidence: number } {
  const t = text.toLowerCase();
  const scores = Object.entries(CATEGORY_KEYWORDS).map(([cat, kws]) => {
    const hits = kws.filter(k => t.includes(k)).length;
    return [cat, hits / Math.max(kws.length, 1)] as const;
  });
  scores.sort((a,b) => b[1] - a[1]);
  const [best, score] = scores[0];
  if (score === 0) return { category: "Other", confidence: 0 };
  return { category: best, confidence: Math.min(1, score * 3) };
}
```

### 9.3 `urgency.ts`

```ts
import { URGENCY_KEYWORDS } from "./dictionaries";
export function detectUrgency(text: string): { urgency: "low"|"medium"|"high"|"critical"; score: number } {
  const t = text.toLowerCase();
  for (const level of ["critical","high","medium","low"] as const) {
    if (URGENCY_KEYWORDS[level].some(k => t.includes(k))) {
      const score = level === "critical" ? 0.95 : level === "high" ? 0.75 : level === "medium" ? 0.5 : 0.2;
      return { urgency: level, score };
    }
  }
  return { urgency: "medium", score: 0.5 };
}
```

### 9.4 `tags.ts`

Simple TF pull from description, cross-reference with `skills.name`, return top 5 matches.

```ts
export function suggestTags(text: string, skillNames: string[]): string[] {
  const t = text.toLowerCase();
  return skillNames
    .map(s => ({ s, hit: t.includes(s.toLowerCase()) }))
    .filter(x => x.hit)
    .slice(0, 5)
    .map(x => x.s);
}
```

### 9.5 `summarize.ts`

Two modes:
- `summary`: first sentence + longest information-dense sentence, ≤ 180 chars.
- `rewrite`: clean up markdown, strip filler ("um", "kinda"), split into 2 paragraphs, preserve meaning.

Provide heuristic impl. If Claude API flag on, call it instead.

### 9.6 `suggest.ts`

- `suggestSkills(bio, interestIds)` — score each skill by: name-in-bio + interest->skill lookup table. Return top 5 skill ids.
- `suggestInterests(skillIds)` — inverse lookup.
- `suggestResponse(requestText)` — pick top 3 of `RESPONSE_TEMPLATES` weighted by category match; or Claude-generated if flag on.

### 9.7 `insights.ts`

Pure SQL queries returning shapes the AI Center consumes. Example:

```ts
export async function getCategoryTrends(sb, days = 30) {
  const { data } = await sb.rpc("helplytics_category_trends", { days });
  return data ?? [];
}
```

Add RPC functions in migration if needed, or do the queries inline with `.from("requests").select(...)` + group by in JS for MVP.

### 9.8 `claude.ts` (optional)

```ts
import Anthropic from "@anthropic-ai/sdk";
const enabled = process.env.ANTHROPIC_API_KEY && process.env.AI_USE_CLAUDE === "true";
const client = enabled ? new Anthropic() : null;
export async function withClaude<T>(prompt: string, fallback: () => T): Promise<T | string> {
  if (!client) return fallback();
  const r = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });
  const text = r.content.map((b: any) => (b.type === "text" ? b.text : "")).join("\n");
  return text;
}
```

Haiku 4.5 for speed and cost. Haiku is the right tier for classification + summarization.

### 9.9 API routes

Each route in `src/app/api/ai/*` is a thin wrapper: parse body → call lib → return JSON. Rate-limit per user (10/min) via a simple in-memory map keyed by user id (fine for single-instance Vercel; upgrade later).

---

## 10. BONUS FEATURES — IMPLEMENT ALL 4

### 10.1 Trust score

File: `src/lib/trust/score.ts`.

Events and deltas:
- `signup` +5
- `complete_onboarding` +10
- `posted_request` +2
- `offered_help` +3
- `help_accepted` +5
- `request_solved_as_author` +5
- `request_solved_as_helper` +15
- `received_thanks` +5 (if you add a thanks button)
- `fast_first_response` +5 (responded within 1h)
- `reported_content_upheld` -20

Every action writes a `trust_events` row AND increments `profiles.trust_score` atomically via RPC:

```sql
create or replace function public.trust_emit(p_user uuid, p_type text, p_delta int, p_ref uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.trust_events(user_id, event_type, delta, ref_id) values (p_user, p_type, p_delta, p_ref);
  update public.profiles set trust_score = trust_score + p_delta where id = p_user;
  -- badge check
  perform public.trust_check_badges(p_user);
end $$;

create or replace function public.trust_check_badges(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  t int; b record;
begin
  select trust_score into t from public.profiles where id = p_user;
  for b in select * from public.badges loop
    if (b.criteria->>'type') = 'trust' and t >= (b.criteria->>'min')::int then
      insert into public.user_badges(user_id, badge_id) values (p_user, b.id) on conflict do nothing;
    end if;
  end loop;
end $$;
```

Add this to migration `0002` at the bottom.

### 10.2 Leaderboard

Already specced in 8.9. Query:

```sql
select p.id, p.username, p.full_name, p.avatar_url, p.location, p.trust_score,
       (select count(*) from public.user_badges ub where ub.user_id = p.id) as badge_count
from public.profiles p
where p.onboarded = true and p.role = 'user'
order by p.trust_score desc
limit 50;
```

Weekly variant: sum `trust_events.delta` where `created_at > now() - interval '7 days'` grouped by user.

### 10.3 AI suggestion feature

All of section 9. Multiple AI features exceed the "at least ONE" requirement.

### 10.4 Notifications

Already specced in 8.11. Emitter:

```ts
// src/lib/notifications/emit.ts
import { createAdminClient } from "@/lib/supabase/admin";
export async function notify(userId: string, type: string, payload: any) {
  const sb = createAdminClient();
  await sb.from("notifications").insert({ user_id: userId, type, payload });
}
```

Call from server actions whenever relevant events fire.

---

## 11. AGENT DISPATCH PLAN

Use `superpowers:dispatching-parallel-agents` + `superpowers:subagent-driven-development`. Four waves.

### Wave 1 — Foundation (serial)
**Agent REF**
- Deliverables: `docs/reference-audit.md` per section 0.1. Reads every file in `@requirement/`, extracts colors/spacing/layouts, proposes token overrides.
- Self-test: every image in `@requirement/` has a row in the audit table. Every override has a concrete value. Hand off audit doc to DB + subsequent agents.

**Agent DB**
- Deliverables: `supabase/migrations/0002_helplytics_schema.sql`, `0003_helplytics_seed.sql`, run `db push`, run `gen types` to `src/lib/supabase/types.ts`.
- Self-test: `npm run build` passes. Query each table via the Studio. RLS smoke test (try selecting messages as a non-participant → 0 rows).

REF + DB run in parallel. Both must complete before Wave 2.

### Wave 2 — Parallel (3 agents)
**Agent AUTH**
- Extend middleware + guards + role routes. Adjust signup to capture `full_name`. Add onboarding gate.
- Deliverables: `src/lib/auth/guards.ts`, updated `middleware.ts`, updated `(auth)/actions.ts`.
- Self-test: playwright passing auth.spec + onboarding gate test.

**Agent DESIGN**
- Build `tokens.ts`, UI primitives, `Sidebar`, `Topbar`, `(app)/layout.tsx`, `admin/layout.tsx`.
- Deliverables: all files under `src/components/ui/*`, `src/components/layout/*`, two app-shell layouts.
- Self-test: Storybook-style dev page `/__ui` (gated to `NODE_ENV !== 'production'`) lists every primitive rendered in each variant.

**Agent AI**
- Build `src/lib/ai/*` and `src/app/api/ai/*` routes. No UI yet.
- Deliverables: all files in section 9 + API routes + unit tests under `tests/unit/ai/*`.
- Self-test: vitest passes. `curl localhost:3000/api/ai/categorize` returns JSON for a sample payload.

### Wave 3 — Parallel (4 agents)
**Agent PUB**
- Landing + (auth) pages polish.
- Deliverables: `src/app/page.tsx` (full landing), styled auth pages.

**Agent CORE**
- Onboarding, Dashboard, Explore/Feed, Create Request, Request Detail, Profile.
- Deliverables: all files under those routes. Use AI module from Wave 2.

**Agent SOCIAL**
- Messaging, Notifications, Leaderboard, AI Center.
- Deliverables: those routes + realtime wiring.

**Agent ADMIN**
- Admin panel (overview, requests, users, analytics).
- Deliverables: everything under `src/app/admin/*`.

### Wave 4 — QA (serial)
**Agent QA**
- Playwright e2e across all flows. Security review. Fix-forward loop until green.

Dispatch each wave as a single batch. After every wave, main thread runs `superpowers:verification-before-completion`. If any self-test fails, spawn a targeted fix agent. Do NOT advance waves with red tests.

---

## 12. QA MATRIX — Playwright

Minimum 24 cases. File-per-area.

**auth.spec.ts**
1. Signup with new email → redirected to `/onboarding`.
2. Login with existing non-onboarded user → `/onboarding`.
3. Login with onboarded user → `/dashboard`.
4. Logout → `/login`.
5. Unauth user hits `/dashboard` → `/login?next=/dashboard`.
6. Weak password rejected with Zod error.

**onboarding.spec.ts**
7. Cannot skip step 3 (skills required).
8. Finishing onboarding sets `profiles.onboarded = true` and redirects `/dashboard`.
9. AI skill suggestion returns ≥1 skill for bio "I'm a React developer who loves design systems".

**requests.spec.ts**
10. Create request with title + description → detail page shows AI category + urgency pill.
11. Author sees "Mark solved"; non-author does not.
12. Non-author clicks "I can help" → row in `request_helpers`, author receives notification.
13. Marking solved sets `solved_at` and changes urgency pill to `solved` badge.
14. Rewrite with AI button returns non-empty text different from original.

**feed.spec.ts**
15. Filter by urgency=critical returns only critical requests.
16. Filter by category narrows results.
17. Pagination cursor works for >20 seeded requests.

**messaging.spec.ts**
18. "Message author" from a request detail creates one conversation (not duplicated).
19. Sending message updates `last_message_at` and appears in the other user's thread list.

**leaderboard.spec.ts**
20. User who gets +15 via `request_solved_as_helper` appears higher than baseline.

**admin.spec.ts**
21. Non-admin cannot visit `/admin` (→ `/dashboard`).
22. Admin can soft-delete a request; request disappears from feed.

**ai.spec.ts**
23. `/api/ai/categorize` returns `category=Programming` for "React error Cannot read properties of undefined".
24. `/api/ai/urgency` returns `critical` for text containing "ASAP, deadline in 2 hours".

Run: `npx playwright test`. CI: add GitHub Action later (not MVP).

---

## 13. DEPLOYMENT

1. Push to GitHub (private if you still have concerns about the previous `.env` leak — run `git log -p | grep -i SUPABASE_SERVICE_ROLE` first to confirm clean history).
2. Import repo into Vercel.
3. Env vars (Production + Preview + Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY` (optional)
   - `AI_USE_CLAUDE` = `false` by default, flip to `true` in demo if you want the live model behavior.
4. Run migrations against the Supabase project (SQL editor or CLI linked project).
5. Vercel deploy. Verify:
   - Landing loads
   - Signup end-to-end works (check Supabase Auth dashboard for new user and `profiles` row)
   - Onboarding completes
   - Create request with AI categorization works
   - Admin panel gated

---

## 14. ACCEPTANCE CHECKLIST (RUN BEFORE DEMO)

- [ ] `docs/reference-audit.md` exists and every `@requirement/` image is referenced
- [ ] UI visually matches the reference images (side-by-side compare before demo)
- [ ] `npm run build` green
- [ ] `npm run lint` green
- [ ] `npx tsc --noEmit` green
- [ ] `npx playwright test` ≥ 24 passing
- [ ] All 13 pages render with real data, no placeholder text
- [ ] Landing stats reflect live DB numbers
- [ ] Onboarding gates unonboarded users into `/onboarding` via middleware
- [ ] Admin gate works (user → redirect, admin → access)
- [ ] AI categorization sets `requests.ai_category` on insert
- [ ] AI urgency sets `requests.ai_urgency_score` on insert
- [ ] "I can help" creates `request_helpers` row AND notification
- [ ] Mark solved sets `solved_at`, flips status, awards helper trust
- [ ] Leaderboard reflects latest trust_score
- [ ] Badges awarded when criteria met (test with the `trusted` badge at 100 trust)
- [ ] Notification bell in Topbar shows unread count
- [ ] Messaging thread creates exactly one row via unique index
- [ ] Admin panel has working overview + requests + users + analytics
- [ ] No `any` in TypeScript
- [ ] No `.env.local` in git history
- [ ] `security-review` skill completed clean
- [ ] README updated with run + deploy instructions
- [ ] 60-second demo video recorded covering: signup → onboarding → create request → AI categorization → helper offers → message → solve → leaderboard bump → admin view

---

## 15. DEMO SCRIPT (60 SECONDS)

1. (0-5s) Landing with stats live.
2. (5-15s) Signup → onboarding wizard; pause on AI-suggested skills.
3. (15-25s) Dashboard → Create request "Need help with React useEffect memory leak, tonight." → watch AI fill category=Programming, urgency=high, tags auto-suggest.
4. (25-35s) Switch to second tab logged in as helper → feed shows new request at top → "I can help" → notification fires.
5. (35-45s) Back to author → message the helper → solve request → trust jumps on leaderboard.
6. (45-55s) AI Center → show trends chart + skill gaps.
7. (55-60s) Admin panel overview.

---

## 16. RULES OF EXECUTION

- Start now. Wave 1 first. Do not ask for confirmation between files inside a wave.
- Commit after every agent completes. Caveman commit messages.
- If blocked, say what's blocking in one line, attempt the most likely fix, retry once, then surface.
- If the brief conflicts with these instructions (e.g. "add role selection to signup"), these instructions win — admin is SQL-only, always.
- Do not install new libraries beyond: `@anthropic-ai/sdk` (optional), `zod` (if not present), `react-markdown` (for description render), `date-fns`. Anything else must be justified in one line.
- When in doubt, prefer fewer features done cleanly over more features half-done.

GO.