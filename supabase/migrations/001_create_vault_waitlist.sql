-- 1. Create the vault_waitlist table matching the index.html form fields
create table if not exists public.vault_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  hobby_focus text not null,          -- e.g., 'Sports Cards', 'Pokémon (CN / KR)', 'Pokémon (Japanese +$10)', 'Both'
  preferred_tier text not null,       -- e.g., 'Starter Rip', 'Pro', 'Quest Master'
  monthly_rate numeric(6,2) not null, -- e.g., 25.00, 35.00, 45.00, 50.00, 60.00
  fulfillment_method text not null,   -- e.g., 'Valley Mall Pickup', 'Hagerstown Outlets', 'Ship to Door'
  vip_code text not null unique,      -- e.g., 'ECQ-VIP-8492'
  source_subdomain text default 'vault.epiccard.quest',
  status text not null default 'waitlist' -- 'waitlist' | 'invited' | 'subscribed'
);

-- 2. Add useful indexes for filtering pickups and preventing duplicate signups by email
create unique index if not exists vault_waitlist_email_unique_idx
  on public.vault_waitlist (lower(email));

create index if not exists vault_waitlist_fulfillment_idx
  on public.vault_waitlist (fulfillment_method, preferred_tier);

-- 3. Enable Row-Level Security (RLS)
alter table public.vault_waitlist enable row level security;

-- 4. Allow public visitors (anon role) to INSERT new waitlist entries only
drop policy if exists "Allow public waitlist inserts" on public.vault_waitlist;
create policy "Allow public waitlist inserts"
  on public.vault_waitlist
  for insert
  to anon, authenticated
  with check (
    length(trim(full_name)) > 0
    and length(trim(email)) > 3
    and monthly_rate >= 25
  );

-- 5. Allow authenticated staff/admins to view and manage all waitlist rows
drop policy if exists "Allow authenticated staff read access" on public.vault_waitlist;
create policy "Allow authenticated staff read access"
  on public.vault_waitlist
  for select
  to authenticated
  using (true);

drop policy if exists "Allow authenticated staff update access" on public.vault_waitlist;
create policy "Allow authenticated staff update access"
  on public.vault_waitlist
  for update
  to authenticated
  using (true)
  with check (true);
