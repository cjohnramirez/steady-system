<!--
Keep this short. A template nobody fills in is worse than no template.
Delete any section that does not apply.
-->

## What and why

<!-- What changes, and what problem it solves. One paragraph is usually enough. -->

## How to check it

<!--
Steps a reviewer can actually follow. Which page, signed in as which role, what
they should see. "Tested locally" is not a step.

Seeded accounts, password Password123!
  admin@steady.test   counselor@steady.test   student@steady.test   student2@steady.test
-->

## Checklist

- [ ] `pnpm lint`, `pnpm type-check`, `pnpm test` and `pnpm build` all pass
- [ ] Prettier is clean (`pnpm format:check`)

### If it touches the database

- [ ] The change is a migration in `supabase/migrations`, not a hand edit in the
      dashboard. The dashboard is not version controlled, and losing it once is
      what cost this project its entire schema.
- [ ] Row-level security is enabled on any new table, with a policy per role.
      A table with RLS on and no policy is invisible; a table with RLS off is
      readable by anyone holding the anon key.
- [ ] Any new view is created `with (security_invoker = on)`, so the caller's
      policies still apply rather than the view owner's.
- [ ] `src/types/supabase.ts` matches the new schema.
- [ ] Seed data still applies from clean (`supabase db reset`).

### If it touches authentication or a server action

- [ ] Anything using `createServiceClient` calls `requireRole` first, or only
      queries rows scoped to the caller's own `auth.uid()`. A `"use server"`
      module is a public endpoint regardless of which page links to it.
- [ ] Input is validated on the server with its Zod schema, not only in the form.
- [ ] Redirect targets are real routes. Check them, or take them from
      `src/lib/auth/roles.ts`.

### If it touches the UI

- [ ] Anything read from the persisted auth store is gated on `useHydrated`,
      or it will mismatch on hydration.
- [ ] Appointment status comes from `src/lib/appointments/status.ts` rather than
      a new copy of the colours.
- [ ] No `console.log` left behind.

### If it adds configuration

- [ ] New environment variables are in `.env.example` with a comment, and set in
      Vercel. No secret is committed, and nothing server-only is prefixed
      `NEXT_PUBLIC_`.

## Anything a reviewer should push back on

<!--
Shortcuts taken, things left unfinished, decisions you are unsure about. Say them
here rather than letting a reviewer find them.
-->
