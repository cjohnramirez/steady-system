# Steady (GCS) v2 — Project Progress

> Live visual verification gallery (no sign-in required): `/dev/components`

## Completed Milestones

### Milestone 1 — Supabase v2 Schema, RLS & Live Verification (`3c855af`)

- [x] Added migrations `20261128120001_v2_clinical_and_audit.sql` and `20261128120002_fix_appointment_insert_policy.sql`.
- [x] Created `clinical_note` (SOAP/SAP, counselor-only RLS), `action_item` (student completion guard trigger), `warm_referral`, and `admin_appointment_audit` (`security_invoker = on`, RA 11036 `STU-••••XXXX` obfuscation).
- [x] Added Realtime notification triggers for warm referrals and action items.
- [x] Verified **32 / 32 live RLS checks** via `node scripts/db/verify.mjs` and regenerated `src/types/supabase.ts`.
- [x] Added clinical Zod 4 schemas (`src/lib/validation/clinical.ts`) and unit tests (`src/lib/validation/clinical.test.ts`).

### Milestone 2 — Global Theme Tokens, Motion Engine & Tier-1 Primitives (`6db8034`)

- [x] Centralized exact Figma Login Section colors into global CSS variables in `src/app/globals.css` (`:root` + `.dark`) for easy customization.
- [x] Loaded `Instrument_Sans` via `next/font/google`.
- [x] Added `motion` (`LazyMotion` + `MotionConfig reducedMotion="user"`) and reusable primitives (`src/components/motion/primitives.tsx`).
- [x] Restyled `Button` (with `positive` variant + inner shadow), `Input`, `Dialog`, `SectionCard`, `StatusBadge`, and `UrgencyBadge`.

### Milestone 3 — Role Sidebars, Privacy Shield, Modals & v2 Routes (`d4fb195`)

- [x] Built collapsible desktop + mobile Sheet `RoleSidebar` and wired into Student, Counselor, and Admin layouts.
- [x] Built `PrivacyShield` (`P` hotkey), `PillTabs` (`layoutId` spring), `Stepper`, `CrisisSupportDialog`, `BreathingPacerDialog` (4-7-8), `WarmReferralDialog`, and `SessionCard` (SOAP/SAP + live timer).
- [x] Upgraded `NotificationBell` with `All` / `Unread` `PillTabs` and `AnimatePresence`.
- [x] Added student & counselor v2 routes (`/student/appointments`, `/student/profile`, `/counselor/appointments`, `/counselor/students`, `/counselor/availability`, `/counselor/analytics`) and Admin RA 11036 obfuscated codes.
- [x] Created live component gallery at `/dev/components`.

### Milestone 4 — SEO, Security Headers & Vercel Auto-Deploy (`b43c969`, PR #17 & #18)

- [x] Added CSP + security headers and `NEXT_OUTPUT=standalone` toggle in `next.config.ts`.
- [x] Added `src/app/sitemap.ts`, `src/app/robots.ts`, and JSON-LD on `/home`.
- [x] Updated `.github/workflows/preview.yml` for automatic Vercel preview deployments on `dev` pushes (alongside `production.yml` on `main`).
- [x] Cleaned unused/prototype files and merged PR #17 (`feat/steady-v2` → `dev`) and PR #18 (`dev` → `main`).

### Milestone 5 — Clinical Server Actions, Student Wellness & Counselor Dossier (Complete)

- [x] Built RLS-enforced server actions in `src/lib/actions/clinical.ts` (`saveClinicalNote`, `createActionItem`, `toggleActionItem`, `deleteActionItem`, `createWarmReferral`, `updateDutyStatus`).
- [x] Built `ActionPlanCard`, `CounselorDetailsDialog`, `ArticleReaderDialog`, and `DossierDialog`.
- [x] Created `/student/wellness` hub, wired live `ActionPlanCard` into `/student`, connected `DossierDialog` into `/counselor/students`, and wired live `updateDutyStatus` in the counselor sidebar.
- [x] Exposed all new components on `/dev/components` and made `/dev/components` publicly accessible (no login required).

---

## Upcoming Milestones

- [ ] **Milestone 6 — Counselor Daily Horizon & Live Session Wiring:** Connect `SessionCard` SOAP/SAP form, live timer, and `WarmReferralDialog` directly to `saveClinicalNote` and `createWarmReferral` on `/counselor`, plus manual/proposed booking modal on `/counselor/appointments`.
- [ ] **Milestone 7 — Student 4-Step Booking Wizard & Auth Polish:** Upgrade `/student/appointment` to the 4-step `Stepper` wizard with `CounselorDetailsDialog`, and polish `/auth/login/[role]` & `/auth/signup/student` with animated transitions.
- [ ] **Milestone 8 — Admin Audit View, Analytics & Full Responsive QA:** Wire `/admin/appointments` to `admin_appointment_audit` view with CSV export, add Counselor Analytics charts (`/counselor/analytics`), and verify `390px` / `768px` / `1440px` across Light & Dark modes.
