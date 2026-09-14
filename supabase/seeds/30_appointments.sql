-- Demo appointments, notifications and analytics.
--
-- About three bookings per student, spread from 90 days ago to three weeks ahead.
-- Each lands on a real half-hour slot on a day the counselor works. Past bookings
-- are completed, cancelled or rejected; upcoming ones are pending or approved.
--
-- Two triggers are paused while this runs. assert_slot_bookable refuses anything in
-- the past, which is correct for real bookings and useless for history. The
-- notification trigger is paused so the bell is filled deliberately below, rather
-- than with 450 "new request" rows.

alter table public.appointment disable trigger appointment_assert_slot_bookable;
alter table public.appointment disable trigger appointment_notify;

do $$
declare
  tz         text := public.app_timezone();
  v_today    date := public.app_today();
  r          record;
  k          int;
  v_day      date;
  v_slots    int;
  v_at       timestamptz;
  v_status   public.appointment_status;
  v_created  timestamptz;
  v_reasons  text[] := array[
    'Academic concerns', 'Stress and anxiety', 'Career guidance', 'Family matters',
    'Relationship concerns', 'Adjustment to university life', 'Grief and loss',
    'Motivation and study habits', 'Financial worries', 'Just need someone to talk to'
  ];
begin
  for r in
    select
      s.id as student_id,
      c.id as counselor_id,
      c.day_of_week,
      c.start_time,
      c.end_time,
      (row_number() over (order by s.university_id))::int as n
    from public.student s
    join public.department d on d.id = s.department_id
    join public.counselor c on c.id = d.counselor_id
    where coalesce(c.is_active, true)
  loop
    for k in 1 .. 1 + (r.n % 4) loop
      v_day := v_today + (((r.n * 17 + k * 29) % 111) - 90)::int;

      -- Walk forward to a day this counselor works.
      for i in 0 .. 6 loop
        exit when r.day_of_week[extract(dow from v_day)::int + 1];
        v_day := v_day + 1;
      end loop;

      continue when not r.day_of_week[extract(dow from v_day)::int + 1];

      v_slots := (extract(epoch from (r.end_time - r.start_time)) / 1800)::int;
      continue when v_slots < 1;

      v_at := (v_day + r.start_time + make_interval(mins => 30 * ((r.n * 7 + k * 3) % v_slots)))
              at time zone tz;

      if v_at < now() then
        v_status := (array['completed','completed','completed','cancelled','rejected']::public.appointment_status[])
                    [1 + ((r.n + k) % 5)];
        v_created := v_at - make_interval(days => 1 + ((r.n + k) % 10));
      else
        v_status := (array['pending','approved']::public.appointment_status[])[1 + ((r.n + k) % 2)];
        v_created := least(now() - make_interval(hours => 1 + ((r.n * k) % 300)), v_at);
      end if;

      insert into public.appointment (
        student_id, counselor_id, scheduled_at, reason, notes, status, created_at, updated_at
      )
      values (
        r.student_id, r.counselor_id, v_at,
        v_reasons[1 + ((r.n + k * 3) % array_length(v_reasons, 1))],
        case when v_status = 'completed' and (r.n + k) % 3 = 0
             then 'Follow-up recommended in two weeks.' else '' end,
        v_status, v_created, v_created
      )
      on conflict do nothing;
    end loop;
  end loop;
end;
$$;

alter table public.appointment enable trigger appointment_assert_slot_bookable;
alter table public.appointment enable trigger appointment_notify;

-- ---------------------------------------------------------------------------
-- Notifications matching the last two weeks of activity
-- ---------------------------------------------------------------------------

-- Counselors: requests still waiting on them.
insert into public.notification (user_id, type, title, body, link, read_at, created_at)
select
  c.user_id, 'appointment', 'New appointment request',
  trim(s.first_name || ' ' || s.last_name) || ' requested '
    || to_char(a.scheduled_at at time zone public.app_timezone(), 'FMMon FMDD, YYYY "at" FMHH12:MI AM') || '.',
  '/counselor',
  case when a.created_at < now() - interval '3 days' then a.created_at + interval '1 hour' end,
  a.created_at
from public.appointment a
join public.student s on s.id = a.student_id
join public.counselor c on c.id = a.counselor_id
where a.status = 'pending'
  and a.created_at > now() - interval '14 days'
  and c.user_id is not null;

-- Students: decisions on their requests.
insert into public.notification (user_id, type, title, body, link, read_at, created_at)
select
  s.user_id, 'appointment',
  case a.status
    when 'approved'  then 'Appointment approved'
    when 'rejected'  then 'Appointment declined'
    when 'completed' then 'Appointment completed'
    else 'Appointment cancelled'
  end,
  case a.status
    when 'approved'  then 'Your appointment on '
    when 'rejected'  then 'Your request for '
    when 'completed' then 'Your session on '
    else 'Your appointment on '
  end
    || to_char(a.scheduled_at at time zone public.app_timezone(), 'FMMon FMDD, YYYY "at" FMHH12:MI AM')
    || case a.status
         when 'approved'  then ' is confirmed.'
         when 'rejected'  then ' was declined. You can book another time.'
         when 'completed' then ' has been marked complete.'
         else ' was cancelled.'
       end,
  case a.status when 'rejected' then '/student/appointment' else '/student' end,
  case when a.created_at < now() - interval '4 days' then a.created_at + interval '1 day' end,
  a.created_at + interval '6 hours'
from public.appointment a
join public.student s on s.id = a.student_id
where a.status <> 'pending'
  and a.created_at > now() - interval '14 days'
  and s.user_id is not null;

-- Everyone: one announcement broadcast from last week.
insert into public.notification (user_id, type, title, body, link, created_at)
select ur.user_id, 'announcement', 'Mental Health Awareness Week',
       'Talks, workshops and drop-in sessions are open to every student this week.',
       '/portal#announcements', now() - interval '5 days'
from public.user_roles ur;

-- ---------------------------------------------------------------------------
-- Analytics: 180 days with a weekday rhythm
-- ---------------------------------------------------------------------------

insert into public.analytics_daily_visitor (date, number_of_visitors)
select
  d::date,
  35 + case when extract(isodow from d) in (6, 7) then 0 else 55 end
     + (extract(doy from d)::int * 37) % 40
from generate_series(public.app_today() - 179, public.app_today(), interval '1 day') as d
on conflict (date) do nothing;

insert into public.analytics_daily_login (date, number_of_logins)
select
  d::date,
  8 + case when extract(isodow from d) in (6, 7) then 0 else 22 end
    + (extract(doy from d)::int * 23) % 15
from generate_series(public.app_today() - 179, public.app_today(), interval '1 day') as d
on conflict (date) do nothing;
