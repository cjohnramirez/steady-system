-- Row-level security.
--
-- This is the real authorization layer for the application. Most reads and writes
-- happen from the browser using the caller's own JWT, so these policies are what
-- stand between a signed-in student and everyone else's records.
--
-- Two identity helpers do the heavy lifting. Both are security definer so that a
-- policy on the student table can look up the caller's own student row without
-- recursing into the policy it is currently evaluating.

create or replace function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.student where user_id = auth.uid();
$$;

create or replace function public.current_counselor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.counselor where user_id = auth.uid();
$$;

-- Departments this counselor is assigned to. Defines the set of students they may
-- read and the appointments they may act on.
create or replace function public.current_counselor_department_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select d.id
  from public.department d
  where d.counselor_id = public.current_counselor_id();
$$;

alter table public.user_roles              enable row level security;
alter table public.role_permissions        enable row level security;
alter table public.college                 enable row level security;
alter table public.emotional_status        enable row level security;
alter table public.organization            enable row level security;
alter table public.organization_contact    enable row level security;
alter table public.admin                   enable row level security;
alter table public.counselor               enable row level security;
alter table public.department              enable row level security;
alter table public.student                 enable row level security;
alter table public.contact_person          enable row level security;
alter table public.announcement            enable row level security;
alter table public.article                 enable row level security;
alter table public.playlist                enable row level security;
alter table public.appointment             enable row level security;
alter table public.analytics_daily_visitor enable row level security;
alter table public.analytics_daily_login   enable row level security;

-- ---------------------------------------------------------------------------
-- Roles and permissions. Never writable from the client. Roles are assigned by
-- security-definer functions or by an admin holding the service key.
-- ---------------------------------------------------------------------------

create policy user_roles_select_self on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- The access token hook runs as supabase_auth_admin, which is not the table owner
-- and is therefore subject to row-level security like anyone else. Without this
-- policy the hook reads no row, every token is issued with a null user_role, and
-- middleware locks every signed-in user out of every protected route. That is
-- precisely the failure this project spent its last three commits chasing.
create policy user_roles_select_auth_admin on public.user_roles
  as permissive for select to supabase_auth_admin
  using (true);

create policy role_permissions_select_admin on public.role_permissions
  for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Reference data. Readable before sign-in because the registration form needs
-- the college and department dropdowns.
-- ---------------------------------------------------------------------------

create policy college_select_public on public.college
  for select to anon, authenticated using (true);
create policy college_write_admin on public.college
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy emotional_status_select_public on public.emotional_status
  for select to anon, authenticated using (true);
create policy emotional_status_write_admin on public.emotional_status
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy department_select_public on public.department
  for select to anon, authenticated using (true);
create policy department_write_admin on public.department
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy organization_select_public on public.organization
  for select to anon, authenticated using (true);
create policy organization_write_admin on public.organization
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy organization_contact_select_public on public.organization_contact
  for select to anon, authenticated using (true);
create policy organization_contact_write_admin on public.organization_contact
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Public content. Anyone may read. Only admins may change it.
-- ---------------------------------------------------------------------------

create policy announcement_select_public on public.announcement
  for select to anon, authenticated using (true);
create policy announcement_write_admin on public.announcement
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy article_select_public on public.article
  for select to anon, authenticated using (true);
create policy article_write_admin on public.article
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy playlist_select_public on public.playlist
  for select to anon, authenticated using (true);
create policy playlist_write_admin on public.playlist
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create policy admin_select_self_or_admin on public.admin
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy admin_update_self_or_admin on public.admin
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy admin_insert_admin on public.admin
  for insert to authenticated with check (public.is_admin());

create policy admin_delete_admin on public.admin
  for delete to authenticated using (public.is_admin());

-- A student needs to see the counselors attached to their own department in order
-- to book. Counselors see themselves. Admins see everyone.
create policy counselor_select_scoped on public.counselor
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.department d
      join public.student s on s.department_id = d.id
      where d.counselor_id = counselor.id
        and s.user_id = auth.uid()
    )
  );

create policy counselor_update_self_or_admin on public.counselor
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy counselor_insert_admin on public.counselor
  for insert to authenticated with check (public.is_admin());

create policy counselor_delete_admin on public.counselor
  for delete to authenticated using (public.is_admin());

-- A student reads their own row. A counselor reads students in the departments
-- they are assigned to. Admins read all.
create policy student_select_scoped on public.student
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or department_id in (select public.current_counselor_department_ids())
  );

create policy student_insert_self on public.student
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy student_update_self_or_admin on public.student
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy student_delete_admin on public.student
  for delete to authenticated using (public.is_admin());

-- Emergency contacts follow their student.
create policy contact_person_select_scoped on public.contact_person
  for select to authenticated
  using (
    student_id = public.current_student_id()
    or public.is_admin()
    or student_id in (
      select s.id from public.student s
      where s.department_id in (select public.current_counselor_department_ids())
    )
  );

create policy contact_person_write_own on public.contact_person
  for all to authenticated
  using (student_id = public.current_student_id() or public.is_admin())
  with check (student_id = public.current_student_id() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------------

create policy appointment_select_scoped on public.appointment
  for select to authenticated
  using (
    student_id = public.current_student_id()
    or counselor_id = public.current_counselor_id()
    or public.is_admin()
  );

-- A student may only create an appointment for themselves, and only in the pending
-- state. Promotion to approved is the counselor's decision.
create policy appointment_insert_own on public.appointment
  for insert to authenticated
  with check (
    (student_id = public.current_student_id() and status = 'pending')
    or public.is_admin()
  );

create policy appointment_update_scoped on public.appointment
  for update to authenticated
  using (
    student_id = public.current_student_id()
    or counselor_id = public.current_counselor_id()
    or public.is_admin()
  )
  with check (
    student_id = public.current_student_id()
    or counselor_id = public.current_counselor_id()
    or public.is_admin()
  );

create policy appointment_delete_scoped on public.appointment
  for delete to authenticated
  using (student_id = public.current_student_id() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Analytics. Readable by admins only, and written exclusively by the
-- security-definer increment functions, so there is no insert or update policy.
-- ---------------------------------------------------------------------------

create policy analytics_visitor_select_admin on public.analytics_daily_visitor
  for select to authenticated using (public.is_admin());

create policy analytics_login_select_admin on public.analytics_daily_login
  for select to authenticated using (public.is_admin());
