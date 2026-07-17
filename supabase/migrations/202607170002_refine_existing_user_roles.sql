do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('member', 'merchant', 'admin', 'staff');
  end if;
end $$;

alter table public.user_roles
rename column user_id to clerk_user_id;

alter table public.user_roles
alter column role type public.app_role using role::public.app_role;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop index if exists public.user_roles_user_id_idx;
drop index if exists public.user_roles_active_user_id_idx;
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
select distinct registrations.user_id, 'member'::public.app_role
from public.racing_team_registrations registrations
where registrations.user_id is not null
on conflict (clerk_user_id, role) do nothing;
