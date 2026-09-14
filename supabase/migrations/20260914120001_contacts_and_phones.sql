-- Phone numbers as text, and a transactional way to replace a student's contacts.
--
-- contact_person.phone and organization.phone were bigint, which silently drops the
-- leading zero of every local number ("09171234567" came back as 9171234567) and
-- could not hold a "+63" prefix at all. The footer papered over it by printing a
-- literal "0" in front of whatever came back.

alter table public.contact_person
  alter column phone type text using phone::text;

alter table public.contact_person
  add constraint contact_person_phone_format
  check (phone ~ '^\+?[0-9]{7,15}$') not valid;

alter table public.contact_person
  add column if not exists created_at timestamptz not null default now();

alter table public.organization
  alter column phone type text using phone::text;

-- Students edited their contacts by deleting every row and inserting the new set as
-- two separate requests. A failed insert left them with no contacts at all. This does
-- both in one transaction and checks ownership itself.
create or replace function public.replace_contact_persons(
  p_student_id uuid,
  p_contacts jsonb
)
returns setof public.contact_person
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_student_id is distinct from public.current_student_id()
     and not public.is_admin() then
    raise exception 'You can only edit your own emergency contacts'
      using errcode = 'insufficient_privilege';
  end if;

  if jsonb_typeof(coalesce(p_contacts, '[]'::jsonb)) <> 'array' then
    raise exception 'Contacts must be a list' using errcode = 'invalid_parameter_value';
  end if;

  delete from public.contact_person where student_id = p_student_id;

  return query
  insert into public.contact_person (student_id, first_name, middle_name, last_name, phone)
  select
    p_student_id,
    c ->> 'first_name',
    nullif(c ->> 'middle_name', ''),
    c ->> 'last_name',
    c ->> 'phone'
  from jsonb_array_elements(coalesce(p_contacts, '[]'::jsonb)) as c
  returning *;
end;
$$;
