-- Epic Card Quest — Mystery Vault Waitlist Table Migration
-- Run this in your Supabase Dashboard -> SQL Editor

create table if not exists public.vault_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  priority_code text not null unique,
  full_name text not null,
  email text not null unique,
  phone text,
  hobby_focus text not null check (hobby_focus in ('Sports Cards', 'Pokémon (CN / KR)', 'Pokémon (Japanese +$10)', 'Both')),
  preferred_tier text not null check (preferred_tier in ('Starter Rip', 'Pro', 'Quest Master')),
  monthly_rate_usd integer not null check (monthly_rate_usd in (25, 35, 45, 50, 60)),
  fulfillment_preference text not null check (fulfillment_preference in ('Valley Mall Pickup', 'Hagerstown Outlets', 'Ship to Door')),
  source text not null default 'vault.epiccard.quest'
);

-- Indexes for fast lookup and drop reporting
create index if not exists idx_vault_waitlist_created_at on public.vault_waitlist (created_at desc);
create index if not exists idx_vault_waitlist_tier on public.vault_waitlist (preferred_tier);
create index if not exists idx_vault_waitlist_fulfillment on public.vault_waitlist (fulfillment_preference);

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
