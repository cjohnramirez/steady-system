-- Roles, permissions, and the custom access token hook.
--
-- The hook is what injects the `user_role` claim that src/utils/supabase/proxy.ts
-- and src/app/auth/login/actions.ts read out of the JWT. It must also be registered
-- in supabase/config.toml under [auth.hook.custom_access_token]; registering the
-- function without that entry is what broke login in December 2025.

create type public.app_role as enum ('admin', 'counselor', 'student');

create type public.app_permission as enum (
  'admin.select',             'admin.insert',             'admin.update',             'admin.delete',
  'student.select',           'student.insert',           'student.update',           'student.delete',
  'counselor.select',         'counselor.insert',         'counselor.update',         'counselor.delete',
  'appointment.select',       'appointment.insert',       'appointment.update',       'appointment.delete',
  'college.select',           'college.insert',           'college.update',           'college.delete',
  'emotional_status.select',  'emotional_status.insert',  'emotional_status.update',  'emotional_status.delete',
  'publisher.select',         'publisher.insert',         'publisher.update',         'publisher.delete',
  'article.select',           'article.insert',           'article.update',           'article.delete',
  'announcement.select',      'announcement.insert',      'announcement.update',      'announcement.delete',
  'platform.select',          'platform.insert',          'platform.update',          'platform.delete',
  'playlist.select',          'playlist.insert',          'playlist.update',          'playlist.delete',
  'availability.select',      'availability.insert',      'availability.update',      'availability.delete',
  'department.delete',        'department.update',        'department.insert',
  'organization.update'
);

-- One role per user. The unique constraint on user_id is what lets the access token
-- hook do a single-row lookup.
create table public.user_roles (
  id      bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  role    public.app_role not null,
  unique (user_id)
);
comment on table public.user_roles is 'Application role for each auth user. Source of the user_role JWT claim.';

create table public.role_permissions (
  id         bigint generated always as identity primary key,
  role       public.app_role not null,
  permission public.app_permission not null,
  unique (role, permission)
);
comment on table public.role_permissions is 'Which permissions each role holds. Consulted by authorize().';

-- ---------------------------------------------------------------------------
-- Access token hook
-- ---------------------------------------------------------------------------

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims    jsonb;
  user_role public.app_role;
begin
  select ur.role into user_role
  from public.user_roles ur
  where ur.user_id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';

  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  else
    claims := jsonb_set(claims, '{user_role}', 'null'::jsonb);
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

grant select on table public.user_roles to supabase_auth_admin;

-- ---------------------------------------------------------------------------
-- Permission checks used by RLS policies
-- ---------------------------------------------------------------------------

-- Reads the role straight from the caller's JWT, so it costs nothing per row.
create or replace function public.authorize(requested_permission public.app_permission)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  bind_permissions int;
  user_role public.app_role;
begin
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

  if user_role is null then
    return false;
  end if;

  select count(*) into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = user_role;

  return bind_permissions > 0;
end;
$$;

-- Same check, but falls back to the table when the claim is absent. Use this from
-- application code; use authorize() inside hot RLS policies.
create or replace function public.has_permission(perm public.app_permission)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  user_role public.app_role;
begin
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

  if user_role is null then
    select ur.role into user_role
    from public.user_roles ur
    where ur.user_id = auth.uid();
  end if;

  if user_role is null then
    return false;
  end if;

  return exists (
    select 1 from public.role_permissions
    where role = user_role and permission = perm
  );
end;
$$;

-- Convenience wrapper: the current caller's role, claim first, table second.
create or replace function public.current_app_role()
returns public.app_role
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  user_role public.app_role;
begin
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

  if user_role is null then
    select ur.role into user_role
    from public.user_roles ur
    where ur.user_id = auth.uid();
  end if;

  return user_role;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_app_role() = 'admin';
$$;
