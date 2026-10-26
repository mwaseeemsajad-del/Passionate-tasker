-- Passionate Taskers: accounts, provider onboarding and booking requests.
-- Run once in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
--
-- Security model
-- - Row Level Security on every table. People only ever read their own rows.
-- - Nobody can change their own role or approve their own checks: column
--   grants and policies stop it. Approvals are done by the team in the
--   Supabase dashboard (concierge MVP) until there is an admin screen.
-- - Booking requests are written and changed only through the functions at
--   the bottom, which check who is calling.

-- ---------------------------------------------------------------- profiles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'provider')),
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text not null default '' check (char_length(phone) <= 30),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "Update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Only the name and phone can be changed by the person; never the role.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- ------------------------------------------------------- provider profiles

create table public.provider_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  trades text[] not null default '{}'
    check (trades <@ array['plumbing', 'electrical', 'gas', 'heating', 'painting', 'carpentry', 'handyman']),
  postcode text not null default '' check (char_length(postcode) <= 10),
  gas_safe text not null default '' check (char_length(gas_safe) <= 20),
  electrical_scheme text not null default '' check (char_length(electrical_scheme) <= 80),
  about text not null default '' check (char_length(about) <= 2000),
  -- 0 = not started; the app moves it on as each onboarding step is saved.
  onboarding_step smallint not null default 0 check (onboarding_step between 0 and 3),
  onboarded_at timestamptz,
  -- Set by the team only.
  status text not null default 'pending_checks' check (status in ('pending_checks', 'approved', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.provider_profiles enable row level security;

create policy "Read own provider profile" on public.provider_profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "Update own provider profile" on public.provider_profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

revoke insert, update, delete on public.provider_profiles from anon, authenticated;
grant select on public.provider_profiles to authenticated;
grant update (trades, postcode, gas_safe, electrical_scheme, about, onboarding_step, onboarded_at, updated_at)
  on public.provider_profiles to authenticated;

-- --------------------------------------------------------- provider checks

create table public.provider_checks (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('identity', 'dbs', 'insurance', 'gas-safe', 'electrical')),
  status text not null default 'not_started' check (status in ('not_started', 'submitted', 'approved', 'rejected')),
  note text not null default '',
  expires_on date,
  updated_at timestamptz not null default now(),
  unique (provider_id, kind)
);

alter table public.provider_checks enable row level security;

create policy "Read own checks" on public.provider_checks
  for select to authenticated using (provider_id = (select auth.uid()));

-- A provider may add a check for one of their trades, or mark one as sent to
-- us. Only the team can approve or reject.
create policy "Add own checks" on public.provider_checks
  for insert to authenticated
  with check (provider_id = (select auth.uid()) and status in ('not_started', 'submitted'));

create policy "Mark own checks submitted" on public.provider_checks
  for update to authenticated
  using (provider_id = (select auth.uid()) and status in ('not_started', 'submitted', 'rejected'))
  with check (provider_id = (select auth.uid()) and status in ('not_started', 'submitted'));

revoke insert, update, delete on public.provider_checks from anon, authenticated;
grant select on public.provider_checks to authenticated;
grant insert (provider_id, kind, status) on public.provider_checks to authenticated;
grant update (status, updated_at) on public.provider_checks to authenticated;

-- -------------------------------------------------------- booking requests

create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  -- Null when booked without an account.
  customer_id uuid references public.profiles (id) on delete set null,
  -- Set by the team when they offer the job to a tradesperson.
  provider_id uuid references public.profiles (id) on delete set null,
  trade text not null check (trade in ('plumbing', 'electrical', 'gas', 'heating', 'painting', 'carpentry', 'handyman')),
  job text not null check (char_length(job) between 1 and 60),
  postcode text not null check (char_length(postcode) between 2 and 10),
  details text not null default '' check (char_length(details) <= 2000),
  preferred_date date not null,
  slot text not null check (slot in ('morning', 'afternoon', 'evening')),
  name text not null check (char_length(name) between 1 and 120),
  phone text not null check (char_length(phone) between 10 and 30),
  email text not null default '' check (char_length(email) <= 200),
  -- new: waiting for the team. offered: sent to provider_id. accepted / declined: the provider's answer.
  status text not null default 'new'
    check (status in ('new', 'offered', 'accepted', 'declined', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index booking_requests_customer_idx on public.booking_requests (customer_id);
create index booking_requests_provider_idx on public.booking_requests (provider_id);

alter table public.booking_requests enable row level security;

create policy "Customers read their bookings, providers read jobs offered to them" on public.booking_requests
  for select to authenticated
  using (customer_id = (select auth.uid()) or provider_id = (select auth.uid()));

-- All writes go through the functions below.
revoke insert, update, delete on public.booking_requests from anon, authenticated;
grant select on public.booking_requests to authenticated;

-- ------------------------------------------------- new account -> profile

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted text := coalesce(new.raw_user_meta_data ->> 'role', 'customer');
begin
  if wanted not in ('customer', 'provider') then
    wanted := 'customer';
  end if;

  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    wanted,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 30)
  );

  if wanted = 'provider' then
    insert into public.provider_profiles (id) values (new.id);
    -- The three checks every tradesperson needs. Register checks are added
    -- during onboarding, for the trades that need them.
    insert into public.provider_checks (provider_id, kind)
    values (new.id, 'identity'), (new.id, 'dbs'), (new.id, 'insurance');
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------- booking calls

-- Send a booking request. Works with or without an account; when signed in,
-- the request is linked to the customer. Returns the reference.
create function public.create_booking_request(
  p_trade text,
  p_job text,
  p_postcode text,
  p_details text,
  p_date date,
  p_slot text,
  p_name text,
  p_phone text,
  p_email text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  ref text;
begin
  if p_date < current_date - 1 or p_date > current_date + 31 then
    raise exception 'Choose a day in the next four weeks';
  end if;

  -- Stop spam without a CAPTCHA: at most 5 requests an hour from one phone number.
  if (select count(*) from public.booking_requests
       where regexp_replace(phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
         and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many requests from this phone number. Please call us instead.';
  end if;

  loop
    ref := 'PT' || upper(substr(md5(gen_random_uuid()::text), 1, 5));
    exit when not exists (select 1 from public.booking_requests where reference = ref);
  end loop;

  insert into public.booking_requests
    (reference, customer_id, trade, job, postcode, details, preferred_date, slot, name, phone, email)
  values
    (ref, auth.uid(), p_trade, p_job, upper(trim(p_postcode)), coalesce(trim(p_details), ''), p_date, p_slot,
     trim(p_name), trim(p_phone), coalesce(trim(p_email), ''));

  return ref;
end;
$$;

-- A provider accepts or declines a job offered to them.
create function public.respond_to_booking(p_booking uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.booking_requests
     set status = case when p_accept then 'accepted' else 'declined' end,
         updated_at = now()
   where id = p_booking and provider_id = auth.uid() and status = 'offered';
  if not found then
    raise exception 'This job is not waiting for your answer';
  end if;
end;
$$;

-- A provider marks an accepted job as done.
create function public.complete_booking(p_booking uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.booking_requests
     set status = 'completed', updated_at = now()
   where id = p_booking and provider_id = auth.uid() and status = 'accepted';
  if not found then
    raise exception 'Only an accepted job can be marked as done';
  end if;
end;
$$;

-- A customer cancels their own request before it is finished.
create function public.cancel_booking(p_booking uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.booking_requests
     set status = 'cancelled', updated_at = now()
   where id = p_booking and customer_id = auth.uid() and status in ('new', 'offered', 'declined', 'accepted');
  if not found then
    raise exception 'This request can no longer be cancelled online. Please call us.';
  end if;
end;
$$;

revoke execute on function public.create_booking_request(text, text, text, text, date, text, text, text, text) from public;
revoke execute on function public.respond_to_booking(uuid, boolean) from public;
revoke execute on function public.complete_booking(uuid) from public;
revoke execute on function public.cancel_booking(uuid) from public;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

grant execute on function public.create_booking_request(text, text, text, text, date, text, text, text, text) to anon, authenticated;
grant execute on function public.respond_to_booking(uuid, boolean) to authenticated;
grant execute on function public.complete_booking(uuid) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
