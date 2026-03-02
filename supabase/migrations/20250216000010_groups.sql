-- Groups: church/study group containers
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Group members: links users to groups with roles
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('leader', 'member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create index idx_group_members_group_id on public.group_members (group_id);
create index idx_group_members_user_id on public.group_members (user_id);

-- RLS for groups (must come after group_members table exists)
alter table public.groups enable row level security;

create policy "Group members can view their groups"
  on public.groups for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id and gm.user_id = auth.uid()
    )
    or created_by = auth.uid()
  );

create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "Group owners can update their groups"
  on public.groups for update
  using (auth.uid() = created_by);

-- RLS for group members
alter table public.group_members enable row level security;

create policy "Members can view members of their groups"
  on public.group_members for select
  using (
    exists (
      select 1 from public.group_members my
      where my.group_id = group_members.group_id and my.user_id = auth.uid()
    )
  );

create policy "Users can insert themselves as members"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Leaders can manage members"
  on public.group_members for delete
  using (
    exists (
      select 1 from public.group_members my
      where my.group_id = group_members.group_id
        and my.user_id = auth.uid()
        and my.role = 'leader'
    )
  );
