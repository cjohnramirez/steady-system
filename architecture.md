# Project Architecture Guide

## 3.4 System Development

### 3.4.1 Hardware Requirements

The system can be developed and deployed on a variety of hardware configurations. The choice of hardware depends on the scale of deployment, expected traffic, and performance requirements. Below are the recommended hardware specifications for different deployment scenarios.

#### Development Machine

For local development, a standard modern computer is sufficient. Developers need enough resources to run the Next.js dev server, Supabase services (if running locally), and a code editor simultaneously. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

| Component | Specification |
|-----------|---------------|
| **Processor** | Multi-core processor (Intel i5/i7 or AMD Ryzen 5/7 equivalent or better) |
| **RAM** | 8 GB minimum; 16 GB recommended for smooth multitasking |
| **Storage** | 256 GB SSD minimum; fast read/write speeds essential for node_modules and local database |
| **Network** | Stable internet connection (required for Supabase, npm packages, and cloud services) |
| **Operating System** | Windows, macOS, or Linux (development tools are cross-platform) |

#### Staging/Testing Environment

Used for pre-production testing and validation before releasing to production. Hardware specifications should be similar to production but scaled down based on expected testing load.

| Component | Specification |
|-----------|---------------|
| **Processor** | Dual-core to quad-core virtual CPU (if cloud-hosted) |
| **RAM** | 2-4 GB (sufficient for Node.js server and middleware) |
| **Storage** | 50-100 GB SSD (logs, cached data, temporary files) |
| **Scalability** | Auto-scaling groups or Kubernetes for handling variable load |
| **Redundancy** | Optional backup and failover mechanisms |

#### Production Deployment

For the live application serving real users. The production environment leverages managed cloud services for scalability and reliability.

| Component | Specification |
|-----------|---------------|
| **Frontend Hosting** | Vercel edge network (serverless); hardware managed by Vercel |
| **Backend Database** | Supabase managed PostgreSQL on AWS/GCP cloud infrastructure |
| **Load Balancing** | Automatic via Vercel and Supabase; multi-region failover capability |
| **Storage** | Supabase Storage with geographic redundancy |
| **Monitoring** | Real-time alerts, performance metrics, error tracking via Vercel and Supabase dashboards |
| **Backup & Recovery** | Automatic daily backups with point-in-time recovery |

### 3.4.2 Software Requirements

The system is built on a modern web technology stack with carefully selected tools and frameworks. Each component serves a specific purpose in the development, testing, deployment, and runtime of the application. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

#### Frontend Stack

| Tool | Purpose |
|------|---------|
| **Next.js (14+)** | React framework for server-side rendering, API routes, and static generation. Provides the foundation for the full-stack application with App Router for file-based routing and server actions for secure mutations. |
| **React (19+)** | UI library for building interactive components and managing client-side state. Core of the frontend user interface with hooks and context API for state management. |
| **TypeScript (5+)** | Superset of JavaScript with static typing. Prevents runtime type errors and improves code maintainability, IDE support, and developer experience with autocomplete and refactoring tools. |
| **Tailwind CSS (3+)** | Utility-first CSS framework for rapid UI development. Enables consistent styling without writing custom CSS; built-in responsive design and dark mode support. |
| **Radix UI (latest)** | Unstyled, accessible component library. Provides primitive components (Dialog, Select, Table, Popover) that are styled with Tailwind; prioritizes accessibility with ARIA attributes. |
| **Lucide Icons (latest)** | Icon library with clean, consistent SVG icons. Used throughout the UI for visual clarity; tree-shakeable for minimal bundle size. |
| **React Query (5+)** | Data fetching and caching library (TanStack Query). Manages server state, automatic re-fetching, background synchronization, and optimistic updates without boilerplate. |
| **React Table (8+)** | Headless table component library (TanStack Table). Powers data tables with pagination, sorting, filtering, and column resizing without predefined styling. |
| **Zod (latest)** | TypeScript-first schema validation library. Validates form inputs, API responses, and ensures type safety at runtime with clear error messages. |
| **date-fns (3+)** | Date utility library for parsing, formatting, and manipulating dates. Used in appointment scheduling, calendar features, and timestamp conversions. |
| **Sonner (latest)** | Toast notification library. Displays success, error, and info messages with smooth animations and auto-dismiss functionality. |

#### Backend Stack

| Tool | Purpose |
|------|---------|
| **Supabase (latest)** | Open-source Firebase alternative providing PostgreSQL database, authentication, real-time subscriptions, and storage. Includes built-in features for RLS, edge functions, and webhook support. |
| **PostgreSQL (14+)** | Relational database engine. Stores all application data (users, appointments, articles) with ACID compliance, JSON support, and full-text search capabilities. |
| **Supabase Auth (built-in)** | Authentication service managing user registration, login, password reset, email verification, and JWT token generation. Supports email/password and OAuth providers. |
| **Supabase Realtime (built-in)** | WebSocket-based real-time database subscriptions enabling live updates when data changes (new appointments, messages, announcements). |
| **Supabase Storage (built-in)** | File storage service for user uploads (images, documents, videos) with RLS policies for access control and signed URL support. |
| **Node.js (18+)** | JavaScript runtime for server-side execution. Next.js server actions run on a Node.js server for secure database operations and API calls. |

#### Build & Development Tools

| Tool | Purpose |
|------|---------|
| **pnpm (8+)** | Package manager faster and more efficient than npm. Manages dependencies with monorepo-friendly lock file and disk-space optimization. |
| **ESLint (8+)** | JavaScript/TypeScript linter enforcing code quality rules. Catches common mistakes and style inconsistencies before runtime. |
| **PostCSS (8+)** | CSS transformation tool used with Tailwind CSS to process utility classes, autoprefixer, and optimize the final CSS bundle. |
| **Prettier (optional)** | Code formatter ensuring consistent code style across the team; integrates with VS Code for auto-formatting on save. |

#### Testing & Quality Assurance

| Tool | Purpose |
|------|---------|
| **Cypress (13+)** | End-to-end testing framework testing user workflows across the entire application (UI interactions, API calls, database operations). |
| **Jest (optional)** | Unit testing framework testing individual functions, components, and utilities in isolation with fast execution and great developer experience. |
| **Playwright (optional)** | Cross-browser testing tool testing the application on Chrome, Firefox, Safari, and mobile browsers for broad compatibility coverage. |

#### Deployment & DevOps

| Tool | Purpose |
|------|---------|
| **Vercel (latest)** | Deployment platform for Next.js applications providing serverless functions, edge caching, auto-scaling, and integrated CI/CD with GitHub. |
| **GitHub (latest)** | Version control and CI/CD platform hosting the repository and running automated tests on pull requests before merge. |
| **GitHub Actions (built-in)** | CI/CD workflow automation running linters, tests, and deploying code on push/merge events with customizable workflows. |

#### Development Environment

| Tool | Purpose |
|------|---------|
| **VS Code (latest)** | Code editor with IntelliSense, debugging, and extensive extension support; industry standard for web development. |
| **Git (2.40+)** | Version control system tracking code changes, enabling collaboration, and maintaining project history with branching and merging. |
| **.env.local (local)** | Local environment file (not committed to version control) storing sensitive variables like API keys and database credentials for development. |
| **npm/pnpm (latest)** | Package management tools installing and managing project dependencies from npm registry with lock files for reproducible builds. |

### 3.4.3 Technology Stack Justification

#### Why Next.js?
Next.js combines the power of React with server-side capabilities. It allows seamless integration of server actions, making it easy to fetch data securely and handle mutations without exposing API endpoints. Server components optimize performance by rendering on the server.

#### Why Supabase?
Supabase provides a complete backend-as-a-service with PostgreSQL, authentication, real-time subscriptions, and file storage. It eliminates the need to manage separate services for database, auth, and storage while providing RLS for security.

#### Why TypeScript?
TypeScript catches type errors at compile time, reducing runtime bugs and improving code documentation. It's essential for a large application where many developers contribute; refactoring becomes safer with type information.

#### Why Tailwind CSS + Radix UI?
Tailwind's utility-first approach enables rapid UI development with consistent styling, while Radix UI provides accessible, unstyled primitives that respect the design system. Together, they balance speed with customization and accessibility.

#### Why React Query + React Table?
React Query manages server state and caching efficiently, reducing boilerplate code for data fetching. React Table (TanStack Table) provides a headless table library that doesn't impose styling, allowing full customization with Tailwind.

#### Why Zod?
Zod provides runtime schema validation, ensuring that data conforms to expected types even if TypeScript types are bypassed. It's essential for validating user input and API responses with clear, user-friendly error messages.

### 3.4.4 Development Workflow

1. **Setup:** Clone repository, install dependencies with `pnpm install`, configure `.env.local` with Supabase credentials.
2. **Development Server:** Run `pnpm dev` to start Next.js in development mode (port 3000 or next available).
3. **Coding:** Edit code in VS Code; hot module replacement updates the browser automatically on file save.
4. **Testing:** Run `pnpm test` (if Jest configured) or `pnpm cypress:open` for end-to-end tests.
5. **Linting:** Run `pnpm lint` to check code quality; fix issues with `pnpm lint --fix`.
6. **Commit:** Use `git commit` to version changes following conventional commit messages (feat:, fix:, docs:, etc.).
7. **Push & PR:** Push to feature branch and open a pull request for code review on GitHub.
8. **CI/CD:** GitHub Actions automatically runs linter and tests; PR must pass before merging.
9. **Merge:** After review and approval, merge to `dev` branch; automated tests and preview deployment begin.
10. **Deploy:** Vercel automatically deploys merged code to production on merge to `main`; rollback available if needed.

### 3.4.5 Performance Considerations

- **Code Splitting:** Next.js automatically splits code by route, reducing initial load time and enabling faster page transitions.
- **Image Optimization:** Next.js `Image` component optimizes images on-the-fly, resizing and compressing based on device; supports WebP format.
- **Caching Strategies:** React Query caches data with configurable stale times; Supabase Realtime pushes updates instead of polling, reducing bandwidth.
- **Database Indexing:** PostgreSQL indexes on frequently queried columns (e.g., `user_id`, `status`, `appointment.scheduled_at`) improve query performance significantly.
- **RLS Policies:** Row-level security in Supabase ensures queries only return authorized data, reducing data transfer and improving response times.
- **Edge Functions:** Vercel edge functions enable middleware and request transformations at the edge, reducing latency.
- **Lazy Loading:** React components can be dynamically imported, loading only when needed to reduce initial bundle size.

### 3.4.6 Security Considerations

- **Environment Variables:** Sensitive keys (Supabase service role) are never exposed to the frontend; only public keys and `NEXT_PUBLIC_` variables are accessible in browser.
- **Authentication:** Supabase Auth manages user credentials securely using bcrypt hashing; JWT tokens verify user identity for API requests.
- **RLS Policies:** Database-level security ensures users cannot access data they don't own, even if the frontend is compromised.
- **HTTPS:** All communication is encrypted in transit; Vercel provides automatic SSL certificates and HTTP/2 support.
- **CORS:** Supabase is configured to only accept requests from allowed origins (your Vercel deployment) using origin whitelisting.
- **SQL Injection Prevention:** Supabase SDK uses parameterized queries, preventing SQL injection attacks through proper escaping.
- **CSRF Protection:** Next.js and Supabase implement CSRF tokens and SameSite cookie policies to prevent cross-site attacks.
- **Rate Limiting:** Vercel and Supabase enforce rate limiting on API requests to prevent abuse and denial-of-service attacks.
- **Secrets Management:** Sensitive values are stored in Vercel project settings and Supabase dashboard; never hardcoded or committed to version control.

`src/` — Main source code. Contains all application logic, UI components, pages, hooks, types, and utilities.
  - `app/` — Next.js App Router pages and layouts, organized by feature:
    - `admin/` — Admin dashboard, accounts, appointments, settings, etc.
    - `auth/` — Authentication (login, signup, confirm, etc.).
    - `counselor/` — Counselor portal and related pages.
    - `home/` — Home page and navigation.
    - `misc/` — Miscellaneous pages (privacy policy, meet the developers, etc.).
    - `portal/` — Student portal, articles, announcements, playlists, etc.
    - `student/` — Student dashboard, appointments, profile, etc.
    - `assets/` — Static assets used in app pages.
  - `components/` — Shared React components:
    - `ui/` — UI primitives (button, dialog, table, etc.).
    - Form fields, navigation, modals, etc.
  - `hooks/` — Custom React hooks for state and logic (auth-store, confirm-store, etc.).
  - `lib/` — Utility functions and helpers (formatting, general utils).
  - `types/` — TypeScript type definitions (main types, supabase types).
  - `utils/` — Supabase client/server utilities and proxy helpers.
  - `assets/` — Static assets (images, icons, etc.).
`public/` — Static files served directly:
  - Images, favicon, manifest, robots.txt, etc.