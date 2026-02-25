-- Learning tracks: structured learning paths (e.g. by topic or difficulty)
create table public.learning_tracks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learning_tracks enable row level security;

create policy "Learning tracks are readable by everyone"
  on public.learning_tracks for select
  using (true);

comment on table public.learning_tracks is 'Learning paths for structured progression in the dojo.';
