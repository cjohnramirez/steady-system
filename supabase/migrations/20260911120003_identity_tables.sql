-- The three profile tables, one per role, each linked to an auth user.
--
-- user_id is nullable so a profile row can be seeded or imported before its auth
-- user exists, which is how the admin account-creation flow works.

create table public.admin (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references auth.users (id) on delete set null,
  username      text not null unique,
  email         text not null,
  first_name    text not null,
  last_name     text not null default '',
  phone         text not null default '',
  avatar        text not null default '',
  university_id bigint not null default 0,
  is_active     boolean not null default true
);

create table public.counselor (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references auth.users (id) on delete set null,
  username      text not null unique,
  email         text not null,
  first_name    text not null,
  last_name     text not null default '',
  phone         text not null,
  avatar        text not null default '',
  university_id bigint not null,
  is_active     boolean default true,
  -- Sunday-first, one flag per weekday. Phase 7 replaces this with per-day rows;
  -- it is kept here so the existing availability UI keeps working.
  day_of_week   boolean[] not null default '{false,true,true,true,true,true,false}',
  start_time    time not null default '08:00',
  end_time      time not null default '17:00',
  constraint counselor_day_of_week_length check (array_length(day_of_week, 1) = 7),
  constraint counselor_hours_ordered check (start_time < end_time)
);

-- A department belongs to a college and is assigned at most one counselor. That
-- assignment is what decides which counselors a student may book.
create table public.department (
  id           uuid primary key default gen_random_uuid(),
  college_id   uuid not null references public.college (id) on delete restrict,
  counselor_id uuid references public.counselor (id) on delete set null,
  title        text not null
);

create index department_college_id_idx on public.department (college_id);
create index department_counselor_id_idx on public.department (counselor_id);

create table public.student (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid unique references auth.users (id) on delete set null,
  username            text not null unique,
  email               text not null,
  first_name          text not null,
  middle_name         text,
  last_name           text not null default '',
  phone               text,
  gender              text,
  age                 integer,
  avatar              text not null default '',
  university_id       bigint not null,
  year_level          integer not null,
  department_id       uuid not null references public.department (id) on delete restrict,
  emotional_status_id uuid references public.emotional_status (id) on delete set null,
  is_disabled         boolean not null default false,
  last_active_at      timestamptz not null default now(),
  constraint student_year_level_range check (year_level between 1 and 6),
  constraint student_age_range check (age is null or age between 10 and 120)
);

create index student_department_id_idx on public.student (department_id);
create index student_emotional_status_id_idx on public.student (emotional_status_id);

-- Emergency contacts captured during registration.
create table public.contact_person (
  id          bigint generated always as identity primary key,
  student_id  uuid not null references public.student (id) on delete cascade,
  first_name  text not null,
  middle_name text,
  last_name   text not null,
  phone       bigint not null
);

create index contact_person_student_id_idx on public.contact_person (student_id);
