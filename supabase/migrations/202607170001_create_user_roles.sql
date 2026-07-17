do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('member', 'merchant', 'admin', 'staff');
  end if;
end $$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  role public.app_role not null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clerk_user_id, role)
);

create index if not exists user_roles_clerk_user_id_idx on public.user_roles (clerk_user_id);
create index if not exists user_roles_active_clerk_user_id_idx on public.user_roles (clerk_user_id) where is_active = true;

alter table public.user_roles enable row level security;

drop policy if exists "Users can read their own active roles" on public.user_roles;
create policy "Users can read their own active roles"
on public.user_roles
for select
to authenticated
using (
  is_active = true
  and clerk_user_id = (auth.jwt() ->> 'sub')
);

drop trigger if exists set_user_roles_updated_at on public.user_roles;
create trigger set_user_roles_updated_at
before update on public.user_roles
for each row
execute function public.update_updated_at_column();

insert into public.user_roles (clerk_user_id, role)
select distinct user_id, 'member'::public.app_role
from public.racing_team_registrations
where user_id is not null
on conflict (clerk_user_id, role) do nothing;
