-- Enable extensions
create extension if not exists pgcrypto;

-- GALLERY
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('image','video')),
  storage_url text not null,
  alt text,
  created_at timestamptz not null default now(),
  created_by uuid
);

alter table public.gallery_items enable row level security;

-- Anyone can read
create policy if not exists gallery_items_read on public.gallery_items
  for select using (true);

-- Only authenticated users can write
create policy if not exists gallery_items_write on public.gallery_items
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- POLLS
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  text text not null,
  votes_count int not null default 0
);

create table if not exists public.poll_votes (
  id bigserial primary key,
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

-- Read for everyone
create policy if not exists polls_read on public.polls
  for select using (true);
create policy if not exists poll_options_read on public.poll_options
  for select using (true);

-- Write by authenticated users
create policy if not exists polls_write on public.polls
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists poll_options_write on public.poll_options
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Votes are inserted via RPC. Prevent direct writes (optional: allow insert by authenticated only)
create policy if not exists poll_votes_read on public.poll_votes for select using (auth.role() = 'authenticated');
create policy if not exists poll_votes_insert on public.poll_votes for insert with check (auth.role() = 'authenticated');

-- Voting function: one vote per authenticated user per poll
create or replace function public.vote(p_poll_id uuid, p_option_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert vote; unique constraint enforces one vote per poll per user
  insert into public.poll_votes (poll_id, option_id, user_id)
  values (p_poll_id, p_option_id, auth.uid());

  -- Increment count
  update public.poll_options
    set votes_count = votes_count + 1
  where id = p_option_id;
exception when unique_violation then
  -- Ignore if user already voted
  null;
end;
$$;

grant execute on function public.vote(uuid, uuid) to anon, authenticated; 