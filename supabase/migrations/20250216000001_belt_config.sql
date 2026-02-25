-- Belt configuration: martial-arts-style ranks with score thresholds
create table public.belt_config (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level int not null unique,
  min_score_threshold int not null,
  color_hex text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.belt_config enable row level security;

create policy "Belts are readable by everyone"
  on public.belt_config for select
  using (true);

-- Seed default belt thresholds (run once; idempotent via unique level)
insert into public.belt_config (name, level, min_score_threshold, color_hex, sort_order)
values
  ('White', 1, 0, '#f5f5f5', 1),
  ('Yellow', 2, 100, '#facc15', 2),
  ('Orange', 3, 250, '#fb923c', 3),
  ('Green', 4, 450, '#22c55e', 4),
  ('Blue', 5, 700, '#3b82f6', 5),
  ('Purple', 6, 1000, '#a855f7', 6),
  ('Brown', 7, 1400, '#92400e', 7),
  ('Black', 8, 2000, '#171717', 8)
on conflict (level) do nothing;

comment on table public.belt_config is 'Belt levels and minimum score thresholds for progression.';
