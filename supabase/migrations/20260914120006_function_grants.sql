-- Who may call which function.
--
-- Postgres grants EXECUTE on every new function to PUBLIC, and Supabase's default
-- privileges add anon on top. The earlier migrations only ever granted, never
-- revoked, so signed-out visitors could inflate the login counter and read any
-- counselor's free slots. Revoke from everyone who is not signed in, then grant back
-- the two functions the public site actually needs.

revoke execute on all functions in schema public from public, anon;
alter default privileges in schema public revoke execute on functions from public, anon;

grant execute on all functions in schema public to authenticated, service_role;

-- Signed-out visitors: the page view counter and the signup form's username check.
grant execute on function public.increment_daily_visitor() to anon;
grant execute on function public.is_username_available(text) to anon;

-- Row-level security policies on anon-readable tables call none of the helpers, so
-- anon needs nothing else.

-- The access token hook is for the auth server alone. The blanket grant above just
-- gave it back to authenticated.
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated;

-- Trigger functions are never called directly.
revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.guard_appointment_update() from authenticated;
revoke execute on function public.guard_student_update() from authenticated;
revoke execute on function public.guard_staff_update() from authenticated;
revoke execute on function public.notify_appointment_change() from authenticated;
revoke execute on function public.assert_slot_bookable() from authenticated;
revoke execute on function public.set_updated_at() from authenticated;
