-- Removes the DEMO tradespeople made by demo_tradespeople.sql, and everything
-- that hangs off them (profile, checks). Bookings offered to them are kept
-- and go back to the team ("new"), so no customer request is lost.

update public.booking_requests br
   set provider_id = null, status = 'new', match_mode = 'team', updated_at = now()
  from auth.users u
 where u.id = br.provider_id
   and u.email like 'demo+%@passionatetaskers.invalid'
   and br.status in ('offered', 'accepted');

delete from auth.users where email like 'demo+%@passionatetaskers.invalid';
