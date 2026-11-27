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

### Milestone 5.5 — Figma 1:1 Layout Alignment Pass (Complete)

- [x] Pulled exact Figma design context + screenshots for `CrisisDialog`, `WarmReferralDialog`, `DossierDialog`, `CounselorDetailsDialog`, `ArticleReaderDialog`, `BreathingDialog` (Default & Active), and `SessionCard` (Pending & Active SOAP/Action Plan).
- [x] Realigned all 7 components to match Figma's exact 3-band dialog anatomy, hairline dividers, nested tray `SessionCard`, full-bleed blue `BreathingPacerDialog`, and interactive weekly calendar in `CounselorDetailsDialog`.
- [x] Updated `/dev/components` for side-by-side visual verification.

### Milestone 6 — Counselor Proposed Booking, Session Details & Confirm Dialogs (Complete)

- [x] Added RLS-enforced `createManualBooking` server action in `src/lib/actions/clinical.ts`.
- [x] Built `ProposedBookingDialog` (`678:18530`) and `PendingSessionDetailsDialog` (`678:18365`) 1:1 with Figma.
- [x] Aligned `ConfirmDialog` to Figma `ApproveDialog` (`678:19057`) & `DeclineDialog` (`678:19078`).
- [x] Wired live `ProposeBookingTrigger` into `/counselor` and exposed both new dialogs on `/dev/components`.

### Milestone 6.5 — Custom Figma Dropdown, Animated Mascot & Dialog Scroll Lock (Complete)

- [x] Restyled `Select` (`src/components/ui/select.tsx`) to match Figma Status Dropdown (`678:19099`) with symmetrical `px-5` left/right trigger padding and replaced native `<select>` elements in `WarmReferralDialog`, `ProposedBookingDialog`, and `CounselorSidebarShell`.
- [x] Built `<SteadyMascot />` (`src/components/app/steady-mascot.tsx`) from exact Figma vector (`678:17585`) with natural eye blinking and cursor-proximity tracking (`260px` radius), and wired it as the default Brand Blue avatar in `UserAvatar`.
- [x] Locked static headers & footers with scrollable center bodies (`flex max-h-[85vh] flex-col` + `min-h-0 flex-1 overflow-y-auto`) across all 7 dialogs.
- [x] Exposed interactive Mascot & Custom Dropdown demos at the top of `/dev/components`.

### Milestone 7 — Brand Logo Lockup, ReasonTile & 4-Step Student Booking Wizard (Complete)

- [x] Updated `SteadyMark` and `BrandMark` (`src/components/app/steady-mark.tsx`, `brand-mark.tsx`) to match exact Figma Icon & Wordmark (`678:15857`).
- [x] Built `ReasonTile` (`551:770`) and exposed it on `/dev/components`.
- [x] Upgraded `/student/appointment` (`booking-form.tsx`) to the 4-step `Stepper` wizard with `ReasonTile` grid and `CounselorDetailsDialog`.
- [x] Upgraded `LoginTabs` (`src/app/auth/login/[role]/login-tabs.tsx`) to Figma's pill role switcher.

### Milestone 8 — Figma 1:1 Full-Page Layouts & Admin RA 11036 Audit Ledger (Complete)

- [x] Rebuilt **Student Dashboard** (`/student`, Figma `678:19256`) with peeking mascots hero, upcoming session bar, 2-column action plan grid, 4×2 expressive mood check-in cards, 4-7-8 breathing banner, and curated portal cards.
- [x] Rebuilt **Counselor Daily Checking** (`/counselor`, Figma `678:17237`) with 3-column KPI strip (`Waiting | Upcoming | Completed`), chronological full-width session cards, live `SessionCard` integration, and `DossierDialog` triggers.
- [x] Rebuilt **Counselor Analytics** (`/counselor/analytics`, Figma `678:17952`) with 3 KPI cards, horizontal `Top Student Concern Categories` bars, and vertical `Department Caseload Split` bars.
- [x] Rebuilt **Admin Appointment Audit** (`/admin/appointments`, Figma `678:21461`) wired directly to `admin_appointment_audit` (`STU-••••XXXX`), with 5-tab `PillTabs`, custom Figma `Select`, `AuditMetadataDialog` (`687:1222`), and real CSV export.

---

## Upcoming Milestones

- [ ] **Milestone 9 — Public Landing, Portal & Auth Pages 1:1 with Figma + Final Production Release (`dev` → `main`)**: Align `/home` (`678:15853`), `/portal` (`678:16414`), and `/auth/*` (`678:16931`) to Figma, run responsive `390px`/`768px`/`1440px` Light/Dark QA, and promote `dev` → `main`.
