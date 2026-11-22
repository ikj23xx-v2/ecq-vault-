-- Epic Card Quest — Vault Waitlist Table Migration
-- Run this in your Supabase Dashboard -> SQL Editor

create table if not exists public.vault_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  founder_pass_id text not null unique,
  full_name text not null,
  email text not null unique,
  phone text,
  tier text not null check (tier in ('SCOUT', 'COLLECTOR', 'VAULT')),
  category text not null check (category in ('SPORTS', 'POKEMON_CN_KR', 'POKEMON_JP')),
  japanese_pokemon_addon boolean not null default false,
  monthly_price integer not null check (monthly_price in (25, 35, 45, 50, 60)),
  preferred_location text not null check (preferred_location in ('VALLEY_MALL', 'HAGERSTOWN_OUTLETS', 'SHIPPING')),
  utm_source text,
  referrer text,
  user_agent text
);

-- Indexes for fast lookup and admin reporting
create index if not exists idx_vault_waitlist_created_at on public.vault_waitlist (created_at desc);
create index if not exists idx_vault_waitlist_tier on public.vault_waitlist (tier);
create index if not exists idx_vault_waitlist_location on public.vault_waitlist (preferred_location);

-- Enable Row Level Security (RLS)
alter table public.vault_waitlist enable row level security;

-- Allow public visitors (anon key) to INSERT waitlist signups only.
-- Reading, updating, or deleting rows stays restricted to service_role / authenticated admins.
drop policy if exists "Allow anonymous waitlist inserts" on public.vault_waitlist;
create policy "Allow anonymous waitlist inserts"
  on public.vault_waitlist
  for insert
  to anon
  with check (true);
