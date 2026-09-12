-- Appointments.
--
-- Three changes from the original schema, all of them things the application was
-- working around in TypeScript:
--   * status is an enum rather than free text, so the five literals scattered
--     across the UI can no longer drift;
--   * scheduled_at is timestamptz rather than a bare timestamp, so a booking means
--     the same instant regardless of who is looking at it;
--   * a unique index makes double booking impossible at the storage layer.

create type public.appointment_status as enum (
  'pending', 'approved', 'completed', 'cancelled', 'rejected'
);

create table public.appointment (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid references public.student (id) on delete cascade,
  counselor_id uuid references public.counselor (id) on delete set null,
  scheduled_at timestamptz not null,
  reason       text not null default '',
  notes        text not null default '',
  status       public.appointment_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index appointment_student_id_idx on public.appointment (student_id);
create index appointment_counselor_id_idx on public.appointment (counselor_id);
create index appointment_scheduled_at_idx on public.appointment (scheduled_at desc);
create index appointment_status_idx on public.appointment (status);

-- A counselor cannot hold two live appointments at the same instant. Cancelled and
-- rejected rows are excluded so a freed slot becomes bookable again.
create unique index appointment_no_double_booking
  on public.appointment (counselor_id, scheduled_at)
  where status in ('pending', 'approved');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger appointment_set_updated_at
  before update on public.appointment
  for each row execute function public.set_updated_at();
