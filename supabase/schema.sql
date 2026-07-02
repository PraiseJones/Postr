-- Postr schema — run this in the Supabase SQL editor.

-- ── Connected social accounts ─────────────────────────────────────────────
create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('x', 'facebook', 'instagram', 'linkedin')),
  account_name text not null,
  -- Platform-side identifier: X user id, Facebook Page id, IG business
  -- account id, LinkedIn person URN.
  account_id text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, platform)
);

-- ── Posts ──────────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  media_url text,
  created_at timestamptz not null default now()
);

-- ── Per-platform publish results ───────────────────────────────────────────
create table if not exists public.post_results (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('x', 'facebook', 'instagram', 'linkedin')),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  platform_post_id text,
  error_message text,
  posted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists post_results_post_id_idx on public.post_results (post_id);
create index if not exists posts_user_id_created_idx on public.posts (user_id, created_at desc);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.connected_accounts enable row level security;
alter table public.posts enable row level security;
alter table public.post_results enable row level security;

-- OAuth tokens are written/read only by the server (service role bypasses
-- RLS). Users may see and remove their own connections, but the token
-- columns are never sent to the browser by the app.
create policy "read own connections" on public.connected_accounts
  for select using (auth.uid() = user_id);
create policy "delete own connections" on public.connected_accounts
  for delete using (auth.uid() = user_id);

create policy "read own posts" on public.posts
  for select using (auth.uid() = user_id);
create policy "insert own posts" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "read own results" on public.post_results
  for select using (auth.uid() = user_id);

-- ── Storage bucket for post media ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

create policy "users upload own media" on storage.objects
  for insert with check (
    bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "public read media" on storage.objects
  for select using (bucket_id = 'post-media');
