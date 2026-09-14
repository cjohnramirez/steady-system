# 📌 Steady

A **Next.js 16** web application for student guidance and counseling, built as a school project.  
This repository follows a two-branch workflow (`main` and `dev`) and uses **GitHub Actions** for CI/CD with **Vercel** for staging and production deployments.

---

## 🛠️ Tech Stack

| Category             | Technologies                                  |
| -------------------- | --------------------------------------------- |
| **Framework**        | Next.js 16 (App Router, Turbopack)            |
| **Language**         | TypeScript                                    |
| **UI**               | React 19, Tailwind CSS, Radix UI              |
| **State Management** | Zustand, TanStack React Query                 |
| **Forms**            | TanStack React Form, Zod validation           |
| **Database**         | Supabase (PostgreSQL with Row-Level Security) |
| **Authentication**   | Supabase Auth                                 |
| **Charts**           | Recharts                                      |
| **Package Manager**  | pnpm                                          |
| **Deployment**       | Vercel                                        |

---

## 🚀 Project Workflow

We follow a simple branching strategy to keep the codebase clean and organized:

| Branch | Purpose                                                          |
| ------ | ---------------------------------------------------------------- |
| `main` | **Production-ready** code. Deploys to **Vercel Production**.     |
| `dev`  | **Integration & testing** branch. Deploys to **Vercel Staging**. |

### 🔧 GitHub Actions CI/CD

- **On every Pull Request to `main` or `dev`** → Run ESLint, Prettier, and TypeScript type checking.
- **On merge to `dev`** → Build & deploy automatically to **Vercel Staging**.
- **On merge to `main`** → Deploy automatically to **Vercel Production**.

---

## 🖊️ Commit Message Rules

We use **Conventional Commits** for clarity and future automation (changelog generation, CI triggers).

| Type        | Usage                                                   |
| ----------- | ------------------------------------------------------- |
| `feat:`     | New feature (e.g., `feat: add appointment booking API`) |
| `fix:`      | Bug fix                                                 |
| `docs:`     | Documentation updates                                   |
| `style:`    | UI/style changes (no logic changes)                     |
| `chore:`    | Config/build/dependency updates                         |
| `refactor:` | Code restructuring without changing functionality       |

✅ **Example:**

```bash
git commit -m "feat: implement login page with form validation"
```

---

## 🛠️ Installation Guide

Follow these steps to run the project locally:

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/cjohnramirez/GCS-Management-and-Landing-Page-System.git
cd GCS-Management-and-Landing-Page-System
```

### 2️⃣ Switch to the dev Branch

```bash
git checkout dev
```

### 3️⃣ Install Dependencies

Ensure you have **Node.js 22+** and **pnpm** installed.

```bash
pnpm install
```

### 4️⃣ Setup Environment Variables

Copy `.env.example` to `.env.local` and fill it in. The app checks these on startup and
names anything missing.

### 5️⃣ Set Up the Database

Migrations live in `supabase/migrations` and demo data in `supabase/seeds`. Docker is not
required. With `SUPABASE_DB_URL` set:

```bash
node scripts/db/push.mjs                  # apply pending migrations
node scripts/db/push.mjs --include-seed   # ...and load demo data (never in production)
npx supabase login                        # once, for the two commands below
node scripts/db/gen-types.mjs             # regenerate src/types/supabase.ts
node scripts/db/verify.mjs                # check row-level security and triggers
```

In the Supabase dashboard:

- **Authentication, URL configuration:** add `<app url>/auth/callback` and
  `<app url>/auth/confirm` to the redirect URLs.
- **Authentication, Hooks (optional):** point the custom access token hook at
  `public.custom_access_token_hook`. It saves a query per request; the app works
  without it.

Seeded accounts all use the password `Password123!`: `admin@steady.test`,
`counselor@steady.test` to `counselor8@steady.test`, `student@steady.test`, `student2@steady.test` and
`student001@steady.test` to `student150@steady.test`.

Placeholder photos: `node scripts/seed/download-images.mjs`, then
`node scripts/seed/upload-images.mjs` (uploads to Cloudinary and regenerates
`supabase/seeds/25_images.sql`).

### 6️⃣ Run the Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📜 Available Scripts

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `pnpm dev`        | Start development server with Turbopack |
| `pnpm build`      | Build for production                    |
| `pnpm start`      | Start production server                 |
| `pnpm lint`       | Run ESLint                              |
| `pnpm format`     | Format code with Prettier               |
| `pnpm type-check` | Run TypeScript type checking            |
| `pnpm test`       | Run unit tests                          |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel (accounts, appointments, dashboard, landing, settings)
│   ├── auth/              # Authentication (login, signup, confirm)
│   ├── counselor/         # Counselor dashboard
│   ├── home/              # Landing/home page
│   ├── portal/            # Student portal with articles
│   ├── student/           # Student dashboard & appointment booking
│   └── misc/              # Miscellaneous pages (privacy policy, developers)
├── components/            # Reusable UI components
│   ├── app/              # Shared app components (SectionCard, PageHeader, ...)
│   └── ui/               # shadcn primitives
├── hooks/                 # Custom React hooks (auth-store, confirm-store)
├── lib/                   # Data (queries.ts / actions.ts per domain), validation, auth
├── types/                 # TypeScript type definitions
└── utils/                 # Supabase client utilities
```

---

## 👥 User Roles

| Role          | Access                                                      |
| ------------- | ----------------------------------------------------------- |
| **Student**   | Book appointments, view portal articles, manage profile     |
| **Counselor** | Manage availability, view/complete appointments             |
| **Admin**     | Full system access, manage users, appointments, and content |

---

## 🔄 Development Workflow

1. Work on the `dev` branch for new features/fixes.
2. Commit using Conventional Commits.
3. Push changes to `dev` → CI/CD will run checks and deploy to staging.
4. Create a PR from `dev` → `main` for production deployment.

---

## 📦 Deployment

- **Staging:** Automatically deployed on every `dev` branch update.
- **Production:** Deployed on merge to `main` after CI checks pass.

---

## 🧾 Notes

- Run `pnpm type-check` before pushing to catch TypeScript errors.
- UI work follows [docs/ui-guidelines.md](docs/ui-guidelines.md).
- Keep `.env.local` secure — never commit it.
- Follow commit message rules to maintain a clean history.
- This project uses **pnpm** exclusively (enforced via preinstall script).

---

## 👥 Contributors

| Name                    | Role                                          | Email                               |
| ----------------------- | --------------------------------------------- | ----------------------------------- |
| Gerlie Campion          | Technical Writer and Documentation Specialist | campiongerlie18@gmail.com           |
| Francis Adrian Esteban  | Quality Assurance (QA) and Tester             | francisadrian.esteban@1.ustp.edu.ph |
| Jhey Gulde              | Backend Developer and System Architect        | gulde.jhey8@gmail.com               |
| Kathleen Grace Gultiano | UI/UX Designer                                | gultiano.kathleengrace@gmail.com    |
| John Carl Ramirez       | Project Manager and Full-Stack Developer      | johncarl.ramirez.dev@gmail.com      |

---

## 📄 License

This project is for educational purposes only.
