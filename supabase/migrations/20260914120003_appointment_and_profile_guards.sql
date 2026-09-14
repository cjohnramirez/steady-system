-- Column-level rules that row-level security cannot express.
--
-- An RLS update policy can say who may touch a row, but not which columns they may
-- change or what a column may change to. appointment_update_scoped only checked
-- ownership, so a student could set their own appointment to 'approved', and a
-- counselor could move an appointment onto a different student. The same gap let a
-- student clear their own is_disabled flag or move themselves into another
-- department.
--
-- Each guard lets through the service role and postgres (auth.uid() is null for
-- both) and admins, then enforces the rules for everyone else.

-- ---------------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------------

create or replace function public.guard_appointment_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.app_role := public.current_app_role();
begin
  if auth.uid() is null or v_role = 'admin' then
    return new;
  end if;

  if new.student_id is distinct from old.student_id
     or new.counselor_id is distinct from old.counselor_id then
    raise exception 'Only an administrator can reassign an appointment'
      using errcode = 'insufficient_privilege';
  end if;

  if v_role = 'student' then
    if new.scheduled_at is distinct from old.scheduled_at
       or new.reason is distinct from old.reason
       or new.notes is distinct from old.notes then
      raise exception 'Students cannot edit an appointment, only cancel it'
        using errcode = 'insufficient_privilege';
    end if;

    if new.status is distinct from old.status
       and not (old.status in ('pending', 'approved') and new.status = 'cancelled') then
      raise exception 'Students can only cancel a pending or approved appointment'
        using errcode = 'insufficient_privilege';
    end if;

    return new;
  end if;

  if v_role = 'counselor' then
    if new.reason is distinct from old.reason then
      raise exception 'The reason for an appointment belongs to the student'
        using errcode = 'insufficient_privilege';
    end if;

    if new.status is distinct from old.status and not (
      (old.status = 'pending'  and new.status in ('approved', 'rejected'))
      or (old.status = 'approved' and new.status in ('completed', 'cancelled'))
    ) then
      raise exception 'An appointment cannot move from % to %', old.status, new.status
        using errcode = 'check_violation';
    end if;

    if new.scheduled_at is distinct from old.scheduled_at
       and old.status not in ('pending', 'approved') then
      raise exception 'Only upcoming appointments can be rescheduled'
        using errcode = 'check_violation';
    end if;

    return new;
  end if;

  raise exception 'Not allowed' using errcode = 'insufficient_privilege';
end;
$$;

drop trigger if exists appointment_guard_update on public.appointment;
create trigger appointment_guard_update
  before update on public.appointment
  for each row execute function public.guard_appointment_update();

-- A student could previously book any counselor at all by id. Bookings must go to a
-- counselor assigned to the student's own department.
drop policy if exists appointment_insert_own on public.appointment;
create policy appointment_insert_own on public.appointment
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      student_id = public.current_student_id()
      and status = 'pending'
      and counselor_id in (
        select d.counselor_id
        from public.department d
        join public.student s on s.department_id = d.id
        where s.id = public.current_student_id()
      )
    )
  );

-- Appointments are history. Students cancel and counselors reject by changing the
-- status; only an admin removes a row. The old policy let the counselor's Reject
-- button "succeed" while deleting nothing.
drop policy if exists appointment_delete_scoped on public.appointment;
create policy appointment_delete_admin on public.appointment
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create or replace function public.guard_student_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
     or new.email is distinct from old.email
     or new.university_id is distinct from old.university_id
     or new.department_id is distinct from old.department_id
     or new.is_disabled is distinct from old.is_disabled then
    raise exception 'Only an administrator can change that field'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

drop trigger if exists student_guard_update on public.student;
create trigger student_guard_update
  before update on public.student
  for each row execute function public.guard_student_update();

-- Counselors manage their own hours and active flag, but not who they are.
create or replace function public.guard_staff_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
     or new.email is distinct from old.email
     or new.university_id is distinct from old.university_id then
    raise exception 'Only an administrator can change that field'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

drop trigger if exists counselor_guard_update on public.counselor;
create trigger counselor_guard_update
  before update on public.counselor
  for each row execute function public.guard_staff_update();
