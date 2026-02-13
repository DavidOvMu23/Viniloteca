-- Habilita pgcrypto (gen_random_uuid)
create extension if not exists "pgcrypto";

-- Tabla profiles (una fila por cada auth.user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text default 'NORMAL',
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists avatar_url text;

-- RLS policies: asegurar creación/actualización de policies solicitadas
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_select_supervisor" on public.profiles;
create policy "profiles_select_supervisor"
on public.profiles
for select
using (
  auth.uid() = id
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPERVISOR'
);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Tabla rentals (simplificada)
create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  discogs_id bigint not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  operator_id uuid,                -- opcional: el backend puede llenarlo
  rented_at timestamptz not null default now(),
  due_at timestamptz,
  returned_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();