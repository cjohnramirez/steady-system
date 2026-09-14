-- Security checks for the live database. Run with: node scripts/db/verify.mjs
--
-- Each check runs its statement as a seeded account (`set local role` plus JWT
-- claims, the way PostgREST does it) inside a subtransaction that is always rolled
-- back, so nothing is changed. The final select returns one row per check.

create temporary table verify_results (name text, passed boolean, detail text) on commit drop;

create or replace function pg_temp.run_check(
  p_name text,
  p_who text,          -- 'anon', 'admin', 'counselor', 'student', 'student2'
  p_sql text,
  p_expect text        -- 'refused' (error or 0 rows) or 'allowed' (no error, >= 1 row)
) returns void language plpgsql as $$
declare
  v_users jsonb := '{"admin":"44444444-4444-4444-4444-000000000001","counselor":"44444444-4444-4444-4444-000000000002","student":"44444444-4444-4444-4444-000000000003","student2":"44444444-4444-4444-4444-000000000004"}';
  v_roles jsonb := '{"admin":"admin","counselor":"counselor","student":"student","student2":"student"}';
  v_rows bigint := 0;
  v_error text;
begin
  begin
    if p_who = 'anon' then
      perform set_config('request.jwt.claims', '{"role":"anon"}', true);
      execute 'set local role anon';
    else
      perform set_config('request.jwt.claims', jsonb_build_object(
        'sub', v_users ->> p_who, 'role', 'authenticated', 'user_role', v_roles ->> p_who)::text, true);
      execute 'set local role authenticated';
    end if;

    execute p_sql;
    get diagnostics v_rows = row_count;
    raise exception 'rollback-check' using errcode = 'P0100';
  exception
    when sqlstate 'P0100' then v_error := null;
    when others then v_error := sqlerrm;
  end;

  insert into verify_results values (
    p_name,
    case p_expect
      when 'refused' then v_error is not null or v_rows = 0
      else v_error is null and v_rows >= 1
    end,
    coalesce(v_error, v_rows || ' rows')
  );
end;
$$;

select pg_temp.run_check('student cannot approve their own appointment', 'student',
  $q$update appointment set status = 'approved' where id = (select id from appointment where student_id = public.current_student_id() and status = 'pending' limit 1)$q$, 'refused');

select pg_temp.run_check('student can cancel their own pending appointment', 'student',
  $q$update appointment set status = 'cancelled' where id = (select id from appointment where student_id = public.current_student_id() and status = 'pending' limit 1)$q$, 'allowed');

select pg_temp.run_check('counselor cannot move an appointment to another student', 'counselor',
  $q$update appointment set student_id = '88888888-8888-8888-8888-000000000002' where id = (select id from appointment where counselor_id = public.current_counselor_id() and student_id <> '88888888-8888-8888-8888-000000000002' limit 1)$q$, 'refused');

select pg_temp.run_check('counselor can approve a pending request', 'counselor',
  $q$update appointment set status = 'approved' where id = (select id from appointment where counselor_id = public.current_counselor_id() and status = 'pending' limit 1)$q$, 'allowed');

select pg_temp.run_check('counselor cannot jump a pending request straight to completed', 'counselor',
  $q$update appointment set status = 'completed' where id = (select id from appointment where counselor_id = public.current_counselor_id() and status = 'pending' limit 1)$q$, 'refused');

select pg_temp.run_check('counselor cannot delete appointments', 'counselor',
  $q$delete from appointment where counselor_id = public.current_counselor_id()$q$, 'refused');

-- Slot values are chosen here as the owner, because the impersonated student
-- cannot see other people's appointments to pick one themselves.
select pg_temp.run_check('a slot already held cannot be booked by another student', 'student2',
  format('insert into appointment (student_id, counselor_id, scheduled_at) values (public.current_student_id(), %L, %L)',
    a.counselor_id, a.scheduled_at), 'refused')
from (select counselor_id, scheduled_at from appointment
      where counselor_id = '66666666-6666-6666-6666-000000000001' and status in ('pending','approved') and scheduled_at > now()
      order by scheduled_at limit 1) a;

select pg_temp.run_check('student cannot book a free slot with a counselor outside their department', 'student',
  format('insert into appointment (student_id, counselor_id, scheduled_at) values (public.current_student_id(), %L, %L)',
    '66666666-6666-6666-6666-000000000007', slot), 'refused')
from (select slot from generate_series(1, 14) d,
      lateral get_available_slots('66666666-6666-6666-6666-000000000007', current_date + d) slot limit 1) s;

select pg_temp.run_check('student cannot set their own is_disabled flag', 'student',
  $q$update student set is_disabled = true where user_id = auth.uid()$q$, 'refused');

select pg_temp.run_check('student cannot move themselves to another department', 'student',
  $q$update student set department_id = '77777777-7777-7777-7777-000000000013' where user_id = auth.uid()$q$, 'refused');

select pg_temp.run_check('student can edit their own phone', 'student',
  $q$update student set phone = '09170000000' where user_id = auth.uid()$q$, 'allowed');

select pg_temp.run_check('student sees only their own student row', 'student',
  $q$select 1 from (select count(*) n from student) s where n = 1$q$, 'allowed');

select pg_temp.run_check('student cannot grant themselves admin', 'student',
  $q$update user_roles set role = 'admin' where user_id = auth.uid()$q$, 'refused');

select pg_temp.run_check('users cannot insert notifications directly', 'student',
  $q$insert into notification (user_id, title) values (auth.uid(), 'spoof')$q$, 'refused');

select pg_temp.run_check('users cannot rewrite a notification''s text', 'student',
  $q$update notification set title = 'changed' where user_id = auth.uid()$q$, 'refused');

select pg_temp.run_check('users can mark their own notifications read', 'student',
  $q$update notification set read_at = now() where user_id = auth.uid()$q$, 'allowed');

select pg_temp.run_check('users cannot read other people''s notifications', 'student',
  $q$select 1 from notification where user_id <> auth.uid()$q$, 'refused');

select pg_temp.run_check('non-admins cannot broadcast', 'student',
  $q$select notify_role('student', 'hi')$q$, 'refused');

-- Runs as the owner: the counselor cannot read the student's notifications.
do $$
declare v_before int; v_after int; v_student uuid;
begin
  select s.user_id into v_student from appointment a join student s on s.id = a.student_id
  where a.counselor_id = '66666666-6666-6666-6666-000000000001' and a.status = 'pending' limit 1;
  begin
    select count(*) into v_before from notification where user_id = v_student;
    update appointment set status = 'approved'
    where id = (select a.id from appointment a join student s on s.id = a.student_id
                where s.user_id = v_student and a.status = 'pending' limit 1);
    select count(*) into v_after from notification where user_id = v_student and title = 'Appointment approved'
      and created_at >= now();
    raise exception 'rollback-check' using errcode = 'P0100';
  exception when sqlstate 'P0100' then null;
  end;
  insert into verify_results values ('approving an appointment notifies the student', coalesce(v_after, 0) >= 1, coalesce(v_after, 0) || ' new notification(s)');
end;
$$;

-- Appointment changes notify everyone involved except whoever made the change.
-- Each block acts as a seeded user through JWT claims; the claims and every write
-- roll back with the subtransaction.
do $$
declare
  v_appt uuid; v_student uuid; v_counselor uuid;
  v_s int; v_c int; v_detail text;
begin
  begin
    select a.id, s.user_id, c.user_id into v_appt, v_student, v_counselor
    from appointment a
    join student s on s.id = a.student_id
    join counselor c on c.id = a.counselor_id
    where a.status in ('pending', 'approved') and a.scheduled_at > now()
    limit 1;

    perform set_config('request.jwt.claims', jsonb_build_object(
      'sub', '44444444-4444-4444-4444-000000000001', 'role', 'authenticated')::text, true);
    update appointment set status = 'cancelled' where id = v_appt;

    select count(*) filter (where user_id = v_student), count(*) filter (where user_id = v_counselor)
      into v_s, v_c
    from notification
    where title = 'Appointment cancelled' and created_at >= now();
    raise exception 'rollback-check' using errcode = 'P0100';
  exception
    when sqlstate 'P0100' then v_detail := format('student %s, counselor %s', v_s, v_c);
    when others then v_detail := sqlerrm;
  end;
  insert into verify_results values
    ('an admin cancelling notifies the student and the counselor', v_s = 1 and v_c = 1, v_detail);
end;
$$;

do $$
declare
  v_appt uuid; v_counselor uuid;
  v_s int; v_c int; v_detail text;
begin
  begin
    select a.id, c.user_id into v_appt, v_counselor
    from appointment a
    join student s on s.id = a.student_id
    join counselor c on c.id = a.counselor_id
    where s.user_id = '44444444-4444-4444-4444-000000000003'
      and a.status in ('pending', 'approved') and a.scheduled_at > now()
    limit 1;

    perform set_config('request.jwt.claims', jsonb_build_object(
      'sub', '44444444-4444-4444-4444-000000000003', 'role', 'authenticated')::text, true);
    update appointment set status = 'cancelled' where id = v_appt;

    select count(*) filter (where user_id = '44444444-4444-4444-4444-000000000003'),
           count(*) filter (where user_id = v_counselor)
      into v_s, v_c
    from notification
    where title = 'Appointment cancelled' and created_at >= now();
    raise exception 'rollback-check' using errcode = 'P0100';
  exception
    when sqlstate 'P0100' then v_detail := format('student %s, counselor %s', v_s, v_c);
    when others then v_detail := sqlerrm;
  end;
  insert into verify_results values
    ('a student cancelling notifies only the counselor', v_s = 0 and v_c = 1, v_detail);
end;
$$;

do $$
declare
  v_appt uuid; v_counselor_id uuid; v_student uuid; v_slot timestamptz;
  v_moved int; v_total int; v_detail text;
begin
  begin
    select a.id, a.counselor_id, s.user_id into v_appt, v_counselor_id, v_student
    from appointment a join student s on s.id = a.student_id
    where a.status = 'pending' and a.scheduled_at > now()
    limit 1;

    select slot into v_slot
    from generate_series(1, 21) as d,
         lateral get_available_slots(v_counselor_id, current_date + d) as slot
    where slot > now()
    limit 1;
    if v_slot is null then
      raise exception 'no free slot to move the appointment to';
    end if;

    perform set_config('request.jwt.claims', jsonb_build_object(
      'sub', '44444444-4444-4444-4444-000000000001', 'role', 'authenticated')::text, true);
    update appointment set status = 'approved', scheduled_at = v_slot where id = v_appt;

    select count(*) filter (where title = 'Appointment moved and confirmed'), count(*)
      into v_moved, v_total
    from notification
    where user_id = v_student and created_at >= now();
    raise exception 'rollback-check' using errcode = 'P0100';
  exception
    when sqlstate 'P0100' then v_detail := format('%s combined of %s for the student', v_moved, v_total);
    when others then v_detail := sqlerrm;
  end;
  insert into verify_results values
    ('confirming at a new time sends one combined message', v_moved = 1 and v_total = 1, v_detail);
end;
$$;

select pg_temp.run_check('signed-out visitors cannot bump the login counter', 'anon',
  $q$select increment_daily_login()$q$, 'refused');

select pg_temp.run_check('signed-out visitors cannot read counselor schedules', 'anon',
  $q$select * from get_available_slots('66666666-6666-6666-6666-000000000001', current_date + 1)$q$, 'refused');

select pg_temp.run_check('counselor_with_details has one row per counselor', 'admin',
  $q$select 1 from (select count(*) r, count(distinct id) i from counselor_with_details) s where r = i$q$, 'allowed');

select pg_temp.run_check('non-admins cannot read dashboard stats', 'student',
  $q$select admin_dashboard_stats()$q$, 'refused');

select pg_temp.run_check('admins can read dashboard stats', 'admin',
  $q$select admin_dashboard_stats()$q$, 'allowed');

-- Signup: the trigger creates the profile, ignores any role in the metadata, and a
-- failure rolls the auth user back.
do $$
declare
  v_id uuid := gen_random_uuid();
  v_ok boolean;
begin
  begin
    insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_id || '@verify.test',
      jsonb_build_object('role', 'admin', 'student_profile', jsonb_build_object(
        'username', 'verify_' || left(v_id::text, 8), 'first_name', 'Verify', 'last_name', 'User',
        'university_id', 2029000001, 'year_level', 1, 'age', 18, 'gender', 'female',
        'department_id', '77777777-7777-7777-7777-000000000001',
        'contact_person', jsonb_build_array(jsonb_build_object('first_name','A','last_name','B','phone','09171234567')))),
      now(), now());

    select (select role from user_roles where user_id = v_id) = 'student'
       and (select count(*) from student where user_id = v_id) = 1
       and (select count(*) from contact_person c join student s on s.id = c.student_id where s.user_id = v_id) = 1
       and not (select raw_user_meta_data ? 'student_profile' from auth.users where id = v_id)
      into v_ok;

    raise exception 'rollback-check' using errcode = 'P0100';
  exception
    when sqlstate 'P0100' then null;
    when others then v_ok := false;
  end;
  -- Recorded after the rollback, or the result row would be rolled back too.
  insert into verify_results values
    ('signup creates a student and contacts, never another role', coalesce(v_ok, false), 'trigger ran');

  begin
    insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'dupe@verify.test',
      jsonb_build_object('student_profile', jsonb_build_object('username', 'jdelacruz', 'first_name', 'X',
        'university_id', 2029000002, 'year_level', 1, 'department_id', '77777777-7777-7777-7777-000000000001')),
      now(), now());
    insert into verify_results values ('a failed profile rolls back the auth user', false, 'insert succeeded');
    raise exception 'rollback-check' using errcode = 'P0100';
  exception
    when sqlstate 'P0100' then null;
    when others then
      insert into verify_results values ('a failed profile rolls back the auth user', true, sqlerrm);
  end;
end;
$$;

select name, passed, detail from verify_results;
