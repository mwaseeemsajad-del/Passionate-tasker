-- Passionate Taskers: finish an account made with Google. Run after 0007.
--
-- Google sign-in cannot carry the sign-up metadata, so the profile trigger
-- makes every Google account a customer with no phone. On first sign-in the
-- person picks customer or tradesperson and gives a phone number, once.
--
-- Allowed only while the account is unfinished: signed up with Google, no
-- phone yet, still a customer, and no booking requests. After that the role
-- is fixed, as for every other account.

create function public.finish_google_signup(p_role text, p_phone text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  v_phone text := left(trim(coalesce(p_phone, '')), 30);
begin
  if me is null then raise exception 'Sign in first'; end if;
  if p_role not in ('customer', 'provider') then raise exception 'Choose customer or tradesperson'; end if;
  if length(regexp_replace(v_phone, '\D', '', 'g')) < 10 then raise exception 'Enter a phone number with at least 10 digits'; end if;

  if not exists (
    select 1
      from public.profiles p
      join auth.users u on u.id = p.id
     where p.id = me
       and p.role = 'customer'
       and p.phone = ''
       and u.raw_app_meta_data ->> 'provider' = 'google'
  ) or exists (select 1 from public.booking_requests where customer_id = me) then
    raise exception 'This account is already set up';
  end if;

  update public.profiles set role = p_role, phone = v_phone where id = me;

  -- Same rows the sign-up trigger makes for a tradesperson.
  if p_role = 'provider' then
    insert into public.provider_profiles (id) values (me);
    insert into public.provider_checks (provider_id, kind)
    values (me, 'identity'), (me, 'dbs'), (me, 'insurance');
  end if;
end;
$$;

revoke execute on function public.finish_google_signup(text, text) from public, anon;
grant execute on function public.finish_google_signup(text, text) to authenticated;
