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

-- =========================================================
-- TRUST SYSTEM
-- =========================================================

create or replace function public.trust_emit(p_user uuid, p_type text, p_delta int, p_ref uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.trust_events(user_id, event_type, delta, ref_id) values (p_user, p_type, p_delta, p_ref);
  update public.profiles set trust_score = trust_score + p_delta where id = p_user;
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
