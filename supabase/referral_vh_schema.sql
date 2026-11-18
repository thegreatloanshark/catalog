-- Run in the Supabase SQL editor. Requires a trusted backend service-role key.
-- Stored in an exposed schema only for privileged API access; no public/authenticated grants or RLS policies.
create table if not exists public.referral_vertical_heads (
  id uuid primary key default gen_random_uuid(),
  dsa_code text not null unique,
  name text not null,
  phone text not null unique check (phone ~ '^[6-9][0-9]{9}$'),
  email text not null unique,
  designation text not null default 'Vertical Head',
  auth_user_id uuid unique references auth.users(id) on delete set null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.referral_vertical_heads enable row level security;
revoke all on public.referral_vertical_heads from anon, authenticated;
-- Do not create policies allowing public SELECT. All reads pass through server-side verified APIs.
