# Intilaqa / انطلاقة

Intilaqa is a bilingual HRMS platform for managing the relationship between admins, clients, companies, and employees. It combines role-based dashboards, attendance, requests, documents, payroll, tasks, notifications, reports, and configurable branding in one Arabic and English experience.

## Highlights

- Role-based workspaces for admins, clients, companies, and employees
- Arabic RTL and English LTR support with `next-intl`
- Attendance, shifts, overtime, requests, documents, compliance, payroll, and payslips
- Tasks, notifications, reports, settings, and branding workflows
- Prisma data layer with PostgreSQL and a NextAuth credentials flow
- Monorepo structure that keeps shared UI, auth, config, i18n, schemas, and database code reusable
- Integration-ready service boundaries for Qiwa, Mudad, GOSI, SMS, payments, and biometric devices

## Stack

- Next.js 15 App Router
- TypeScript 5
- PostgreSQL and Prisma 6
- NextAuth.js v5
- `next-intl`
- Tailwind CSS and Lucide React
- pnpm and Turborepo

## Local development

### Requirements

- Node.js 20 or newer
- pnpm 11 or newer
- PostgreSQL 14 or newer

### Setup

```bash
cp .env.example .env
```

Set `DATABASE_URL` and a long random `AUTH_SECRET` in `.env`, then install dependencies and prepare the database:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The seed data is for local development only. Replace demo passwords and secrets before deploying anywhere.

## Main routes

- `/ar/login` — Arabic login
- `/en/login` — English login
- `/ar/admin` — Admin workspace
- `/ar/client` — Client workspace
- `/ar/company` — Company workspace
- `/ar/employee` — Employee workspace

## Repository layout

```text
apps/web/       Next.js application
packages/auth/  NextAuth configuration and role guards
packages/config Shared application settings and design tokens
packages/db     Prisma schema, migrations, and seed data
packages/i18n   Arabic and English messages
packages/shared Shared types and validation schemas
packages/ui     Reusable application components
tooling/        Shared TypeScript, ESLint, and Tailwind configuration
```

## Validation

```bash
pnpm typecheck
pnpm build
pnpm lint
```

## Security notes

- Never commit `.env` files or hosted database credentials.
- Keep `AUTH_SECRET` and `ENCRYPTION_KEY` in the deployment environment or a secrets manager.
- Demo seed accounts and passwords are intended for local development only.
- External integrations are architectural placeholders until their credentials and API access are configured.

## Docker

```bash
docker build -t intilaqa .
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e AUTH_SECRET="your-production-secret" \
  intilaqa
```
