-- Passionate Taskers: in-app notifications (the bell on every dashboard). Run after 0009.
--
-- A trigger on booking_requests writes them, so every way a booking changes
-- (the site, the team's admin page, the SQL editor) tells the right people:
-- - tradesperson: a job is offered to them, or a job of theirs is cancelled
-- - customer: their request is received, accepted, done, or cancelled by the team
-- - team: a request needs a tradesperson (nobody matched, or everyone said no)
-- People only read and mark their own; nobody writes them from the site.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  booking_id uuid references public.booking_requests (id) on delete cascade,
  title text not null,
  body text not null default '',
  href text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_created on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "People read their own notifications" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));

-- Only marking as read: no other column can change.
create policy "People mark their own notifications read" on public.notifications
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

create function public.notify_booking_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  job text := initcap(replace(new.trade, '-', ' ')) || ' job in ' || new.postcode || ' · Ref ' || new.reference;
  status_changed boolean := tg_op = 'INSERT' or new.status is distinct from old.status;
  provider_changed boolean := tg_op = 'INSERT' or new.provider_id is distinct from old.provider_id;
begin
  -- Offered to a tradesperson (new booking, a re-offer after a decline, or the team's choice).
  if new.status = 'offered' and new.provider_id is not null and (status_changed or provider_changed) then
    insert into public.notifications (user_id, booking_id, title, body, href)
    values (new.provider_id, new.id, 'New job offered to you', job || '. Please accept or decline.', '/provider/jobs');
  end if;

  -- The customer's own copy of what they just sent.
  if tg_op = 'INSERT' and new.customer_id is not null then
    insert into public.notifications (user_id, booking_id, title, body, href)
    values (new.customer_id, new.id, 'We have your request', job || case when new.status = 'offered'
      then '. We have offered it to a checked tradesperson and will tell you when they accept.'
      else '. Our team will find a checked tradesperson and call you.' end, '/account');
  end if;

  if not status_changed then return new; end if;

  if new.status = 'accepted' and new.customer_id is not null then
    insert into public.notifications (user_id, booking_id, title, body, href)
    values (new.customer_id, new.id, 'Your job is accepted', job || '. A checked tradesperson is coming.', '/account');
  end if;

  if new.status = 'completed' and new.customer_id is not null then
    insert into public.notifications (user_id, booking_id, title, body, href)
    values (new.customer_id, new.id, 'Your job is done', job || '.', '/account');
  end if;

  if new.status = 'cancelled' then
    -- Tell the side that did not cancel it.
    if new.provider_id is not null and new.provider_id is distinct from auth.uid() then
      insert into public.notifications (user_id, booking_id, title, body, href)
      values (new.provider_id, new.id, 'A job was cancelled', job || '.', '/provider/jobs');
    end if;
    if new.customer_id is not null and new.customer_id is distinct from auth.uid() then
      insert into public.notifications (user_id, booking_id, title, body, href)
      values (new.customer_id, new.id, 'Your request was cancelled', job || '. Call us if this is a mistake.', '/account');
    end if;
  end if;

  -- Nobody matched, or everyone said no: the team arranges it.
  if new.status in ('new', 'declined') then
    insert into public.notifications (user_id, booking_id, title, body, href)
    select p.id, new.id, 'A request needs a tradesperson', job || '.', '/admin/requests'
      from public.profiles p where p.role = 'admin';
  end if;

  return new;
end;
$$;

revoke execute on function public.notify_booking_change() from public, anon, authenticated;

create trigger booking_notifications
  after insert or update of status, provider_id on public.booking_requests
  for each row execute function public.notify_booking_change();
