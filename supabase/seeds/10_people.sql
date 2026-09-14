-- Demo people: departments across all four colleges, eight counselors, a second
-- admin and 150 students with emergency contacts.
--
-- Everything is derived from row numbers rather than random(), so a reset always
-- produces the same accounts. Every account uses the password Password123!.
--
--   counselor2@gcs.test .. counselor8@gcs.test
--   admin2@gcs.test
--   student001@gcs.test .. student150@gcs.test

-- ---------------------------------------------------------------------------
-- Departments
-- ---------------------------------------------------------------------------

insert into public.department (id, college_id, title) values
  ('77777777-7777-7777-7777-000000000004', '22222222-2222-2222-2222-000000000001', 'Data Science'),
  ('77777777-7777-7777-7777-000000000005', '22222222-2222-2222-2222-000000000001', 'Technology Communication Management'),
  ('77777777-7777-7777-7777-000000000006', '22222222-2222-2222-2222-000000000002', 'Automotive Technology'),
  ('77777777-7777-7777-7777-000000000007', '22222222-2222-2222-2222-000000000002', 'Electrical Technology'),
  ('77777777-7777-7777-7777-000000000008', '22222222-2222-2222-2222-000000000002', 'Food Technology'),
  ('77777777-7777-7777-7777-000000000009', '22222222-2222-2222-2222-000000000003', 'Applied Mathematics'),
  ('77777777-7777-7777-7777-000000000010', '22222222-2222-2222-2222-000000000003', 'Applied Physics'),
  ('77777777-7777-7777-7777-000000000011', '22222222-2222-2222-2222-000000000003', 'Chemistry'),
  ('77777777-7777-7777-7777-000000000012', '22222222-2222-2222-2222-000000000003', 'Environmental Science'),
  ('77777777-7777-7777-7777-000000000013', '22222222-2222-2222-2222-000000000004', 'Civil Engineering'),
  ('77777777-7777-7777-7777-000000000014', '22222222-2222-2222-2222-000000000004', 'Electrical Engineering'),
  ('77777777-7777-7777-7777-000000000015', '22222222-2222-2222-2222-000000000004', 'Mechanical Engineering'),
  ('77777777-7777-7777-7777-000000000016', '22222222-2222-2222-2222-000000000004', 'Architecture')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Auth users for staff and students
-- ---------------------------------------------------------------------------

-- One bcrypt hash shared by every demo account. Hashing 160 times would add most of
-- a minute to every reset for no benefit.
create temporary table seed_password as
select extensions.crypt('Password123!', extensions.gen_salt('bf')) as hash;

create temporary table seed_users (id uuid, email text, role public.app_role);

insert into seed_users
select ('44444444-4444-4444-4444-' || lpad((10 + n)::text, 12, '0'))::uuid,
       'counselor' || (n + 1) || '@gcs.test',
       'counselor'
from generate_series(1, 7) as n;

insert into seed_users values
  ('44444444-4444-4444-4444-000000000020', 'admin2@gcs.test', 'admin');

insert into seed_users
select ('44444444-4444-4444-4444-' || lpad((1000 + n)::text, 12, '0'))::uuid,
       'student' || lpad(n::text, 3, '0') || '@gcs.test',
       'student'
from generate_series(1, 150) as n;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000',
  u.id, 'authenticated', 'authenticated', u.email, p.hash,
  now(), now() - interval '120 days', now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
  '', '', '', ''
from seed_users u cross join seed_password p
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from seed_users u
where not exists (
  select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
);

insert into public.user_roles (user_id, role)
select id, role from seed_users
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Staff profiles
-- ---------------------------------------------------------------------------

insert into public.admin (id, user_id, username, email, first_name, last_name, phone, university_id)
values ('55555555-5555-5555-5555-000000000002', '44444444-4444-4444-4444-000000000020',
        'rbautista', 'admin2@gcs.test', 'Ramon', 'Bautista', '09181234567', 2019000002)
on conflict do nothing;

-- Varied hours and working days, so the booking calendar shows real differences
-- between counselors. day_of_week is Sunday-first.
insert into public.counselor (
  id, user_id, username, email, first_name, last_name, phone, university_id,
  is_active, day_of_week, start_time, end_time
) values
  ('66666666-6666-6666-6666-000000000002', '44444444-4444-4444-4444-000000000011',
   'jvillanueva', 'counselor2@gcs.test', 'Jose', 'Villanueva', '09172345678', 2018000011,
   true, '{false,true,true,true,true,true,false}', '09:00', '16:00'),
  ('66666666-6666-6666-6666-000000000003', '44444444-4444-4444-4444-000000000012',
   'lreyes', 'counselor3@gcs.test', 'Liza', 'Reyes', '09173456789', 2018000012,
   true, '{false,true,false,true,false,true,false}', '08:00', '12:00'),
  ('66666666-6666-6666-6666-000000000004', '44444444-4444-4444-4444-000000000013',
   'agarcia', 'counselor4@gcs.test', 'Antonio', 'Garcia', '09174567890', 2017000013,
   true, '{false,false,true,false,true,false,true}', '13:00', '17:00'),
  ('66666666-6666-6666-6666-000000000005', '44444444-4444-4444-4444-000000000014',
   'cfernandez', 'counselor5@gcs.test', 'Carmela', 'Fernandez', '09175678901', 2016000014,
   true, '{false,true,true,true,true,true,false}', '08:00', '17:00'),
  ('66666666-6666-6666-6666-000000000006', '44444444-4444-4444-4444-000000000015',
   'mtorres', 'counselor6@gcs.test', 'Miguel', 'Torres', '09176789012', 2019000015,
   true, '{false,true,true,false,true,true,false}', '10:00', '15:00'),
  ('66666666-6666-6666-6666-000000000007', '44444444-4444-4444-4444-000000000016',
   'pnavarro', 'counselor7@gcs.test', 'Patricia', 'Navarro', '09177890123', 2020000016,
   true, '{false,true,true,true,true,false,false}', '08:30', '16:30'),
  ('66666666-6666-6666-6666-000000000008', '44444444-4444-4444-4444-000000000017',
   'dlim', 'counselor8@gcs.test', 'Daniel', 'Lim', '09178901234', 2021000017,
   false, '{false,true,true,true,true,true,false}', '08:00', '17:00')
on conflict do nothing;

-- Several counselors cover more than one department, which is the case that used
-- to break counselor_with_details. counselor8 is inactive and covers nothing.
update public.department d
set counselor_id = m.counselor_id
from (values
  ('77777777-7777-7777-7777-000000000002'::uuid, '66666666-6666-6666-6666-000000000001'::uuid),
  ('77777777-7777-7777-7777-000000000004'::uuid, '66666666-6666-6666-6666-000000000002'::uuid),
  ('77777777-7777-7777-7777-000000000005'::uuid, '66666666-6666-6666-6666-000000000002'::uuid),
  ('77777777-7777-7777-7777-000000000003'::uuid, '66666666-6666-6666-6666-000000000003'::uuid),
  ('77777777-7777-7777-7777-000000000006'::uuid, '66666666-6666-6666-6666-000000000003'::uuid),
  ('77777777-7777-7777-7777-000000000007'::uuid, '66666666-6666-6666-6666-000000000003'::uuid),
  ('77777777-7777-7777-7777-000000000008'::uuid, '66666666-6666-6666-6666-000000000004'::uuid),
  ('77777777-7777-7777-7777-000000000009'::uuid, '66666666-6666-6666-6666-000000000005'::uuid),
  ('77777777-7777-7777-7777-000000000010'::uuid, '66666666-6666-6666-6666-000000000005'::uuid),
  ('77777777-7777-7777-7777-000000000011'::uuid, '66666666-6666-6666-6666-000000000006'::uuid),
  ('77777777-7777-7777-7777-000000000012'::uuid, '66666666-6666-6666-6666-000000000006'::uuid),
  ('77777777-7777-7777-7777-000000000013'::uuid, '66666666-6666-6666-6666-000000000007'::uuid),
  ('77777777-7777-7777-7777-000000000014'::uuid, '66666666-6666-6666-6666-000000000007'::uuid),
  ('77777777-7777-7777-7777-000000000015'::uuid, '66666666-6666-6666-6666-000000000004'::uuid),
  ('77777777-7777-7777-7777-000000000016'::uuid, '66666666-6666-6666-6666-000000000005'::uuid)
) as m(department_id, counselor_id)
where d.id = m.department_id
  and d.counselor_id is null;

-- ---------------------------------------------------------------------------
-- Students
-- ---------------------------------------------------------------------------

insert into public.student (
  id, user_id, username, email, first_name, middle_name, last_name,
  phone, gender, age, university_id, year_level, department_id,
  emotional_status_id, last_active_at
)
select
  ('88888888-8888-8888-8888-' || lpad((1000 + n)::text, 12, '0'))::uuid,
  ('44444444-4444-4444-4444-' || lpad((1000 + n)::text, 12, '0'))::uuid,
  lower(first_names[1 + (n * 7) % array_length(first_names, 1)])
    || lower(replace(last_names[1 + (n * 11) % array_length(last_names, 1)], ' ', ''))
    || n,
  'student' || lpad(n::text, 3, '0') || '@gcs.test',
  first_names[1 + (n * 7) % array_length(first_names, 1)],
  case when n % 3 = 0 then null else last_names[1 + (n * 5) % array_length(last_names, 1)] end,
  last_names[1 + (n * 11) % array_length(last_names, 1)],
  '09' || lpad(((n * 7919) % 1000000000)::text, 9, '0'),
  case when n % 2 = 0 then 'female' else 'male' end,
  17 + (n % 7),
  2020000000 + n * 37,
  1 + (n % 4),
  ('77777777-7777-7777-7777-' || lpad((1 + (n % 16))::text, 12, '0'))::uuid,
  ('11111111-1111-1111-1111-' || lpad((1 + (n % 8))::text, 12, '0'))::uuid,
  now() - make_interval(hours => (n * 13) % 720)
from generate_series(1, 150) as n,
lateral (select
  array['Andrea','Bea','Carlo','Diego','Elena','Francis','Gabriel','Hannah','Isabel',
        'Joshua','Katrina','Leo','Mika','Nathan','Olivia','Paolo','Quinn','Rafael',
        'Sofia','Tristan','Ursula','Vince','Wendy','Xavier','Yasmin','Zander',
        'Angelo','Bianca','Cyrus','Danica','Enzo','Faith','Gian','Hazel','Ivan','Jasmine'] as first_names,
  array['Santos','Reyes','Cruz','Bautista','Ocampo','Garcia','Mendoza','Torres',
        'Tomas','Andrada','Castillo','Flores','Villanueva','Ramos','Aquino','Navarro',
        'Salazar','Mercado','Aguilar','Pascual','Dela Cruz','De Leon','Gonzales','Lim',
        'Tan','Sy','Rivera','Domingo','Manalo','Soriano'] as last_names
) as names
on conflict do nothing;

insert into public.contact_person (student_id, first_name, middle_name, last_name, phone)
select
  s.id,
  (array['Rosa','Pedro','Maricel','Roberto','Luz','Ernesto','Teresa','Manuel'])[1 + (k * 3 + n) % 8],
  null,
  s.last_name,
  '09' || lpad(((n * 104729 + k * 7) % 1000000000)::text, 9, '0')
from generate_series(1, 150) as n
join public.student s
  on s.id = ('88888888-8888-8888-8888-' || lpad((1000 + n)::text, 12, '0'))::uuid
cross join lateral generate_series(1, 1 + (n % 2)) as k
where not exists (select 1 from public.contact_person c where c.student_id = s.id);

drop table seed_users;
drop table seed_password;
