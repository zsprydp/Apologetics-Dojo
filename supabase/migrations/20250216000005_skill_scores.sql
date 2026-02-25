-- Skill scores: per-user, per-family (or per-skill) scores and belt
create table public.skill_scores (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  score int not null default 0,
  belt_id uuid references public.belt_config (id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (profile_id, family_id)
);

alter table public.skill_scores enable row level security;

create policy "Users can view own skill scores"
  on public.skill_scores for select
  using (auth.uid() = profile_id);

create policy "Users can insert own skill scores"
  on public.skill_scores for insert
  with check (auth.uid() = profile_id);

create policy "Users can update own skill scores"
  on public.skill_scores for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create index idx_skill_scores_profile_id on public.skill_scores (profile_id);
create index idx_skill_scores_family_id on public.skill_scores (family_id);

comment on table public.skill_scores is 'Per-user, per-family skill score and current belt for that family.';
