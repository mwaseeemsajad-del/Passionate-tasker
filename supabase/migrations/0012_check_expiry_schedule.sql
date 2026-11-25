-- Passionate Taskers: run the expiry check (0011) every morning at 06:00 UTC. Run after 0011.
-- If "create extension" fails, turn pg_cron on in Dashboard > Database > Extensions, then run this again.

create extension if not exists pg_cron;

select cron.schedule('check-expiry-daily', '0 6 * * *', 'select public.run_check_expiry()');
