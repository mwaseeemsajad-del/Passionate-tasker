-- Passionate Taskers: customers choose who comes, or we match automatically.
--
-- B. Choose: while booking, a customer sees the approved tradespeople for the
--    trade, nearest first, and can pick one. The job is offered straight to them.
-- C. Automatic: "Let us choose" (the default, and always by voice) offers the
--    job to the nearest, least busy approved tradesperson.
-- When a tradesperson declines, the job moves on to the next match by itself.
-- When nobody is left, it waits for the team (status "declined" or "new").

alter table public.booking_requests
  add column match_mode text not null default 'team' check (match_mode in ('customer', 'auto', 'team'));

-- Who has said no to a job, so it is never offered to them again.
create table public.booking_declines (
  booking_id uuid not null references public.booking_requests (id) on delete cascade,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  declined_at timestamptz not null default now(),
  primary key (booking_id, provider_id)
);
alter table public.booking_declines enable row level security;
-- No policies: only the functions below read or write it.
revoke all on public.booking_declines from anon, authenticated;

-- "SE15 4QF" -> "SE15"; "se15" -> "SE15".
create function public.postcode_district(p text)
returns text
language sql
immutable
set search_path = ''
as $$ select upper(split_part(trim(coalesce(p, '')), ' ', 1)) $$;

-- Approved tradespeople who do this trade, best match first: same postcode
-- district, then same postcode area (the letters), then anyone; fewer open
-- jobs first. Internal: called by the functions below, not by the site.
create function public.match_providers(p_trade text, p_postcode text, p_exclude uuid[] default '{}')
returns table (provider_id uuid, closeness int, open_jobs bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with target as (
    select public.postcode_district(p_postcode) as district,
           substring(public.postcode_district(p_postcode) from '^[A-Z]+') as area
  )
  select pp.id,
         case
           when public.postcode_district(pp.postcode) = t.district then 0
           when substring(public.postcode_district(pp.postcode) from '^[A-Z]+') = t.area then 1
           else 2
         end as closeness,
         (select count(*) from public.booking_requests br
           where br.provider_id = pp.id and br.status in ('offered', 'accepted')) as open_jobs
    from public.provider_profiles pp, target t
   where pp.status = 'approved'
     and p_trade = any (pp.trades)
     and not (pp.id = any (coalesce(p_exclude, '{}')))
   order by closeness, open_jobs, pp.created_at
$$;

-- What a customer may see about the tradespeople they can choose: first name
-- and initial, area, a few words about their work and jobs done. Never a
-- phone number or address.
create function public.list_available_providers(p_trade text, p_postcode text)
returns table (id uuid, display_name text, area text, about text, jobs_done bigint, registered text)
language sql
stable
security definer
set search_path = ''
as $$
  select m.provider_id,
         trim(split_part(p.full_name, ' ', 1) || ' ' ||
              coalesce(left(nullif(split_part(p.full_name, ' ', 2), ''), 1) || '.', '')),
         public.postcode_district(pp.postcode),
         left(pp.about, 280),
         (select count(*) from public.booking_requests br where br.provider_id = pp.id and br.status = 'completed'),
         case
           when p_trade in ('gas', 'heating') and pp.gas_safe <> '' then 'Gas Safe registered'
           when p_trade = 'electrical' and pp.electrical_scheme <> '' then 'Electrical scheme member'
           else ''
         end
    from public.match_providers(p_trade, p_postcode) m
    join public.provider_profiles pp on pp.id = m.provider_id
    join public.profiles p on p.id = m.provider_id
   order by m.closeness, m.open_jobs
   limit 6
$$;

-- Booking now takes an optional chosen tradesperson. Replaces the 0001 version.
drop function public.create_booking_request(text, text, text, text, date, text, text, text, text);

create function public.create_booking_request(
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

  -- B: the customer's choice, if that person is approved for this trade.
  if p_provider is not null and exists (
    select 1 from public.provider_profiles where id = p_provider and status = 'approved' and p_trade = any (trades)
  ) then
    v_provider := p_provider;
    v_mode := 'customer';
  else
    -- C: the best automatic match, if there is one. Otherwise the team arranges it.
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
    (ref, auth.uid(), v_provider, case when v_provider is null then 'new' else 'offered' end, v_mode,
     p_trade, p_job, upper(trim(p_postcode)), coalesce(trim(p_details), ''), p_date, p_slot,
     trim(p_name), trim(p_phone), coalesce(trim(p_email), ''));

  return ref;
end;
$$;

-- Accept, or decline and pass the job on to the next match.
create or replace function public.respond_to_booking(p_booking uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.booking_requests%rowtype;
  v_next uuid;
begin
  select * into b from public.booking_requests
   where id = p_booking and provider_id = auth.uid() and status = 'offered'
   for update;
  if not found then
    raise exception 'This job is not waiting for your answer';
  end if;

  if p_accept then
    update public.booking_requests set status = 'accepted', updated_at = now() where id = p_booking;
    return;
  end if;

  insert into public.booking_declines (booking_id, provider_id) values (p_booking, auth.uid()) on conflict do nothing;

  select provider_id into v_next
    from public.match_providers(b.trade, b.postcode, array(select provider_id from public.booking_declines where booking_id = p_booking))
   limit 1;

  if v_next is not null then
    update public.booking_requests
       set provider_id = v_next, status = 'offered', match_mode = 'auto', updated_at = now()
     where id = p_booking;
  else
    update public.booking_requests set status = 'declined', updated_at = now() where id = p_booking;
  end if;
end;
$$;

-- The name of the tradesperson coming to each of the signed-in customer's
-- booked jobs, so the customer knows who to expect at the door.
create function public.my_booking_providers()
returns table (booking_id uuid, provider_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select br.id,
         trim(split_part(p.full_name, ' ', 1) || ' ' ||
              coalesce(left(nullif(split_part(p.full_name, ' ', 2), ''), 1) || '.', ''))
    from public.booking_requests br
    join public.profiles p on p.id = br.provider_id
   where br.customer_id = (select auth.uid())
     and br.status in ('accepted', 'completed')
$$;

revoke execute on function public.postcode_district(text) from public, anon, authenticated;
revoke execute on function public.match_providers(text, text, uuid[]) from public, anon, authenticated;
revoke execute on function public.list_available_providers(text, text) from public;
revoke execute on function public.create_booking_request(text, text, text, text, date, text, text, text, text, uuid) from public;
revoke execute on function public.my_booking_providers() from public, anon;

grant execute on function public.list_available_providers(text, text) to anon, authenticated;
grant execute on function public.create_booking_request(text, text, text, text, date, text, text, text, text, uuid) to anon, authenticated;
grant execute on function public.my_booking_providers() to authenticated;
