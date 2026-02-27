-- Add billing fields to profiles for Stripe integration
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_plan text not null default 'free';
