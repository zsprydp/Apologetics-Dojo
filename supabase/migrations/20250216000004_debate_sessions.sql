-- Debate sessions: records of user debate practice sessions
create table public.debate_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  opponent_persona_id text,
  family_id uuid references public.families (id) on delete set null,
  difficulty text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  outcome text,
  transcript_summary text,
  created_at timestamptz not null default now()
);

alter table public.debate_sessions enable row level security;

create policy "Users can view own debate sessions"
  on public.debate_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own debate sessions"
  on public.debate_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own debate sessions"
  on public.debate_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_debate_sessions_user_id on public.debate_sessions (user_id);
create index idx_debate_sessions_started_at on public.debate_sessions (started_at desc);

comment on table public.debate_sessions is 'User debate practice sessions with opponent persona and topic family.';
