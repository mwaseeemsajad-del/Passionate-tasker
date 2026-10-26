-- Passionate Taskers: approve a tradesperson in one step.
-- Marks every one of their checks as checked (valid for a year) and their
-- account as approved for jobs, together, so the team does not have to save
-- each check on its own. Team only.

create function public.admin_approve_provider(p_provider uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Team only'; end if;
  if not exists (select 1 from public.provider_profiles where id = p_provider and onboarded_at is not null) then
    raise exception 'This tradesperson has not finished joining yet';
  end if;
  update public.provider_checks
     set status = 'approved', expires_on = coalesce(expires_on, current_date + 365), updated_at = now()
   where provider_id = p_provider and status <> 'approved';
  update public.provider_profiles set status = 'approved', updated_at = now() where id = p_provider;
end;
$$;

revoke execute on function public.admin_approve_provider(uuid) from public, anon;
grant execute on function public.admin_approve_provider(uuid) to authenticated;
