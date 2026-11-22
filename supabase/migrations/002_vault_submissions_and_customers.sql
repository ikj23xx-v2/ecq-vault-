-- Epic Card Quest — Vault Submissions & CRM Customers Migration (Supabase)
-- Supports Single-Step and 2-Step "Both" (Sports + Pokémon) Square Checkout

create table if not exists public.vault_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  email text not null,
  phone text,
  category text not null,
  tier_id text,
  tier text not null,
  japanese_addon boolean not null default false,
  expected_total numeric(8,2) not null,
  preferences text,
  payment_status text not null default 'pending',
  paid_at timestamptz,
  fulfilled boolean not null default false
);

create table if not exists public.customers (
  email text primary key,
  customer_name text,
  phone text,
  newsletter_subscribed boolean not null default true,
  favorite_category text,
  last_order_tier text,
  total_orders integer not null default 0,
  total_spent numeric(10,2) not null default 0,
  last_order_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.vault_submissions enable row level security;
alter table public.customers enable row level security;

drop policy if exists "Allow public vault submission inserts" on public.vault_submissions;
create policy "Allow public vault submission inserts"
  on public.vault_submissions for insert
  to anon, authenticated
  with check (payment_status in ('pending', 'pending_step_1'));

drop policy if exists "Allow public payment status update" on public.vault_submissions;
create policy "Allow public payment status update"
  on public.vault_submissions for update
  using (true)
  with check (payment_status in ('sports_paid_pending_pokemon', 'paid'));

drop policy if exists "Allow authenticated staff read vault_submissions" on public.vault_submissions;
create policy "Allow authenticated staff read vault_submissions"
  on public.vault_submissions for select
  to authenticated
  using (true);

drop policy if exists "Allow public post-checkout customer upsert" on public.customers;
create policy "Allow public post-checkout customer upsert"
  on public.customers for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public customer preference update" on public.customers;
create policy "Allow public customer preference update"
  on public.customers for update
  using (true)
  with check (true);

drop policy if exists "Allow authenticated staff read customers" on public.customers;
create policy "Allow authenticated staff read customers"
  on public.customers for select
  to authenticated
  using (true);
