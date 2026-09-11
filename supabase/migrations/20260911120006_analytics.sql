-- Daily counters for the admin dashboard.
--
-- Both increment functions are security definer with execute granted to anon, so
-- the application no longer needs the service-role key to count a page view. That
-- was the only reason src/app/actions.ts held the service client.

create table public.analytics_daily_visitor (
  date               date primary key,
  number_of_visitors integer not null default 0
);

create table public.analytics_daily_login (
  date             date primary key,
  number_of_logins integer not null default 0
);

create or replace function public.increment_daily_visitor()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.analytics_daily_visitor (date, number_of_visitors)
  values (current_date, 1)
  on conflict (date)
  do update set number_of_visitors = analytics_daily_visitor.number_of_visitors + 1;
$$;

create or replace function public.increment_daily_login()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.analytics_daily_login (date, number_of_logins)
  values (current_date, 1)
  on conflict (date)
  do update set number_of_logins = analytics_daily_login.number_of_logins + 1;
$$;

grant execute on function public.increment_daily_visitor to anon, authenticated;
grant execute on function public.increment_daily_login to authenticated;
