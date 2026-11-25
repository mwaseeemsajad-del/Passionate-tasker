-- Passionate Taskers: Phase 2, accounts and verification. Run after 0010, in the SQL Editor.
--
-- 1. Business details on the tradesperson's profile, and a "business" check for everyone.
-- 2. Languages and availability (days and times). Matching only offers a job
--    to someone who works on that day and at that time.
-- 3. Private document storage: a tradesperson uploads each document for a
--    check; only they and the team can open it, through short-lived links.
-- 4. Expiry: reminders 30 and 7 days before a check runs out; on the day, the
--    check goes back to "to do" and the account is paused until it is renewed.
--    Runs every morning through pg_cron (scheduled in 0012).
-- 5. Audit log: who changed which check or account status, and when. The
--    tradesperson is also notified when a check is approved or needs redoing,
--    and when their account is approved or paused.
-- 6. The team's powers need two-step sign-in (aal2): is_admin() is false without it.

-- ------------------------------------------------ 1 and 2: profile fields

alter table public.provider_profiles
  add column business_type text not null default '' check (business_type in ('', 'sole_trader', 'limited', 'partnership')),
  add column business_name text not null default '' check (char_length(business_name) <= 160),
  add column company_number text not null default '' check (company_number ~ '^([A-Z0-9]{8})?$'),
  add column business_address text not null default '' check (char_length(business_address) <= 300),
  add column languages text[] not null default '{English}' check (cardinality(languages) between 1 and 12),
  -- ISO days: 1 Monday to 7 Sunday.
  add column available_days smallint[] not null default '{1,2,3,4,5,6,7}' check (available_days <@ array[1,2,3,4,5,6,7]::smallint[] and cardinality(available_days) >= 1),
  add column available_slots text[] not null default '{morning,afternoon,evening}' check (available_slots <@ array['morning', 'afternoon', 'evening'] and cardinality(available_slots) >= 1);

grant update (business_type, business_name, company_number, business_address, languages, available_days, available_slots)
  on public.provider_profiles to authenticated;

-- The business check, for everyone. Existing approved tradespeople keep working:
-- their new check starts approved, as the team has already met them.
alter table public.provider_checks drop constraint provider_checks_kind_check;
alter table public.provider_checks add constraint provider_checks_kind_check
  check (kind in ('identity', 'business', 'dbs', 'insurance', 'gas-safe', 'electrical'));

insert into public.provider_checks (provider_id, kind, status, expires_on)
select pp.id, 'business', case when pp.status = 'approved' then 'approved' else 'not_started' end,
       case when pp.status = 'approved' then current_date + 365 end
  from public.provider_profiles pp
on conflict (provider_id, kind) do nothing;

create or replace function public.handle_new_user()
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
    -- The checks every tradesperson needs. Register checks are added
    -- during onboarding, for the trades that need them.
    insert into public.provider_checks (provider_id, kind)
    values (new.id, 'identity'), (new.id, 'business'), (new.id, 'dbs'), (new.id, 'insurance');
  end if;

  return new;
end;
$$;

-- ---------------------------------------------- 2: matching by availability

drop function public.match_providers(text, text, uuid[]);
create function public.match_providers(p_trade text, p_postcode text, p_exclude uuid[] default '{}', p_date date default null, p_slot text default null)
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
     and (p_date is null or extract(isodow from p_date)::smallint = any (pp.available_days))
     and (p_slot is null or p_slot = any (pp.available_slots))
   order by closeness, open_jobs, pp.created_at
$$;
revoke execute on function public.match_providers(text, text, uuid[], date, text) from public, anon, authenticated;

drop function public.list_available_providers(text, text);
create function public.list_available_providers(p_trade text, p_postcode text, p_date date default null, p_slot text default null)
returns table (id uuid, display_name text, area text, about text, jobs_done bigint, registered text, languages text[])
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
         end,
         pp.languages
    from public.match_providers(p_trade, p_postcode, '{}', p_date, p_slot) m
    join public.provider_profiles pp on pp.id = m.provider_id
    join public.profiles p on p.id = m.provider_id
   order by m.closeness, m.open_jobs
   limit 6
$$;
revoke execute on function public.list_available_providers(text, text, date, text) from public;
grant execute on function public.list_available_providers(text, text, date, text) to anon, authenticated;

-- Same as 0005, but automatic matching now checks the day and time.
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

  -- The customer's choice, if that person is approved for this trade and works then.
  if p_provider is not null and exists (
    select 1 from public.match_providers(p_trade, p_postcode, '{}', p_date, p_slot) where provider_id = p_provider
  ) then
    v_provider := p_provider;
    v_mode := 'customer';
  else
    select provider_id into v_provider from public.match_providers(p_trade, p_postcode, '{}', p_date, p_slot) limit 1;
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

-- Same as 0005, but the next match must also work on that day and at that time.
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
    from public.match_providers(b.trade, b.postcode, array(select provider_id from public.booking_declines where booking_id = p_booking), b.preferred_date, b.slot)
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

-- ------------------------------------------------------ 3: document storage

-- Private bucket. Files live at <provider id>/<check kind>/<file name>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('provider-documents', 'provider-documents', false, 10485760,
        array['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Tradespeople upload their own documents" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'provider-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Tradespeople and the team read documents" on storage.objects
  for select to authenticated
  using (bucket_id = 'provider-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())));

-- A tradesperson may remove a document they sent by mistake, while the check is not yet approved.
create policy "Tradespeople remove their own documents" on storage.objects
  for delete to authenticated
  using (bucket_id = 'provider-documents' and (storage.foldername(name))[1] = (select auth.uid())::text
         and not exists (select 1 from public.provider_checks c
                          where c.provider_id = (select auth.uid()) and c.kind = (storage.foldername(name))[2] and c.status = 'approved'));

-- A renewal uploaded while a check is still approved sends it back to the team as "sent".
-- The tradesperson still can only ever set "to do" or "sent", never "approved".
drop policy "Mark own checks submitted" on public.provider_checks;
create policy "Mark own checks submitted" on public.provider_checks
  for update to authenticated
  using (provider_id = (select auth.uid()) and status in ('not_started', 'submitted', 'rejected', 'approved'))
  with check (provider_id = (select auth.uid()) and status in ('not_started', 'submitted'));

-- The documents a caller may see, in one call: their own, or everyone's for the team.
create function public.list_provider_documents()
returns table (provider_id uuid, kind text, path text, file_name text, uploaded_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select ((storage.foldername(o.name))[1])::uuid, (storage.foldername(o.name))[2], o.name,
         regexp_replace(storage.filename(o.name), '^\d+-', ''), o.created_at
    from storage.objects o
   where o.bucket_id = 'provider-documents'
     and ((storage.foldername(o.name))[1] = (select auth.uid())::text or (select public.is_admin()))
   order by o.created_at desc
$$;
revoke execute on function public.list_provider_documents() from public, anon;
grant execute on function public.list_provider_documents() to authenticated;

-- --------------------------------------------------------------- 5: audit log

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  target_type text not null,
  target_id uuid not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_log_target on public.audit_log (target_id, created_at desc);

alter table public.audit_log enable row level security;
create policy "The team reads the audit log" on public.audit_log
  for select to authenticated using ((select public.is_admin()));
-- Nobody writes or changes it from the site: only the triggers below add rows.
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

create function public.audit_provider_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'provider_checks' then
    if new.status is distinct from old.status or new.expires_on is distinct from old.expires_on or new.note is distinct from old.note then
      insert into public.audit_log (actor_id, action, target_type, target_id, details)
      values (auth.uid(), 'check ' || new.kind || ': ' || old.status || ' -> ' || new.status, 'provider', new.provider_id,
              jsonb_build_object('check_id', new.id, 'kind', new.kind, 'from', old.status, 'to', new.status,
                                 'expires_on', new.expires_on, 'note', new.note));
    end if;
    -- Not while a new tradesperson is being approved in one go: "You are approved" says it once.
    if new.status is distinct from old.status and new.status in ('approved', 'rejected')
       and not (new.status = 'approved' and exists (select 1 from public.provider_profiles where id = new.provider_id and status = 'pending_checks')) then
      insert into public.notifications (user_id, title, body, href)
      values (new.provider_id,
              case when new.status = 'approved' then 'Check done: ' else 'Please send this again: ' end || initcap(replace(new.kind, '-', ' ')),
              case when new.note <> '' then new.note else case when new.status = 'approved' then 'Thank you. Nothing more to do for this one.' else 'Open your checks to see what we need.' end end,
              '/provider/checks');
    end if;
  elsif new.status is distinct from old.status then
    insert into public.audit_log (actor_id, action, target_type, target_id, details)
    values (auth.uid(), 'account: ' || old.status || ' -> ' || new.status, 'provider', new.id,
            jsonb_build_object('from', old.status, 'to', new.status));
    if new.status = 'approved' then
      insert into public.notifications (user_id, title, body, href)
      values (new.id, 'You are approved', 'Every check is done. We can now offer you jobs.', '/provider');
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.audit_provider_change() from public, anon, authenticated;

create trigger audit_provider_checks after update on public.provider_checks
  for each row execute function public.audit_provider_change();
create trigger audit_provider_profiles after update of status on public.provider_profiles
  for each row execute function public.audit_provider_change();

-- ---------------------------------------------------------------- 4: expiry

-- Daily. Reminds at 30 and 7 days; on the day, the check goes back to "to do"
-- and an approved account is paused, so no new job is offered.
create function public.run_check_expiry()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c record;
begin
  for c in
    select pc.id, pc.provider_id, pc.kind, pc.expires_on, pc.expires_on - current_date as days_left
      from public.provider_checks pc
     where pc.status = 'approved' and pc.expires_on is not null and pc.expires_on - current_date in (30, 7)
  loop
    insert into public.notifications (user_id, title, body, href)
    values (c.provider_id, 'A check runs out in ' || c.days_left || ' days',
            initcap(replace(c.kind, '-', ' ')) || ' runs out on ' || to_char(c.expires_on, 'FMDD Month YYYY') ||
            '. Upload the new document so you keep getting jobs.', '/provider/checks');
  end loop;

  for c in
    select pc.id, pc.provider_id, pc.kind, pc.expires_on
      from public.provider_checks pc
     where pc.status = 'approved' and pc.expires_on is not null and pc.expires_on <= current_date
  loop
    update public.provider_checks
       set status = 'not_started', note = 'Ran out on ' || to_char(c.expires_on, 'FMDD Month YYYY') || '. Please send the new one.', updated_at = now()
     where id = c.id;
    update public.provider_profiles set status = 'paused', updated_at = now() where id = c.provider_id and status = 'approved';
    insert into public.notifications (user_id, title, body, href)
    values (c.provider_id, 'Your account is paused',
            initcap(replace(c.kind, '-', ' ')) || ' ran out. Upload the new document and we will turn jobs back on.', '/provider/checks');
  end loop;
end;
$$;
revoke execute on function public.run_check_expiry() from public, anon, authenticated;

-- ------------------------------------------------------- 6: two-step for admins

-- The team's powers (reading everyone's data, approving, offering jobs) need a
-- session that passed two-step sign-in. Every admin policy and function goes
-- through this one function.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
     and exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
