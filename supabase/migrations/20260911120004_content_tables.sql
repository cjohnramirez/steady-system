-- Content managed from /admin/landing and read by the public site and the portal.
-- Images are Cloudinary URLs; the empty-string default is what the tile components
-- fall back on when they render /placeholder.png.

create table public.announcement (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  description        text not null default '',
  location           text not null,
  announcement_image text not null default '',
  start_date         timestamptz not null,
  end_date           timestamptz not null,
  constraint announcement_dates_ordered check (start_date <= end_date)
);

create index announcement_start_date_idx on public.announcement (start_date desc);

create table public.article (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  content             text not null,
  link                text not null default '',
  author_name         text not null default '',
  publisher_name      text not null default '',
  article_image       text not null default '',
  emotional_status_id uuid not null references public.emotional_status (id) on delete restrict,
  added_at            timestamptz not null default now()
);

create index article_emotional_status_id_idx on public.article (emotional_status_id);
create index article_added_at_idx on public.article (added_at desc);

create table public.playlist (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  link                text not null,
  creator             text not null default '',
  image               text not null default '',
  emotional_status_id uuid not null references public.emotional_status (id) on delete restrict
);

create index playlist_emotional_status_id_idx on public.playlist (emotional_status_id);
