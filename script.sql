create extension if not exists "pgcrypto"; 

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,

  role text default 'NORMAL',

  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Añadimos columna para guardar el token Expo push del dispositivo
alter table if exists public.profiles add column if not exists expo_push_token text;

create or replace function public.is_supervisor(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'SUPERVISOR'
  );
$$;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (
  auth.uid() = id
);


drop policy if exists "profiles_select_supervisor" on public.profiles;
create policy "profiles_select_supervisor"
on public.profiles
for select
using (
  public.is_supervisor(auth.uid())
);


drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
with check (
  auth.uid() = id
);


drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);


drop policy if exists profiles_update_supervisor on public.profiles;
create policy profiles_update_supervisor
on public.profiles
for update
using (public.is_supervisor(auth.uid()))
with check (public.is_supervisor(auth.uid()));

drop policy if exists profiles_delete_supervisor on public.profiles;
create policy profiles_delete_supervisor
on public.profiles
for delete
using (
  public.is_supervisor(auth.uid())
);

create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  discogs_id bigint not null,
  user_id uuid not null references auth.users(id) on delete cascade,

  operator_id uuid references auth.users(id) on delete set null,

  rented_at timestamptz not null default now(), 
  due_at timestamptz,                           
  returned_at timestamptz,                     
  created_at timestamptz not null default now()
);

alter table public.rentals enable row level security;

drop policy if exists rentals_select_owner on public.rentals;
create policy rentals_select_owner
on public.rentals
for select
using (
  auth.uid() = user_id
  OR public.is_supervisor(auth.uid())
);


drop policy if exists rentals_insert_owner on public.rentals;
create policy rentals_insert_owner
on public.rentals
for insert
with check (
  auth.uid() = user_id
  OR public.is_supervisor(auth.uid())
);


drop policy if exists rentals_update_owner on public.rentals;
create policy rentals_update_owner
on public.rentals
for update
using (
  auth.uid() = user_id
  OR public.is_supervisor(auth.uid())
)
with check (
  auth.uid() = user_id
  OR public.is_supervisor(auth.uid())
);

drop policy if exists rentals_delete_supervisor on public.rentals;
create policy rentals_delete_supervisor
on public.rentals
for delete
using (
  public.is_supervisor(auth.uid())
);


create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin

  insert into public.profiles (id, full_name, email, created_at)
  values (
    new.id,                 
    coalesce(new.raw_user_meta_data->>'full_name', new.email), 
    new.email,
    now()
  )

  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create or replace function public.get_expo_push_tokens()
returns table(expo_push_token text)
language sql
security definer
as $$
  select expo_push_token
  from public.profiles
  where expo_push_token is not null
    and auth.uid() is not null;
$$;