-- Passionate Taskers: booking online now needs an account. Run after 0008.
-- The site sends signed-out visitors to /login before /book; this closes the
-- database side, so the public key alone can no longer create a request.
-- Booking by phone is unchanged: the team enters those requests.

revoke execute on function public.create_booking_request(text, text, text, text, date, text, text, text, text, uuid) from anon;
