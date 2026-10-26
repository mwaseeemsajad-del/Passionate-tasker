-- Passionate Taskers: close functions to signed-out visitors. Run after 0002.
--
-- Supabase gives the anon role EXECUTE on every new function by default, so
-- "revoke ... from public" in 0001 and 0002 was not enough. Each of these
-- already did nothing without a signed-in user (auth.uid() is null), but
-- signed-out visitors should not be able to call them at all.
-- create_booking_request stays open to anon: booking without an account is allowed.

revoke execute on function public.respond_to_booking(uuid, boolean) from anon;
revoke execute on function public.complete_booking(uuid) from anon;
revoke execute on function public.cancel_booking(uuid) from anon;
revoke execute on function public.handle_new_user() from anon;

revoke execute on function public.is_admin() from anon;
revoke execute on function public.admin_offer_booking(uuid, uuid) from anon;
revoke execute on function public.admin_set_booking_status(uuid, text) from anon;
revoke execute on function public.admin_set_check(uuid, text, text, date) from anon;
revoke execute on function public.admin_set_provider_status(uuid, text) from anon;
