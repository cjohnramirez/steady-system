-- Denormalised read models. The application reads these from the browser, so every
-- one of them is created with security_invoker so that row-level security on the
-- underlying tables still applies to the caller.
--
-- Without security_invoker a view runs as its owner, which would let any signed-in
-- student read every other student's row straight through student_with_details.
--
-- Column lists here are deliberately identical to what src/types/supabase.ts
-- already describes, so the checked-in generated types stay accurate.

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
  c.university_id,
  c.is_active,
  c.day_of_week,
  c.start_time,
  c.end_time,
  d.id    as department_id,
  d.title as department
from public.counselor c
left join public.department d on d.counselor_id = c.id;

create view public.student_with_details
with (security_invoker = on) as
select
  s.id,
  s.user_id,
  s.username,
  s.email,
  s.first_name,
  s.middle_name,
  s.last_name,
  s.phone,
  s.gender,
  s.age,
  s.university_id,
  s.year_level,
  s.department_id,
  d.title  as department,
  col.id   as college_id,
  col.full_name as college_name,
  s.emotional_status_id,
  es.name  as emotional_status,
  d.counselor_id,
  c.first_name as counselor_first_name,
  c.last_name  as counselor_last_name
from public.student s
join public.department d on d.id = s.department_id
join public.college col on col.id = d.college_id
left join public.emotional_status es on es.id = s.emotional_status_id
left join public.counselor c on c.id = d.counselor_id;

create view public.appointment_with_details
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
  c.last_name  as last_counselor_name
from public.appointment a
left join public.student s on s.id = a.student_id
left join public.counselor c on c.id = a.counselor_id;

create view public.playlist_with_details
with (security_invoker = on) as
select
  p.id,
  p.title,
  p.link,
  p.creator,
  p.image,
  p.emotional_status_id,
  es.name as emotional_status_name
from public.playlist p
left join public.emotional_status es on es.id = p.emotional_status_id;
