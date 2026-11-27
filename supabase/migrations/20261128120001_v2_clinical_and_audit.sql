-- Steady v2: Clinical notes (SOAP/SAP), student action plans, warm referrals,
-- counselor practice settings, RA 11036 obfuscated admin audit view, and v2
-- Realtime notification triggers.
--
-- Security & Postgres best practices enforced:
--   * RLS enabled on every new table with `to authenticated` + `(select ...)` initPlan caching.
--   * Every UPDATE policy has both USING and WITH CHECK.
--   * `clinical_note` is strictly restricted to its owning counselor (ZERO Admin/Student SELECT).
--   * `admin_appointment_audit` uses `security_invoker = on` and obfuscates student identity.
--   * Every FK / RLS predicate column is indexed.

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'urgency_level') then
    create type public.urgency_level as enum ('low', 'medium', 'high');
  end if;
  if not exists (select 1 from pg_type where typname = 'duty_status') then
    create type public.duty_status as enum ('available', 'in_session', 'writing_notes', 'off_duty');
  end if;
  if not exists (select 1 from pg_type where typname = 'note_format') then
    create type public.note_format as enum ('soap', 'sap');
  end if;
  if not exists (select 1 from pg_type where typname = 'referral_status') then
    create type public.referral_status as enum ('pending', 'accepted', 'declined', 'completed');
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Extend existing tables
-- ---------------------------------------------------------------------------

alter table public.appointment
  add column if not exists urgency          public.urgency_level not null default 'low',
  add column if not exists duration_minutes smallint not null default 45
    check (duration_minutes between 15 and 180),
  add column if not exists started_at       timestamptz,
  add column if not exists completed_at     timestamptz,
  add column if not exists created_by_role  public.app_role not null default 'student';

create index if not exists appointment_urgency_idx on public.appointment (urgency);

alter table public.counselor
  add column if not exists duty_status      public.duty_status not null default 'available',
  add column if not exists office_room      text not null default '',
  add column if not exists bio              text not null default '',
  add column if not exists buffer_minutes   smallint not null default 15
    check (buffer_minutes in (0, 5, 10, 15, 30)),
  add column if not exists lunch_start      time not null default '12:00:00',
  add column if not exists lunch_end        time not null default '13:00:00',
  add column if not exists contact_channels jsonb not null default '[]'::jsonb;

alter table public.student
  add column if not exists consent_accepted_at timestamptz;

-- Allow counselors to create manual bookings for students in their assigned departments
drop policy if exists appointment_insert_own on public.appointment;
create policy appointment_insert_own on public.appointment
  for insert to authenticated
  with check (
    (student_id = (select public.current_student_id()) and status = 'pending')
    or (
      counselor_id = (select public.current_counselor_id())
      and student_id in (
        select s.id from public.student s
        where s.department_id in (select public.current_counselor_department_ids())
      )
    )
    or (select public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- 3. Clinical Notes (SOAP / SAP) — Counselor-only confidential boundary
-- ---------------------------------------------------------------------------

create table if not exists public.clinical_note (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointment (id) on delete cascade,
  counselor_id   uuid not null references public.counselor (id) on delete cascade,
  format         public.note_format not null default 'soap',
  content        jsonb not null default '{}'::jsonb,
  locked_at      timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.clinical_note is
  'Confidential SOAP/SAP clinical notes. Strictly accessible only to the owning counselor; never readable by students or admins (RA 11036 / RA 10173).';

create index if not exists clinical_note_counselor_id_idx on public.clinical_note (counselor_id);
create index if not exists clinical_note_appointment_id_idx on public.clinical_note (appointment_id);

drop trigger if exists clinical_note_set_updated_at on public.clinical_note;
create trigger clinical_note_set_updated_at
  before update on public.clinical_note
  for each row execute function public.set_updated_at();

alter table public.clinical_note enable row level security;

drop policy if exists clinical_note_select_counselor on public.clinical_note;
create policy clinical_note_select_counselor on public.clinical_note
  for select to authenticated
  using (counselor_id = (select public.current_counselor_id()));

drop policy if exists clinical_note_insert_counselor on public.clinical_note;
create policy clinical_note_insert_counselor on public.clinical_note
  for insert to authenticated
  with check (
    counselor_id = (select public.current_counselor_id())
    and exists (
      select 1 from public.appointment a
      where a.id = appointment_id
        and a.counselor_id = (select public.current_counselor_id())
    )
  );

drop policy if exists clinical_note_update_counselor on public.clinical_note;
create policy clinical_note_update_counselor on public.clinical_note
  for update to authenticated
  using (counselor_id = (select public.current_counselor_id()) and locked_at is null)
  with check (counselor_id = (select public.current_counselor_id()));

grant select, insert, update on public.clinical_note to authenticated;
revoke all on public.clinical_note from anon;

-- ---------------------------------------------------------------------------
-- 4. Student Post-Session Action Plan (`action_item`)
-- ---------------------------------------------------------------------------

create table if not exists public.action_item (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointment (id) on delete set null,
  student_id     uuid not null references public.student (id) on delete cascade,
  counselor_id   uuid references public.counselor (id) on delete set null,
  title          text not null check (char_length(trim(title)) between 1 and 240),
  is_completed   boolean not null default false,
  due_date       date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists action_item_student_idx on public.action_item (student_id, is_completed);
create index if not exists action_item_counselor_idx on public.action_item (counselor_id);
create index if not exists action_item_appointment_idx on public.action_item (appointment_id);

drop trigger if exists action_item_set_updated_at on public.action_item;
create trigger action_item_set_updated_at
  before update on public.action_item
  for each row execute function public.set_updated_at();

alter table public.action_item enable row level security;

drop policy if exists action_item_select_scoped on public.action_item;
create policy action_item_select_scoped on public.action_item
  for select to authenticated
  using (
    student_id = (select public.current_student_id())
    or counselor_id = (select public.current_counselor_id())
  );

drop policy if exists action_item_insert_counselor on public.action_item;
create policy action_item_insert_counselor on public.action_item
  for insert to authenticated
  with check (
    counselor_id = (select public.current_counselor_id())
    and student_id in (
      select s.id from public.student s
      where s.department_id in (select public.current_counselor_department_ids())
    )
  );

drop policy if exists action_item_update_scoped on public.action_item;
create policy action_item_update_scoped on public.action_item
  for update to authenticated
  using (
    student_id = (select public.current_student_id())
    or counselor_id = (select public.current_counselor_id())
  )
  with check (
    student_id = (select public.current_student_id())
    or counselor_id = (select public.current_counselor_id())
  );

drop policy if exists action_item_delete_counselor on public.action_item;
create policy action_item_delete_counselor on public.action_item
  for delete to authenticated
  using (counselor_id = (select public.current_counselor_id()));

-- Guard: students may only toggle is_completed on their own action items.
create or replace function public.guard_action_item_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.current_app_role() = 'student' then
    if new.title is distinct from old.title
       or new.due_date is distinct from old.due_date
       or new.student_id is distinct from old.student_id
       or new.counselor_id is distinct from old.counselor_id
       or new.appointment_id is distinct from old.appointment_id then
      raise exception 'Students can only update completion status on action items'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists action_item_guard_update on public.action_item;
create trigger action_item_guard_update
  before update on public.action_item
  for each row execute function public.guard_action_item_update();

grant select, insert, update, delete on public.action_item to authenticated;
revoke all on public.action_item from anon;

-- ---------------------------------------------------------------------------
-- 5. Warm Clinical Referrals (`warm_referral`)
-- ---------------------------------------------------------------------------

create table if not exists public.warm_referral (
  id                uuid primary key default gen_random_uuid(),
  appointment_id    uuid references public.appointment (id) on delete set null,
  student_id        uuid not null references public.student (id) on delete cascade,
  from_counselor_id uuid not null references public.counselor (id) on delete cascade,
  to_counselor_id   uuid references public.counselor (id) on delete set null,
  external_clinic   text not null default '',
  summary           text not null check (char_length(trim(summary)) between 1 and 2000),
  urgency           public.urgency_level not null default 'medium',
  status            public.referral_status not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (to_counselor_id is not null or char_length(trim(external_clinic)) > 0)
);

create index if not exists warm_referral_from_idx on public.warm_referral (from_counselor_id);
create index if not exists warm_referral_to_status_idx on public.warm_referral (to_counselor_id, status);
create index if not exists warm_referral_appointment_idx on public.warm_referral (appointment_id);
create index if not exists warm_referral_student_idx on public.warm_referral (student_id);

drop trigger if exists warm_referral_set_updated_at on public.warm_referral;
create trigger warm_referral_set_updated_at
  before update on public.warm_referral
  for each row execute function public.set_updated_at();

alter table public.warm_referral enable row level security;

drop policy if exists warm_referral_select_counselors on public.warm_referral;
create policy warm_referral_select_counselors on public.warm_referral
  for select to authenticated
  using (
    from_counselor_id = (select public.current_counselor_id())
    or to_counselor_id = (select public.current_counselor_id())
  );

drop policy if exists warm_referral_insert_counselor on public.warm_referral;
create policy warm_referral_insert_counselor on public.warm_referral
  for insert to authenticated
  with check (from_counselor_id = (select public.current_counselor_id()));

drop policy if exists warm_referral_update_counselors on public.warm_referral;
create policy warm_referral_update_counselors on public.warm_referral
  for update to authenticated
  using (
    from_counselor_id = (select public.current_counselor_id())
    or to_counselor_id = (select public.current_counselor_id())
  )
  with check (
    from_counselor_id = (select public.current_counselor_id())
    or to_counselor_id = (select public.current_counselor_id())
  );

grant select, insert, update on public.warm_referral to authenticated;
revoke all on public.warm_referral from anon;

-- ---------------------------------------------------------------------------
-- 6. Obfuscated Admin Appointment Audit View (RA 11036 / RA 10173)
-- ---------------------------------------------------------------------------

create or replace view public.admin_appointment_audit
with (security_invoker = on) as
select
  a.id,
  'STU-••••' || right(coalesce(s.university_id::text, '0000'), 4) as obfuscated_student_code,
  d.title as department_name,
  col.full_name as college_name,
  a.counselor_id,
  trim(coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '')) as counselor_name,
  c.office_room,
  a.scheduled_at,
  a.duration_minutes,
  a.urgency,
  a.status,
  a.created_by_role,
  exists (
    select 1 from public.warm_referral wr where wr.appointment_id = a.id
  ) as has_warm_referral,
  a.created_at,
  a.updated_at
from public.appointment a
left join public.student s on s.id = a.student_id
left join public.department d on d.id = s.department_id
left join public.college col on col.id = d.college_id
left join public.counselor c on c.id = a.counselor_id;

grant select on public.admin_appointment_audit to authenticated;
revoke all on public.admin_appointment_audit from anon;

-- ---------------------------------------------------------------------------
-- 7. v2 Realtime Notification Triggers (Lock-screen safe — zero clinical PII)
-- ---------------------------------------------------------------------------

create or replace function public.notify_warm_referral_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_to_user   uuid;
  v_from_user uuid;
  v_from_name text;
  v_to_name   text;
begin
  select c.user_id, trim(c.first_name || ' ' || c.last_name)
    into v_from_user, v_from_name
  from public.counselor c where c.id = new.from_counselor_id;

  if new.to_counselor_id is not null then
    select c.user_id, trim(c.first_name || ' ' || c.last_name)
      into v_to_user, v_to_name
    from public.counselor c where c.id = new.to_counselor_id;
  end if;

  if tg_op = 'INSERT' and v_to_user is not null then
    insert into public.notification (user_id, type, title, body, link)
    values (
      v_to_user,
      'appointment',
      'New warm referral received',
      coalesce(v_from_name, 'A counselor') || ' sent you a confidential warm referral.',
      '/counselor/appointments'
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status and v_from_user is not null then
    insert into public.notification (user_id, type, title, body, link)
    values (
      v_from_user,
      'appointment',
      'Warm referral ' || new.status::text,
      coalesce(v_to_name, 'Receiving counselor') || ' marked your referral as ' || new.status::text || '.',
      '/counselor/appointments'
    );
  end if;

  return new;
end;
$$;

revoke execute on function public.notify_warm_referral_change() from anon, authenticated, public;

drop trigger if exists warm_referral_notify on public.warm_referral;
create trigger warm_referral_notify
  after insert or update of status on public.warm_referral
  for each row execute function public.notify_warm_referral_change();

create or replace function public.notify_action_item_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_user uuid;
begin
  select s.user_id into v_student_user from public.student s where s.id = new.student_id;
  if v_student_user is not null then
    insert into public.notification (user_id, type, title, body, link)
    values (
      v_student_user,
      'system',
      'New action plan step added',
      'Your counselor added a new follow-up step to your Sanctuary dashboard.',
      '/student'
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.notify_action_item_insert() from anon, authenticated, public;

drop trigger if exists action_item_notify on public.action_item;
create trigger action_item_notify
  after insert on public.action_item
  for each row execute function public.notify_action_item_insert();

-- Add v2 tables to Supabase Realtime publication
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'action_item'
    ) then
      alter publication supabase_realtime add table public.action_item;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'warm_referral'
    ) then
      alter publication supabase_realtime add table public.warm_referral;
    end if;
  end if;
end;
$$;
