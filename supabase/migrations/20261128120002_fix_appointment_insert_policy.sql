-- Restore the student department-counselor guard on appointment_insert_own while
-- keeping counselor manual booking for students in their assigned departments.

drop policy if exists appointment_insert_own on public.appointment;
create policy appointment_insert_own on public.appointment
  for insert to authenticated
  with check (
    (select public.is_admin())
    or (
      student_id = (select public.current_student_id())
      and status = 'pending'
      and counselor_id in (
        select d.counselor_id
        from public.department d
        join public.student s on s.department_id = d.id
        where s.id = (select public.current_student_id())
      )
    )
    or (
      counselor_id = (select public.current_counselor_id())
      and student_id in (
        select s.id from public.student s
        where s.department_id in (select public.current_counselor_department_ids())
      )
    )
  );
