-- Passionate Taskers: the team's admin role. Run after 0001, in the SQL Editor.
--
-- To make someone on the team an admin, after they have signed up as a customer:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'team@example.co.uk');
-- Nobody can make themselves an admin from the site: sign-up only ever
-- creates customers and providers, and the role column cannot be updated.

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('customer', 'provider', 'admin'));

-- True when the person calling is on the team.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- The team reads everything it needs to arrange jobs.
create policy "Team reads all profiles" on public.profiles for select to authenticated using ((select public.is_admin()));
create policy "Team reads all provider profiles" on public.provider_profiles for select to authenticated using ((select public.is_admin()));
create policy "Team reads all checks" on public.provider_checks for select to authenticated using ((select public.is_admin()));
create policy "Team reads all booking requests" on public.booking_requests for select to authenticated using ((select public.is_admin()));

-- Offer a job to an approved tradesperson who does that trade.
create function public.admin_offer_booking(p_booking uuid, p_provider uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Team only'; end if;
  if not exists (
    select 1 from public.provider_profiles pp
      join public.booking_requests br on br.id = p_booking
     where pp.id = p_provider and pp.status = 'approved' and br.trade = any (pp.trades)
  ) then
    raise exception 'Choose an approved tradesperson who does this trade';
  end if;
  update public.booking_requests
     set provider_id = p_provider, status = 'offered', updated_at = now()
   where id = p_booking and status in ('new', 'declined', 'offered');
  if not found then raise exception 'This request cannot be offered now'; end if;
end;
$$;

-- Cancel a request, put it back to new, or close it as done.
create function public.admin_set_booking_status(p_booking uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Team only'; end if;
  if p_status not in ('new', 'cancelled', 'completed') then raise exception 'Not a status the team sets'; end if;
  update public.booking_requests
     set status = p_status,
         provider_id = case when p_status = 'new' then null else provider_id end,
         updated_at = now()
   where id = p_booking;
end;
$$;

-- Approve or reject one check, with a note the tradesperson sees and the date it runs out.
create function public.admin_set_check(p_check uuid, p_status text, p_note text, p_expires date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Team only'; end if;
  if p_status not in ('not_started', 'submitted', 'approved', 'rejected') then raise exception 'Unknown status'; end if;
  update public.provider_checks
     set status = p_status, note = left(coalesce(p_note, ''), 500), expires_on = p_expires, updated_at = now()
   where id = p_check;
end;
$$;

-- Approve, pause or hold a tradesperson. Approval needs every check approved first.
create function public.admin_set_provider_status(p_provider uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Team only'; end if;
  if p_status not in ('pending_checks', 'approved', 'paused') then raise exception 'Unknown status'; end if;
  if p_status = 'approved' and exists (
    select 1 from public.provider_checks where provider_id = p_provider and status <> 'approved'
  ) then
    raise exception 'Approve every check before approving the tradesperson';
  end if;
  update public.provider_profiles set status = p_status, updated_at = now() where id = p_provider;
end;
$$;

revoke execute on function public.admin_offer_booking(uuid, uuid) from public;
revoke execute on function public.admin_set_booking_status(uuid, text) from public;
revoke execute on function public.admin_set_check(uuid, text, text, date) from public;
revoke execute on function public.admin_set_provider_status(uuid, text) from public;
grant execute on function public.admin_offer_booking(uuid, uuid) to authenticated;
grant execute on function public.admin_set_booking_status(uuid, text) to authenticated;
grant execute on function public.admin_set_check(uuid, text, text, date) to authenticated;
grant execute on function public.admin_set_provider_status(uuid, text) to authenticated;
