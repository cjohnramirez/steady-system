-- Reference data: colleges, moods, and the guidance office's own details.

create table public.college (
  id           uuid primary key default gen_random_uuid(),
  abbreviation text not null default '',
  full_name    text not null default ''
);

create table public.emotional_status (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);
comment on table public.emotional_status is 'Mood tags. Students pick one; articles and playlists are filed under one.';

-- Single-row table holding the guidance office profile shown on the landing page
-- and edited from /admin/settings/system.
create table public.organization (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  abbreviation       text not null,
  email              text not null,
  phone              bigint not null,
  office_location    text not null,
  day_of_week        boolean[] not null default '{false,true,true,true,true,true,false}',
  start_office_hour  time not null default '08:00',
  end_office_hour    time not null default '17:00',
  constraint organization_day_of_week_length check (array_length(day_of_week, 1) = 7)
);

create table public.organization_contact (
  id             uuid primary key default gen_random_uuid(),
  platform       text not null,
  contact_detail text not null
);
comment on table public.organization_contact is 'Social and messaging handles for the office, rendered in the public footer.';
