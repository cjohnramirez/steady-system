# 📌 GCS Management and Landing Page System

A **Next.js 16** web application for a Guidance Counseling System (GCS) built as a school project.  
This repository follows a two-branch workflow (`main` and `dev`) and uses **GitHub Actions** for CI/CD with **Vercel** for staging and production deployments.

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **UI** | React 19, Tailwind CSS, Radix UI |
| **State Management** | Zustand, TanStack React Query |
| **Forms** | TanStack React Form, Zod validation |
| **Database** | Supabase (PostgreSQL with Row-Level Security) |
| **Authentication** | Supabase Auth |
| **Charts** | Recharts |
| **Package Manager** | pnpm |
| **Deployment** | Vercel |

---

## 🚀 Project Workflow

We follow a simple branching strategy to keep the codebase clean and organized:

| Branch | Purpose |
|--------|---------|
| `main` | **Production-ready** code. Deploys to **Vercel Production**. |
| `dev` | **Integration & testing** branch. Deploys to **Vercel Staging**. |

### 🔧 GitHub Actions CI/CD

- **On every Pull Request to `main` or `dev`** → Run ESLint, Prettier, and TypeScript type checking.
- **On merge to `dev`** → Build & deploy automatically to **Vercel Staging**.
- **On merge to `main`** → Deploy automatically to **Vercel Production**.

---

## 🖊️ Commit Message Rules

We use **Conventional Commits** for clarity and future automation (changelog generation, CI triggers).

| Type | Usage |
|------|-------|
| `feat:` | New feature (e.g., `feat: add appointment booking API`) |
| `fix:` | Bug fix |
| `docs:` | Documentation updates |
| `style:` | UI/style changes (no logic changes) |
| `chore:` | Config/build/dependency updates |
| `refactor:` | Code restructuring without changing functionality |

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
Ensure you have **Node.js 20+** and **pnpm** installed.
```bash
pnpm install
```

### 4️⃣ Setup Environment Variables
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5️⃣ Run the Development Server
```bash
pnpm dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Run TypeScript type checking |

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
│   └── ui/               # Base UI components (button, input, dialog, etc.)
├── hooks/                 # Custom React hooks (auth-store, confirm-store)
├── lib/                   # Utility functions (format.ts, utils.ts)
├── types/                 # TypeScript type definitions
└── utils/                 # Supabase client utilities
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Student** | Book appointments, view portal articles, manage profile |
| **Counselor** | Manage availability, view/complete appointments |
| **Admin** | Full system access, manage users, appointments, and content |

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
- Keep `.env.local` secure — never commit it.
- Follow commit message rules to maintain a clean history.
- This project uses **pnpm** exclusively (enforced via preinstall script).

---

## 👥 Contributors

| Name | Role |
|------|------|
| John Carl Ramirez | Lead Developer |

---

## 📄 License

This project is for educational purposes only.