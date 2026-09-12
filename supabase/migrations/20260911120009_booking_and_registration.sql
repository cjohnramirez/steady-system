-- Two operations the application was doing unsafely in TypeScript.
--
-- get_available_slots replaces the client-side slot generator, which offered every
-- slot in the counselor's window whether or not it was already taken.
--
-- register_student replaces the four separate writes the signup action performed,
-- which left an orphaned auth user behind whenever a later write failed.

-- The office runs on one wall clock. Every slot calculation resolves through here
-- so that local time is decided in exactly one place.
create or replace function public.app_timezone()
returns text
language sql
immutable
as $$
  select 'Asia/Manila';
$$;

create or replace function public.slot_duration()
returns interval
language sql
immutable
as $$
  select interval '30 minutes';
$$;

-- Bookable instants for one counselor on one local calendar day.
--
-- Excludes days the counselor does not work, slots already held by a pending or
-- approved appointment, and anything in the past.
create or replace function public.get_available_slots(
  p_counselor_id uuid,
  p_day date
)
returns setof timestamptz
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  tz           text := public.app_timezone();
  v_start      time;
  v_end        time;
  v_days       boolean[];
  v_day_index  int;
  day_start    timestamptz;
  day_end      timestamptz;
begin
  select c.start_time, c.end_time, c.day_of_week
    into v_start, v_end, v_days
  from public.counselor c
  where c.id = p_counselor_id
    and coalesce(c.is_active, true);

  if not found then
    return;
  end if;

  -- Postgres dow is 0 for Sunday, matching the Sunday-first day_of_week array.
  v_day_index := extract(dow from p_day)::int;

  if v_days is null or array_length(v_days, 1) < 7 or not v_days[v_day_index + 1] then
    return;
  end if;

  day_start := (p_day + v_start) at time zone tz;
  day_end   := (p_day + v_end) at time zone tz;

  return query
  select s.slot
  from generate_series(day_start, day_end - public.slot_duration(), public.slot_duration()) as s(slot)
  where s.slot > now()
    and not exists (
      select 1
      from public.appointment a
      where a.counselor_id = p_counselor_id
        and a.scheduled_at = s.slot
        and a.status in ('pending', 'approved')
    );
end;
$$;

grant execute on function public.get_available_slots to authenticated;

-- Rejects a booking that lands outside the counselor's published availability or on
-- a slot that is already taken. The unique index catches the race; this catches the
-- ordinary case with a message a person can read.
create or replace function public.assert_slot_bookable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status not in ('pending', 'approved') then
    return new;
  end if;

  if new.counselor_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.get_available_slots(
      new.counselor_id,
      (new.scheduled_at at time zone public.app_timezone())::date
    ) as slot
    where slot = new.scheduled_at
  ) then
    -- An update that leaves the time untouched is always allowed, so a counselor can
    -- approve or complete an appointment whose slot has since moved into the past.
    if tg_op = 'UPDATE' and new.scheduled_at = old.scheduled_at then
      return new;
    end if;

    raise exception 'That time slot is not available'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger appointment_assert_slot_bookable
  before insert or update of scheduled_at, counselor_id, status on public.appointment
  for each row execute function public.assert_slot_bookable();

-- Creates the student profile, emergency contacts and role assignment for the
-- caller in a single transaction. Called straight after auth signup, by the new
-- user, so it derives the auth id from the session rather than trusting the payload.
create or replace function public.register_student(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid := auth.uid();
  v_student_id uuid;
  v_contact    jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = 'insufficient_privilege';
  end if;

  if exists (select 1 from public.student where user_id = v_user_id) then
    raise exception 'This account already has a student profile'
      using errcode = 'unique_violation';
  end if;

  insert into public.user_roles (user_id, role)
  values (v_user_id, 'student')
  on conflict (user_id) do nothing;

  insert into public.student (
    user_id, username, email, first_name, middle_name, last_name,
    phone, gender, age, university_id, year_level,
    department_id, emotional_status_id
  )
  values (
    v_user_id,
    payload ->> 'username',
    payload ->> 'email',
    payload ->> 'first_name',
    nullif(payload ->> 'middle_name', ''),
    coalesce(payload ->> 'last_name', ''),
    nullif(payload ->> 'phone', ''),
    nullif(payload ->> 'gender', ''),
    nullif(payload ->> 'age', '')::int,
    (payload ->> 'university_id')::bigint,
    (payload ->> 'year_level')::int,
    (payload ->> 'department_id')::uuid,
    nullif(payload ->> 'emotional_status_id', '')::uuid
  )
  returning id into v_student_id;

  for v_contact in
    select * from jsonb_array_elements(coalesce(payload -> 'contact_person', '[]'::jsonb))
  loop
    insert into public.contact_person (student_id, first_name, middle_name, last_name, phone)
    values (
      v_student_id,
      v_contact ->> 'first_name',
      nullif(v_contact ->> 'middle_name', ''),
      v_contact ->> 'last_name',
      (v_contact ->> 'phone')::bigint
    );
  end loop;

  return v_student_id;
end;
$$;

grant execute on function public.register_student to authenticated;
