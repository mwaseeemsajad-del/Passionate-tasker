-- Passionate Taskers: one read policy per table instead of two.
-- The Supabase performance advisor flagged "multiple permissive policies":
-- each extra policy runs for every row read. Who can read what is unchanged:
-- people read their own rows, and the team (admins) reads everything.

drop policy "Read own profile" on public.profiles;
drop policy "Team reads all profiles" on public.profiles;
create policy "Read own profile, team reads all" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));

drop policy "Read own provider profile" on public.provider_profiles;
drop policy "Team reads all provider profiles" on public.provider_profiles;
create policy "Read own provider profile, team reads all" on public.provider_profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));

drop policy "Read own checks" on public.provider_checks;
drop policy "Team reads all checks" on public.provider_checks;
create policy "Read own checks, team reads all" on public.provider_checks
  for select to authenticated using (provider_id = (select auth.uid()) or (select public.is_admin()));

drop policy "Customers read their bookings, providers read jobs offered to them" on public.booking_requests;
drop policy "Team reads all booking requests" on public.booking_requests;
create policy "Own bookings, offered jobs, team reads all" on public.booking_requests
  for select to authenticated
  using (customer_id = (select auth.uid()) or provider_id = (select auth.uid()) or (select public.is_admin()));
