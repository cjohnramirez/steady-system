-- Development seed data.
--
-- Applied automatically by `supabase db reset`. Gives a fresh clone something to log
-- in with, which the project has never had. Every account below uses the password
-- Password123! and none of them should ever exist in a deployed environment.
--
--   admin@gcs.test      admin
--   counselor@gcs.test  counselor, assigned to Computer Science
--   student@gcs.test    student in Computer Science
--   student2@gcs.test   student in Computer Science, for double-booking checks

-- ---------------------------------------------------------------------------
-- Role permissions
-- ---------------------------------------------------------------------------

-- Admins hold every permission in the enum.
insert into public.role_permissions (role, permission)
select 'admin', unnest(enum_range(null::public.app_permission))
on conflict do nothing;

insert into public.role_permissions (role, permission) values
  ('counselor', 'student.select'),
  ('counselor', 'counselor.select'),
  ('counselor', 'counselor.update'),
  ('counselor', 'appointment.select'),
  ('counselor', 'appointment.update'),
  ('counselor', 'availability.select'),
  ('counselor', 'availability.update'),
  ('counselor', 'article.select'),
  ('counselor', 'announcement.select'),
  ('counselor', 'playlist.select'),
  ('student', 'student.select'),
  ('student', 'student.update'),
  ('student', 'counselor.select'),
  ('student', 'appointment.select'),
  ('student', 'appointment.insert'),
  ('student', 'appointment.update'),
  ('student', 'appointment.delete'),
  ('student', 'article.select'),
  ('student', 'announcement.select'),
  ('student', 'playlist.select'),
  ('student', 'emotional_status.select')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

insert into public.emotional_status (id, name) values
  ('11111111-1111-1111-1111-000000000001', 'happy'),
  ('11111111-1111-1111-1111-000000000002', 'sad'),
  ('11111111-1111-1111-1111-000000000003', 'anxious'),
  ('11111111-1111-1111-1111-000000000004', 'stressed'),
  ('11111111-1111-1111-1111-000000000005', 'tired'),
  ('11111111-1111-1111-1111-000000000006', 'angry'),
  ('11111111-1111-1111-1111-000000000007', 'lonely'),
  ('11111111-1111-1111-1111-000000000008', 'motivated')
on conflict do nothing;

insert into public.college (id, abbreviation, full_name) values
  ('22222222-2222-2222-2222-000000000001', 'CITC', 'College of Information Technology and Computing'),
  ('22222222-2222-2222-2222-000000000002', 'COT',  'College of Technology'),
  ('22222222-2222-2222-2222-000000000003', 'CSM',  'College of Science and Mathematics'),
  ('22222222-2222-2222-2222-000000000004', 'CEA',  'College of Engineering and Architecture')
on conflict do nothing;

insert into public.organization (
  id, name, abbreviation, email, phone, office_location,
  day_of_week, start_office_hour, end_office_hour
) values (
  '33333333-3333-3333-3333-000000000001',
  'Guidance and Counseling Services',
  'GCS',
  'gcs@university.test',
  '+639171234567',
  'Room 1, Bldg 02, Science Complex',
  '{false,true,true,true,true,true,false}',
  '08:00',
  '17:00'
) on conflict do nothing;

insert into public.organization_contact (platform, contact_detail) values
  ('facebook', 'https://facebook.com/university.gcs'),
  ('email', 'gcs@university.test'),
  ('phone', '+63 917 123 4567')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Auth users
-- ---------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000',
  u.id,
  'authenticated',
  'authenticated',
  u.email,
  extensions.crypt('Password123!', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  '', '', '', ''
from (values
  ('44444444-4444-4444-4444-000000000001'::uuid, 'admin@gcs.test'),
  ('44444444-4444-4444-4444-000000000002'::uuid, 'counselor@gcs.test'),
  ('44444444-4444-4444-4444-000000000003'::uuid, 'student@gcs.test'),
  ('44444444-4444-4444-4444-000000000004'::uuid, 'student2@gcs.test')
) as u(id, email)
on conflict (id) do nothing;

-- Password grant will not find the user without a matching identity row.
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(), now(), now()
from auth.users u
where u.email in ('admin@gcs.test', 'counselor@gcs.test', 'student@gcs.test', 'student2@gcs.test')
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  );

insert into public.user_roles (user_id, role) values
  ('44444444-4444-4444-4444-000000000001', 'admin'),
  ('44444444-4444-4444-4444-000000000002', 'counselor'),
  ('44444444-4444-4444-4444-000000000003', 'student'),
  ('44444444-4444-4444-4444-000000000004', 'student')
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

insert into public.admin (
  id, user_id, username, email, first_name, last_name, phone, university_id
) values (
  '55555555-5555-5555-5555-000000000001',
  '44444444-4444-4444-4444-000000000001',
  'gcsadmin', 'admin@gcs.test', 'Grace', 'Mendoza', '09171234567', 2020000001
) on conflict do nothing;

insert into public.counselor (
  id, user_id, username, email, first_name, last_name, phone, university_id,
  is_active, day_of_week, start_time, end_time
) values (
  '66666666-6666-6666-6666-000000000001',
  '44444444-4444-4444-4444-000000000002',
  'mcruz', 'counselor@gcs.test', 'Maria', 'Cruz', '09179876543', 2020000002,
  true, '{false,true,true,true,true,true,false}', '08:00', '17:00'
) on conflict do nothing;

insert into public.department (id, college_id, counselor_id, title) values
  ('77777777-7777-7777-7777-000000000001',
   '22222222-2222-2222-2222-000000000001',
   '66666666-6666-6666-6666-000000000001',
   'Computer Science'),
  ('77777777-7777-7777-7777-000000000002',
   '22222222-2222-2222-2222-000000000001',
   null,
   'Information Technology'),
  ('77777777-7777-7777-7777-000000000003',
   '22222222-2222-2222-2222-000000000002',
   null,
   'Electronics Technology')
on conflict do nothing;

insert into public.student (
  id, user_id, username, email, first_name, middle_name, last_name,
  phone, gender, age, university_id, year_level, department_id, emotional_status_id
) values
  ('88888888-8888-8888-8888-000000000001',
   '44444444-4444-4444-4444-000000000003',
   'jdelacruz', 'student@gcs.test', 'Juan', 'Santos', 'Dela Cruz',
   '09171112222', 'male', 20, 2021001234, 3,
   '77777777-7777-7777-7777-000000000001',
   '11111111-1111-1111-1111-000000000005'),
  ('88888888-8888-8888-8888-000000000002',
   '44444444-4444-4444-4444-000000000004',
   'aramos', 'student2@gcs.test', 'Ana', null, 'Ramos',
   '09173334444', 'female', 19, 2021001235, 2,
   '77777777-7777-7777-7777-000000000001',
   '11111111-1111-1111-1111-000000000003')
on conflict do nothing;

insert into public.contact_person (student_id, first_name, middle_name, last_name, phone) values
  ('88888888-8888-8888-8888-000000000001', 'Rosa', null, 'Dela Cruz', '+639175556666'),
  ('88888888-8888-8888-8888-000000000002', 'Pedro', 'L', 'Ramos', '+639177778888')
on conflict do nothing;

