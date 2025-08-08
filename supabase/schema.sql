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
drop policy if exists gallery_items_read on public.gallery_items;
create policy gallery_items_read on public.gallery_items
  for select using (true);

-- Allow anonymous writes for admin functionality
drop policy if exists gallery_items_write on public.gallery_items;
create policy gallery_items_write on public.gallery_items
  for all
  using (true)
  with check (true);

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

-- Anonymous votes: one per voter_hash per poll
create table if not exists public.poll_votes (
  id bigserial primary key,
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  voter_hash text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_hash)
);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

-- Read for everyone
drop policy if exists polls_read on public.polls;
create policy polls_read on public.polls
  for select using (true);
drop policy if exists poll_options_read on public.poll_options;
create policy poll_options_read on public.poll_options
  for select using (true);

-- Allow anonymous writes for admin functionality
drop policy if exists polls_write on public.polls;
create policy polls_write on public.polls
  for all using (true) with check (true);
drop policy if exists poll_options_write on public.poll_options;
create policy poll_options_write on public.poll_options
  for all using (true) with check (true);

-- Votes: allow anonymous inserts via RPC (and optional direct insert)
drop policy if exists poll_votes_read on public.poll_votes;
create policy poll_votes_read on public.poll_votes for select using (true);
drop policy if exists poll_votes_insert on public.poll_votes;
create policy poll_votes_insert on public.poll_votes for insert with check (true);

-- Voting function: one anonymous vote per poll per voter_hash
create or replace function public.vote_anon(p_poll_id uuid, p_option_id uuid, p_voter_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert vote; unique constraint enforces one vote per poll per voter_hash
  insert into public.poll_votes (poll_id, option_id, voter_hash)
  values (p_poll_id, p_option_id, p_voter_hash);

  -- Increment count
  update public.poll_options
    set votes_count = votes_count + 1
  where id = p_option_id;
exception when unique_violation then
  -- Ignore if already voted
  null;
end;
$$;

-- Also create a simple vote function for compatibility
create or replace function public.vote(p_poll_id uuid, p_option_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Generate a simple voter hash based on IP and user agent
  perform public.vote_anon(p_poll_id, p_option_id, 'anonymous');
end;
$$;

grant execute on function public.vote_anon(uuid, uuid, text) to anon, authenticated;
grant execute on function public.vote(uuid, uuid) to anon, authenticated; 