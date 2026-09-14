-- In-app notifications, delivered live over Supabase Realtime.
--
-- The December version pushed through Firebase from an API route that checked
-- nothing, so anyone could send anything to anyone. Here nobody inserts a
-- notification directly. Rows are written by triggers that react to appointment
-- changes, and by notify_role(), which only an admin may call. Clients may read,
-- mark as read, and delete their own rows, and nothing else.

-- Firebase leftovers from the hosted project this schema is being applied to.
drop table if exists public.fcm_token cascade;

-- The Firebase-era notification table had a different shape (is_dismissed, a
-- nullable user_id, free-text type). Replace it rather than try to migrate it.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notification' and column_name = 'is_dismissed'
  ) then
    drop table public.notification cascade;
  end if;
end;
$$;

drop function if exists public.purge_expired_notifications() cascade;
drop function if exists public.shares_appointment_with(uuid) cascade;
drop type if exists public.notification_type cascade;

create type public.notification_type as enum ('appointment', 'announcement', 'system');

create table public.notification (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  type       public.notification_type not null default 'system',
  title      text not null,
  body       text not null default '',
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index notification_user_created_idx
  on public.notification (user_id, created_at desc);
create index notification_user_unread_idx
  on public.notification (user_id) where read_at is null;

alter table public.notification enable row level security;

create policy notification_select_own on public.notification
  for select to authenticated using (user_id = auth.uid());

create policy notification_update_own on public.notification
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy notification_delete_own on public.notification
  for delete to authenticated using (user_id = auth.uid());

-- The update policy decides which rows; these grants decide which column. Marking a
-- notification read must not be a way to rewrite its text.
revoke insert, update on public.notification from anon, authenticated;
grant update (read_at) on public.notification to authenticated;

-- ---------------------------------------------------------------------------
-- Appointment events
-- ---------------------------------------------------------------------------

create or replace function public.notify_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tz                text := public.app_timezone();
  v_student_user    uuid;
  v_student_name    text;
  v_counselor_user  uuid;
  v_counselor_name  text;
  v_when            text;
begin
  select s.user_id, trim(s.first_name || ' ' || s.last_name)
    into v_student_user, v_student_name
  from public.student s where s.id = new.student_id;

  select c.user_id, trim(c.first_name || ' ' || c.last_name)
    into v_counselor_user, v_counselor_name
  from public.counselor c where c.id = new.counselor_id;

  v_when := to_char(new.scheduled_at at time zone tz, 'FMMon FMDD, YYYY "at" FMHH12:MI AM');

  if tg_op = 'INSERT' then
    if v_counselor_user is not null and new.status = 'pending' then
      insert into public.notification (user_id, type, title, body, link)
      values (v_counselor_user, 'appointment', 'New appointment request',
              coalesce(v_student_name, 'A student') || ' requested ' || v_when || '.',
              '/counselor');
    end if;
    return new;
  end if;

  if new.status is distinct from old.status then
    if new.status = 'approved' and v_student_user is not null then
      insert into public.notification (user_id, type, title, body, link)
      values (v_student_user, 'appointment', 'Appointment approved',
              'Your appointment with ' || coalesce(v_counselor_name, 'your counselor') || ' on ' || v_when || ' is confirmed.',
              '/student');
    elsif new.status = 'rejected' and v_student_user is not null then
      insert into public.notification (user_id, type, title, body, link)
      values (v_student_user, 'appointment', 'Appointment declined',
              'Your request for ' || v_when || ' was declined. You can book another time.',
              '/student/appointment');
    elsif new.status = 'completed' and v_student_user is not null then
      insert into public.notification (user_id, type, title, body, link)
      values (v_student_user, 'appointment', 'Appointment completed',
              'Your session on ' || v_when || ' has been marked complete.',
              '/student');
    elsif new.status = 'cancelled' then
      -- Tell whoever did not cancel it.
      if auth.uid() is not distinct from v_student_user then
        if v_counselor_user is not null then
          insert into public.notification (user_id, type, title, body, link)
          values (v_counselor_user, 'appointment', 'Appointment cancelled',
                  coalesce(v_student_name, 'A student') || ' cancelled their appointment on ' || v_when || '.',
                  '/counselor');
        end if;
      elsif v_student_user is not null then
        insert into public.notification (user_id, type, title, body, link)
        values (v_student_user, 'appointment', 'Appointment cancelled',
                'Your appointment on ' || v_when || ' was cancelled.',
                '/student');
      end if;
    end if;
  elsif new.scheduled_at is distinct from old.scheduled_at and v_student_user is not null then
    insert into public.notification (user_id, type, title, body, link)
    values (v_student_user, 'appointment', 'Appointment rescheduled',
            'Your appointment has moved to ' || v_when || '.',
            '/student');
  end if;

  return new;
end;
$$;

create trigger appointment_notify
  after insert or update of status, scheduled_at on public.appointment
  for each row execute function public.notify_appointment_change();

-- ---------------------------------------------------------------------------
-- Broadcasts
-- ---------------------------------------------------------------------------

create or replace function public.notify_role(
  p_role  public.app_role,
  p_title text,
  p_body  text default '',
  p_link  text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can send announcements'
      using errcode = 'insufficient_privilege';
  end if;

  if coalesce(trim(p_title), '') = '' then
    raise exception 'A notification needs a title' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.notification (user_id, type, title, body, link)
  select ur.user_id, 'announcement', p_title, coalesce(p_body, ''), p_link
  from public.user_roles ur
  where ur.role = p_role;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notification'
    ) then
      alter publication supabase_realtime add table public.notification;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'appointment'
    ) then
      alter publication supabase_realtime add table public.appointment;
    end if;
  end if;
end;
$$;
