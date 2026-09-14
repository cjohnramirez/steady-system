-- Student registration inside the auth transaction.
--
-- The signup action used to call auth.signUp and then make three more writes with
-- the service-role key. Any failure after the first left an auth user with no
-- profile: signed in, unable to use the app, and unable to register again because
-- the email was taken. register_student fixed the atomicity but was never wired up,
-- and could not have worked with email confirmation on, because an unconfirmed
-- signup has no session for auth.uid() to read.
--
-- A trigger on auth.users runs in the same transaction as the insert GoTrue makes.
-- If the profile cannot be created, the auth user is rolled back with it. It works
-- identically whether email confirmation is on or off.
--
-- The role is always 'student'. user_metadata is writable by the person signing up,
-- so nothing in it may ever decide a role. Counselors and admins are created by an
-- admin through the service key and never carry a student_profile.

drop function if exists public.register_student(jsonb);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p            jsonb := new.raw_user_meta_data -> 'student_profile';
  v_student_id uuid;
begin
  if p is null or jsonb_typeof(p) <> 'object' then
    return new;
  end if;

  insert into public.user_roles (user_id, role)
  values (new.id, 'student');

  insert into public.student (
    user_id, username, email, first_name, middle_name, last_name,
    phone, gender, age, university_id, year_level,
    department_id, emotional_status_id
  )
  values (
    new.id,
    p ->> 'username',
    new.email,
    p ->> 'first_name',
    nullif(p ->> 'middle_name', ''),
    coalesce(p ->> 'last_name', ''),
    nullif(p ->> 'phone', ''),
    nullif(p ->> 'gender', ''),
    nullif(p ->> 'age', '')::int,
    (p ->> 'university_id')::bigint,
    (p ->> 'year_level')::int,
    (p ->> 'department_id')::uuid,
    nullif(p ->> 'emotional_status_id', '')::uuid
  )
  returning id into v_student_id;

  insert into public.contact_person (student_id, first_name, middle_name, last_name, phone)
  select
    v_student_id,
    c ->> 'first_name',
    nullif(c ->> 'middle_name', ''),
    c ->> 'last_name',
    c ->> 'phone'
  from jsonb_array_elements(coalesce(p -> 'contact_person', '[]'::jsonb)) as c;

  -- The profile now lives in its own tables. Leaving it in user_metadata would copy
  -- emergency contacts into every access token and session cookie.
  update auth.users
  set raw_user_meta_data = raw_user_meta_data - 'student_profile'
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the signup form tell someone their username is taken before GoTrue turns the
-- unique violation into "Database error saving new user".
create or replace function public.is_username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (select 1 from public.student where lower(username) = lower(p_username))
     and not exists (select 1 from public.counselor where lower(username) = lower(p_username))
     and not exists (select 1 from public.admin where lower(username) = lower(p_username));
$$;

-- Registration no longer inserts student rows from the client, so nobody but an
-- admin needs to.
drop policy if exists student_insert_self on public.student;
create policy student_insert_admin on public.student
  for insert to authenticated with check (public.is_admin());
