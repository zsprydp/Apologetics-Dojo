-- Families: topic/argument families for organizing debate content and skills
create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.families enable row level security;

create policy "Families are readable by everyone"
  on public.families for select
  using (true);

comment on table public.families is 'Topic or argument families for debate sessions and skill tracking.';
