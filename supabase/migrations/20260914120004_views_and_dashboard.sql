-- One row per counselor, a single dashboard query, and analytics on the office's day.

-- counselor_with_details left-joined department, so a counselor assigned to three
-- departments came back as three rows. The admin table showed duplicates with an
-- inflated count, and every `.single()` read of a counselor failed with "multiple
-- rows returned". Departments are now aggregated.
drop view if exists public.counselor_with_details;

create view public.counselor_with_details
with (security_invoker = on) as
select
  c.id,
  c.user_id,
  c.username,
  c.email,
  c.first_name,
  c.last_name,
  c.phone,
  c.avatar,
  c.university_id,
  c.is_active,
  c.day_of_week,
  c.start_time,
  c.end_time,
  coalesce(
    array_agg(d.id order by d.title) filter (where d.id is not null),
    '{}'
  ) as department_ids,
  string_agg(d.title, ', ' order by d.title) as department
from public.counselor c
left join public.department d on d.counselor_id = c.id
group by c.id;

-- The appointment view gains the timestamps the lists sort by. Ordering by uuid, as
-- the lists did, returns history in random order.
create or replace view public.appointment_with_details
with (security_invoker = on) as
select
  a.id,
  a.student_id,
  a.counselor_id,
  a.scheduled_at,
  a.reason,
  a.notes,
  a.status,
  s.first_name as first_student_name,
  s.last_name  as last_student_name,
  s.email      as student_email,
  s.university_id as student_university_id,
  c.first_name as first_counselor_name,
  c.last_name  as last_counselor_name,
  a.created_at,
  a.updated_at
from public.appointment a
left join public.student s on s.id = a.student_id
left join public.counselor c on c.id = a.counselor_id;

-- ---------------------------------------------------------------------------
-- Analytics on Manila days
-- ---------------------------------------------------------------------------

-- current_date is the database server's UTC day, so everything before 08:00 in
-- Manila was counted against the previous date.
create or replace function public.app_today()
returns date
language sql
stable
as $$
  select (now() at time zone public.app_timezone())::date;
$$;

create or replace function public.increment_daily_visitor()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.analytics_daily_visitor (date, number_of_visitors)
  values (public.app_today(), 1)
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
  values (public.app_today(), 1)
  on conflict (date)
  do update set number_of_logins = analytics_daily_login.number_of_logins + 1;
$$;

-- Everything the admin dashboard shows, in one round trip. The page used to make six
-- serial server-action calls, three of them for date ranges that were subsets of the
-- first. "Appointments today" also counted yesterday's UTC day.
create or replace function public.admin_dashboard_stats(p_days int default 90)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  tz      text := public.app_timezone();
  v_today date := public.app_today();
  v_days  int  := least(greatest(coalesce(p_days, 90), 1), 366);
begin
  if not public.is_admin() then
    raise exception 'Only administrators can view the dashboard'
      using errcode = 'insufficient_privilege';
  end if;

  return jsonb_build_object(
    'today', v_today,
    'students', (select count(*) from public.student),
    'counselors', (select count(*) from public.counselor),
    'appointments_today', (
      select count(*) from public.appointment
      where (created_at at time zone tz)::date = v_today
    ),
    'pending_appointments', (
      select count(*) from public.appointment where status = 'pending'
    ),
    'visitors_30d', (
      select coalesce(sum(number_of_visitors), 0)
      from public.analytics_daily_visitor
      where date > v_today - 30
    ),
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'date', day::date,
        'visitors', coalesce(v.number_of_visitors, 0),
        'logins', coalesce(l.number_of_logins, 0),
        'appointments', coalesce(a.total, 0)
      ) order by day), '[]'::jsonb)
      from generate_series(v_today - (v_days - 1), v_today, interval '1 day') as day
      left join public.analytics_daily_visitor v on v.date = day::date
      left join public.analytics_daily_login l on l.date = day::date
      left join (
        select (created_at at time zone tz)::date as created_day, count(*) as total
        from public.appointment
        group by 1
      ) a on a.created_day = day::date
    )
  );
end;
$$;
