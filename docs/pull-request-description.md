# Pull request description: restart

Paste the body below into GitHub. Kept here rather than in a scratch file so it
stays with the branch and doubles as a record of what the restart changed.

Title:

    Restart: database in the repo, auth holes closed, data layer typed

---

## Why

The project stopped in December with three commits in a row fighting a login
failure. The root cause was never found, and a second, larger problem was sitting
underneath it: the database existed nowhere but inside a hosted Supabase project.
No schema, no policies, no functions in git. When that project went away the
application could not be run at all.

This restarts it. The database is now in the repository, the authorization holes
found along the way are closed, and the data layer is typed so the compiler can
see the schema again.

## The December failure, fully diagnosed

`custom_access_token_hook` injects the `user_role` claim that middleware reads.
Registering it is not enough. It runs as `supabase_auth_admin`, which is subject
to row-level security on `user_roles` like any other role, so without an explicit
policy for it the hook reads nothing and every access token is issued with a null
role. Middleware then bounces every signed-in user out of every protected route.

Both halves are now in the migrations, and the role resolver falls back to the
table so a misconfigured hook degrades instead of locking everyone out.

## Security

- `insertCounselor` lived in a `"use server"` module, so it was a public network
  endpoint. It called `signUp`, then used the **service-role key** to insert
  `role: "counselor"` into `user_roles`, with no check on the caller anywhere.
  That was unauthenticated privilege escalation. It also created the auth user on
  the cookie-bound client, so an admin who added a counselor was silently signed
  out and signed back in as the person they had just created.
- The four dashboard analytics endpoints ran on the service key and verified
  nothing. Student counts and appointment volume were readable by anyone who
  invoked the action.
- The Cloudinary upload endpoints were open to anyone, against a metered account.
- No server action validated its input at runtime. Zod was imported in four of
  them but only ever for `z.infer`.
- Detail views are created `with (security_invoker = on)`. Without it a view runs
  as its owner, and any signed-in student could read every other student's record
  straight through `student_with_details`.

## Correctness

- Middleware sent counselors to `/counselor/dashboard` and students to
  `/student/profile`. Neither route has ever existed. `/error` did not exist
  either; `src/app/error.tsx` is an error boundary and never served that URL.
- Appointments could be double-booked. The picker generated every half hour in a
  counselor's window and offered all of them regardless of what was taken. Slots
  now come from `get_available_slots`, the insert is re-checked server side, and a
  unique partial index makes it impossible at the storage layer.
- Registration performed four separate writes and left an orphaned auth user
  behind whenever a later one failed. It is one transactional function now.
- `appointment.status` was free text. The five literals were spread across eight
  files and the copies disagreed on colour. It is a database enum with one
  description in code.
- Times were handled ad hoc, parsing timezone suffixes by string-splitting and
  building slots against the browser clock. Everything resolves through one
  timezone now.

## Typing, and what it found

28 annotations said `SupabaseClient` with no schema parameter, which degrades
every query result to `any`. Proof of how much that hid: `status` was changed to a
database enum and type-check reported nothing at all. With the schema attached it
reported six real bugs, including columns typed against the wrong relation and a
table whose columns and rows could be mismatched without complaint.

## Verified

Against the live database, in a browser, not just by reading:

| Check                                    | Result                                     |
| ---------------------------------------- | ------------------------------------------ |
| Student reading the student view         | own row only                               |
| Counselor reading it                     | their department only                      |
| Signed out                               | nothing, but public content still readable |
| Second student booking a taken slot      | refused                                    |
| Booking on another student's behalf      | refused                                    |
| Creating an already-approved appointment | refused                                    |
| Granting yourself the admin role         | refused                                    |
| Calling the access token hook directly   | permission denied                          |
| Student login                            | lands on `/student`, previously a 404      |
| Booking page after one slot is taken     | 18 slots become 17                         |

`pnpm lint`, `pnpm type-check`, `pnpm test` and `pnpm build` all pass.

## Also

32 tests where there were none. Cypress removed: it was configured with no e2e
block, no directory and no test of any kind. Both workflows pinned Node 18, which
Next.js 16 does not support, and ran `pnpm format --check`, which expands to
`prettier --write . --check` and fails on conflicting flags. A new CI job applies
every migration and the seed to a throwaway database so the schema in git cannot
drift from the one that runs. Four unused dependencies dropped, including
`next-auth`, which played no part in authentication.

## Before merging

Two things that cannot be done from the CLI:

1. In the Supabase dashboard, under Authentication then Hooks, enable the
   customize access token hook and point it at `public.custom_access_token_hook`.
2. Rotate the database password, and set the environment variables from
   `.env.example` in Vercel.

Seeded accounts for staging use the password `Password123!` and should not exist
in production.

## Known conflict with `dev`

This branch was built on `main`. `dev` is ahead of `main` by eleven commits that
were never merged, including the notification system and the December appointment
work, so the two overlap and neither contains the other. Expect conflicts and
resolve them in favour of keeping both.
