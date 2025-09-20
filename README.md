# 📌 Project Name

A Next.js-based web application built as a school project.  
This repository follows a two-branch workflow (`main` and `dev`) and uses **GitHub Actions** for CI/CD with **Vercel** for staging and production deployments.

---

## 🚀 Project Workflow

We follow a simple branching strategy to keep the codebase clean and organized:

| Branch | Purpose |
|--------|---------|
| `main` | **Production-ready** code. Deploys to **Vercel Production**. |
| `dev` | **Integration & testing** branch. Deploys to **Vercel Staging**. |

### 🔧 GitHub Actions CI/CD

- **On every Pull Request to `dev`** → Run automated tests.
- **On merge to `dev`** → Build & deploy automatically to **Vercel Staging**.
- **On merge to `main`** → Deploy automatically to **Vercel Production** (only after milestone approval).

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
git clone https://github.com/your-org/project-name.git
cd project-name
```

### 2️⃣ Switch to the dev Branch
```bash
git checkout dev
```

### 3️⃣ Install Dependencies
Ensure you have Node.js 18+ installed.
Then install project dependencies:
```bash
npm install
```

### 4️⃣ Setup Environment Variables
Create a `.env.local` file in the root directory and copy variables from `.env.example`.
Fill in your API keys and secrets.

### 5️⃣ Run the Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔄 Development Workflow

1. Work directly on `dev` branch (no feature branches for now).
2. Commit using Conventional Commits.
3. Push changes to `dev` → CI/CD will deploy automatically to staging.
4. Once a milestone is ready, merge `dev` → `main` → deployed to production.

---

## 📦 Deployment

- **Staging:** Automatically deployed on every `dev` branch update.
- **Production:** Manually approved merge from `dev` to `main` → auto deploy.

---

## 🧾 Notes

- Make sure to run tests before pushing (`npm run test`).
- Keep `.env.local` secure — never commit it.
- Follow commit message rules to maintain a clean history.

---

## 👥 Contributors

| Name | Role |
|------|------|
| Your Name | Developer |
| Team Member | QA/Support |

---

## 📄 License

This project is for educational purposes only.