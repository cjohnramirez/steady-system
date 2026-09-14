-- Appointment notifications reach everyone involved except the person who acted.
--
-- The first version guessed the actor: anyone who wasn't the student was assumed
-- to be the counselor. So when an admin cancelled, only the student heard, and the
-- counselor kept a slot in their head that no longer existed. Approvals, declines
-- and completions by an admin never reached the counselor at all.
--
-- It also handled a status change and a time change as either/or. An update that
-- confirmed an appointment at a new time said "confirmed" and never mentioned the
-- new time.
--
-- The rule now: the student and the counselor are each told, unless they made the
-- change themselves. An admin, or a job running without a signed-in user, is
-- neither party, so both are told.

create or replace function public.notify_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tz               text := public.app_timezone();
  v_actor          uuid := auth.uid();
  v_student_user   uuid;
  v_student_name   text;
  v_counselor_user uuid;
  v_counselor_name text;
  v_when           text;
  v_moved          boolean;
  v_title          text;
  v_student_body   text;
  v_counselor_body text;
  v_student_link   text := '/student';
begin
  select s.user_id, trim(s.first_name || ' ' || s.last_name)
    into v_student_user, v_student_name
  from public.student s where s.id = new.student_id;

  select c.user_id, trim(c.first_name || ' ' || c.last_name)
    into v_counselor_user, v_counselor_name
  from public.counselor c where c.id = new.counselor_id;

  v_student_name := coalesce(v_student_name, 'A student');
  v_counselor_name := coalesce(v_counselor_name, 'your counselor');
  v_when := to_char(new.scheduled_at at time zone tz, 'FMMon FMDD, YYYY "at" FMHH12:MI AM');

  if tg_op = 'INSERT' then
    if v_counselor_user is not null and new.status = 'pending'
       and v_actor is distinct from v_counselor_user then
      insert into public.notification (user_id, type, title, body, link)
      values (v_counselor_user, 'appointment', 'New appointment request',
              v_student_name || ' requested ' || v_when || '.', '/counselor');
    end if;
    return new;
  end if;

  v_moved := new.scheduled_at is distinct from old.scheduled_at;

  if new.status is distinct from old.status then
    case new.status
      when 'approved' then
        v_title := case when v_moved then 'Appointment moved and confirmed' else 'Appointment approved' end;
        v_student_body := 'Your appointment with ' || v_counselor_name || ' is confirmed for ' || v_when || '.';
        v_counselor_body := 'Your appointment with ' || v_student_name || ' is confirmed for ' || v_when || '.';
      when 'rejected' then
        v_title := 'Appointment declined';
        v_student_body := 'Your request for ' || v_when || ' was declined. You can book another time.';
        v_counselor_body := 'The request from ' || v_student_name || ' for ' || v_when || ' was declined.';
        v_student_link := '/student/appointment';
      when 'completed' then
        v_title := 'Appointment completed';
        v_student_body := 'Your session on ' || v_when || ' has been marked complete.';
        v_counselor_body := 'Your session with ' || v_student_name || ' on ' || v_when || ' was marked complete.';
      when 'cancelled' then
        v_title := 'Appointment cancelled';
        v_student_body := 'Your appointment on ' || v_when || ' was cancelled.';
        v_counselor_body := case
          when v_actor is not distinct from v_student_user
            then v_student_name || ' cancelled their appointment on ' || v_when || '.'
          else 'Your appointment with ' || v_student_name || ' on ' || v_when || ' was cancelled.'
        end;
      else
        -- Back to pending (for example after a reschedule): only worth a message if
        -- the time moved, which the branch below covers.
        if not v_moved then
          return new;
        end if;
    end case;
  end if;

  if v_title is null and v_moved then
    v_title := 'Appointment rescheduled';
    v_student_body := 'Your appointment with ' || v_counselor_name || ' has moved to ' || v_when || '.';
    v_counselor_body := 'Your appointment with ' || v_student_name || ' has moved to ' || v_when || '.';
  end if;

  if v_title is null then
    return new;
  end if;

  if v_student_user is not null and v_actor is distinct from v_student_user then
    insert into public.notification (user_id, type, title, body, link)
    values (v_student_user, 'appointment', v_title, v_student_body, v_student_link);
  end if;

  if v_counselor_user is not null and v_actor is distinct from v_counselor_user then
    insert into public.notification (user_id, type, title, body, link)
    values (v_counselor_user, 'appointment', v_title, v_counselor_body, '/counselor');
  end if;

  return new;
end;
$$;

revoke execute on function public.notify_appointment_change() from public, anon, authenticated;
