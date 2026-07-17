create table if not exists public.push_devices (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  platform text not null,
  one_signal_player_id text not null unique,
  app_version text,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_devices enable row level security;

drop policy if exists "Users can manage their own push devices" on public.push_devices;
create policy "Users can manage their own push devices"
  on public.push_devices
  for all
  using (member_id = auth.jwt() ->> 'sub')
  with check (member_id = auth.jwt() ->> 'sub');

create index if not exists push_devices_member_id_idx
  on public.push_devices (member_id);

create index if not exists push_devices_last_seen_idx
  on public.push_devices (last_seen desc);

drop trigger if exists update_push_devices_updated_at on public.push_devices;
create trigger update_push_devices_updated_at
  before update on public.push_devices
  for each row
  execute function public.update_updated_at_column();
