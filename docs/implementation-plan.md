# Steady (GCS) v2 — Architecture & Implementation Plan

## Overview

Steady is a campus **Guidance & Counselling Service (GCS)** platform built with **Next.js 16 (App Router + Turbopack)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui (Radix)**, **Supabase (Postgres + Auth + RLS + Realtime)**, **Cloudinary**, and **`motion` (`motion/react` + `LazyMotion`)**.

The platform covers 4 areas:

1. **Public / Auth / Legal** (`/home`, `/portal`, `/auth/*`, `/misc/*`)
2. **Student Workspace** (`/student`, `/student/appointment`, `/student/appointments`, `/student/wellness`, `/student/profile`)
3. **Counselor Workspace** (`/counselor`, `/counselor/appointments`, `/counselor/students`, `/counselor/availability`, `/counselor/analytics`)
4. **Admin Console** (`/admin/dashboard`, `/admin/appointments`, `/admin/accounts`, `/admin/landing`, `/admin/settings`)

---

## Key Architecture Decisions

### 1. Component System — 3-Tier Hybrid (Radix/shadcn + Steady Composable Layer)

- **Tier 1 (Primitives):** Radix-backed primitives in `src/components/ui/*` styled to the Figma Login Section tokens (`rounded-[25px]` pill buttons/inputs, `rounded-[20px]` cards/dialogs, `shadow-steady-pill`, `shadow-steady-card`).
- **Tier 2 (Steady Composable Blocks):** Compound, domain-focused components (`RoleSidebar`, `PrivacyShield`, `PillTabs`, `Stepper`, `SessionCard`, `ActionPlanCard`, `WarmReferralDialog`, `DossierDialog`, `BreathingPacerDialog`, `ArticleReaderDialog`, `CounselorDetailsDialog`, `CrisisSupportDialog`).
- **Global Theme Variables:** Exact Figma brand/semantic palette (`#2b7fff`, `#00bc7d`, `#fb2c36`, `#ff6900`, `#f3f4f6`, `#ffffff`, `#e5e7eb`) is defined once in `src/app/globals.css` (`:root` + `.dark`) so palette tuning requires changing only a handful of CSS variables.

### 2. Animations & Transitions — `motion` (`LazyMotion` + `m`)

- Root `src/app/providers.tsx` wraps the app in `<MotionConfig reducedMotion="user"><LazyMotion features={loadMotionFeatures} strict>`.
- GPU-composited properties only (`opacity`, `transform`, `scale`, `layoutId`); heavy interactive dialogs (`BreathingPacerDialog`) are dynamically imported (`next/dynamic`).

### 3. Deployment & Portability — Vercel Primary + Docker Escape Hatch

- Primary deployment runs on **Vercel** via `.github/workflows/preview.yml` (`dev` branch & PRs) and `.github/workflows/production.yml` (`main` branch).
- `next.config.ts` supports `NEXT_OUTPUT=standalone` for zero-change migration to Docker / Railway / self-hosted campus infrastructure.

### 4. Security & Privacy (RA 11036 & RA 10173)

- **Row-Level Security (RLS):**
  - `clinical_note` (SOAP/SAP) is counselor-only (`counselor_id = auth.uid()`). Admins and students have zero `SELECT` access.
  - `action_item` allows students to read and toggle `is_completed` only (enforced by Postgres trigger + RLS).
  - `admin_appointment_audit` (`security_invoker = on`) exposes only obfuscated student codes (`STU-••••XXXX`), never raw clinical notes or reasons.
- **HTTP Headers:** `next.config.ts` sets `CSP`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`.
- **Desk/Campus Privacy Shield:** Global `P` hotkey blurs `.privacy-sensitive` elements with zero layout shift.

### 5. Real-Time Notifications — Supabase Realtime + Postgres Triggers

- Uses existing Supabase Realtime + PostgreSQL triggers + `public/sw.js` (no external PII relay).
- Privacy-safe lock-screen text for appointment updates, warm referrals, and assigned action plan steps.

---

## Wave Plan

1. **Wave 1 — Database, RLS & Clinical Validation:** Supabase v2 migrations (`clinical_note`, `action_item`, `warm_referral`, `admin_appointment_audit`), live RLS verification (`scripts/db/verify.mjs` — 32 checks), regenerated types, Zod 4 schemas.
2. **Wave 2 — Global Theme Tokens, Motion Engine & Tier-1 Primitives:** `Instrument Sans`, CSS variables, `motion` engine, pill buttons/inputs/dialogs/cards/badges.
3. **Wave 3 — Tier-2 Composable App Shell & Feature Components:** Collapsible `RoleSidebar` + mobile drawer, `PrivacyShield`, `PillTabs`, `Stepper`, `SessionCard`, `ActionPlanCard`, `WarmReferralDialog`, `DossierDialog`, `BreathingPacerDialog`, `ArticleReaderDialog`, `CounselorDetailsDialog`, `CrisisSupportDialog`, upgraded `NotificationBell`, live `/dev/components` showcase.
4. **Wave 4 — Public, Auth, Legal, SEO & Security:** `sitemap.ts`, `robots.ts`, JSON-LD on `/home`, security headers/CSP, Vercel preview/production CI, Auth & Landing polish.
5. **Wave 5 — Student & Counselor Workspaces:** Live clinical server actions, `/student/wellness`, `/student/appointments`, `/student/profile`, `/counselor/appointments`, `/counselor/students`, `/counselor/availability`, `/counselor/analytics`.
6. **Wave 6 — Admin Console & End-to-End QA:** Obfuscated audit table (`STU-••••XXXX`), Admin Analytics & CMS polish, responsive `390px`–`1440px` + Light/Dark verification.
