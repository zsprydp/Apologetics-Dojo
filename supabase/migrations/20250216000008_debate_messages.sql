-- debate_messages: stores the conversation transcript for each debate session.
create table if not exists public.debate_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.debate_sessions(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_debate_messages_session_id
  on public.debate_messages (session_id, created_at asc);

alter table public.debate_messages enable row level security;

create policy "Users can view messages for their own sessions"
  on public.debate_messages for select
  using (
    exists (
      select 1 from public.debate_sessions ds
      where ds.id = debate_messages.session_id
        and ds.user_id = auth.uid()
    )
  );

create policy "Users can insert messages for their own sessions"
  on public.debate_messages for insert
  with check (
    exists (
      select 1 from public.debate_sessions ds
      where ds.id = debate_messages.session_id
        and ds.user_id = auth.uid()
    )
  );
