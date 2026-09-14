# Pull request description

Title:

    feat: audit fixes and Steady rebrand

---

## What changed

- **Auth:** identity now comes from the server session instead of localStorage. Signup runs in one database transaction, a new reset-password flow is added, and redirect loops, the open redirect and wrong-tab sign-outs are fixed.
- **Database:** guards stop students approving their own bookings and counselors reassigning students, contact phones are stored as text, the counselor view returns one row per counselor, the dashboard is a single RPC, and function grants are tightened.
- **Notifications:** notifications are now in-app via Supabase triggers and Realtime, with a bell in the navigation. Firebase is removed.
- **Keys:** env vars are validated at startup, Cloudinary uploads are signed and go straight from the browser (no 1 MB limit), and deletes are admin-only.
- **Workflows:** counselor accept, reject and reschedule work, landing CMS saves work, admin student edit validates, table sorting works, and export respects the row count.
- **UI:** accessible brand amber, status tokens, shared components, mobile layouts, and [docs/ui-guidelines.md](ui-guidelines.md).
- **Brand:** renamed to Steady with a new mark, generated icons, dark mode, an early access notice, and rewritten privacy policy and terms.
- **Seed:** 150 students, 8 counselors, about 380 appointments, 112 content items with placeholder photos. Logins use `@steady.test`.

## Before merging

- Supabase Auth: set Site URL to the production domain and add `https://<domain>/**` to redirect URLs.
- Vercel: set every variable in `.env.example`, with `NEXT_PUBLIC_APP_URL` as the production domain.
- Run `node scripts/db/verify.mjs` against the target database.
