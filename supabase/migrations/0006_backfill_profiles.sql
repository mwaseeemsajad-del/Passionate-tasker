-- Passionate Taskers: profiles for accounts made before the sign-up trigger existed.
--
-- Accounts created before 0001 ran have no row in public.profiles, so booking
-- while signed in failed on the customer_id foreign key. This makes the
-- missing profiles (as the trigger would have), and makes booking never fail
-- for that reason again: without a profile, the request is simply not linked
-- to the account.

insert into public.profiles (id, role, full_name, phone)
select u.id,
       case when u.raw_user_meta_data ->> 'role' = 'provider' then 'provider' else 'customer' end,
       left(coalesce(u.raw_user_meta_data ->> 'full_name', ''), 120),
       left(coalesce(u.raw_user_meta_data ->> 'phone', ''), 30)
  from auth.users u
 where not exists (select 1 from public.profiles p where p.id = u.id);

insert into public.provider_profiles (id)
select p.id from public.profiles p
 where p.role = 'provider' and not exists (select 1 from public.provider_profiles pp where pp.id = p.id);

insert into public.provider_checks (provider_id, kind)
select p.id, k.kind
  from public.profiles p
 cross join (values ('identity'), ('dbs'), ('insurance')) as k (kind)
 where p.role = 'provider'
on conflict (provider_id, kind) do nothing;

-- Link the request to the account only when the profile exists.
create or replace function public.create_booking_request(
  p_trade text,
  p_job text,
  p_postcode text,
  p_details text,
  p_date date,
  p_slot text,
  p_name text,
  p_phone text,
  p_email text,
  p_provider uuid default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  ref text;
  v_provider uuid;
  v_mode text := 'team';
  v_customer uuid := (select id from public.profiles where id = auth.uid());
begin
  if p_date < current_date - 1 or p_date > current_date + 31 then
    raise exception 'Choose a day in the next four weeks';
  end if;

  if (select count(*) from public.booking_requests
       where regexp_replace(phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
         and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many requests from this phone number. Please call us instead.';
  end if;

  if p_provider is not null and exists (
    select 1 from public.provider_profiles where id = p_provider and status = 'approved' and p_trade = any (trades)
  ) then
    v_provider := p_provider;
    v_mode := 'customer';
  else
    select provider_id into v_provider from public.match_providers(p_trade, p_postcode) limit 1;
    if v_provider is not null then v_mode := 'auto'; end if;
  end if;

  loop
    ref := 'PT' || upper(substr(md5(gen_random_uuid()::text), 1, 5));
    exit when not exists (select 1 from public.booking_requests where reference = ref);
  end loop;

  insert into public.booking_requests
    (reference, customer_id, provider_id, status, match_mode, trade, job, postcode, details, preferred_date, slot, name, phone, email)
  values
    (ref, v_customer, v_provider, case when v_provider is null then 'new' else 'offered' end, v_mode,
     p_trade, p_job, upper(trim(p_postcode)), coalesce(trim(p_details), ''), p_date, p_slot,
     trim(p_name), trim(p_phone), coalesce(trim(p_email), ''));

  return ref;
end;
$$;
