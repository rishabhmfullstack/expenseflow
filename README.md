# ExpenseFlow

**ExpenseFlow** is a full-stack expense reimbursement platform with role-based approval workflows. Employees create and submit claims; managers and senior managers review them through a multi-stage approval chain; admins manage users, assignments, and reporting.

Built as a take-home assignment demonstrating production-oriented patterns: layered backend architecture, JWT authentication with refresh rotation, Prisma migrations, Next.js App Router with Server Components, React Query for client state, and automated workflow tests.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Roles](#roles)
- [Approval Workflow](#approval-workflow)
- [Database Schema](#database-schema)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Commands](#database-commands)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Overview](#api-overview)
- [Screenshots](#screenshots)
- [Tradeoffs](#tradeoffs)
- [Future Improvements](#future-improvements)
- [Submission Checklist](#submission-checklist)

---

## Project Overview

ExpenseFlow models a typical corporate expense reimbursement process:

1. **Employees** create draft claims, attach receipts, and submit for review.
2. **Managers** approve, reject, or send claims back to the employee for revision.
3. **Senior Managers** provide final approval or revert claims to the manager.
4. **Admins** manage users, reporting relationships, and view system-wide analytics.

Every state transition is recorded in an immutable **approval history** audit trail. Access is enforced at the API layer via JWT authentication and role-based authorization (RBAC).

---

## Architecture

```mermaid
flowchart TB
    subgraph Client["Browser"]
        UI["Next.js 16 App Router"]
        RQ["React Query"]
        Auth["Auth Provider + Cookies"]
    end

    subgraph Frontend["frontend/"]
        SC["Server Components\n(initial data fetch)"]
        CC["Client Components\n(forms, filters, mutations)"]
    end

    subgraph Backend["backend/"]
        API["Express 5 REST API"]
        MW["Middleware\n(auth, RBAC, validate, rate limit)"]
        SVC["Services"]
        REPO["Repositories"]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        FS["Local receipt storage\n/uploads/receipts"]
    end

    UI --> SC
    UI --> CC
    CC --> RQ
    RQ -->|Bearer JWT| API
    SC -->|Server fetch + cookie| API
    Auth -->|refresh token cookie| API

    API --> MW --> SVC --> REPO --> PG
    API --> FS
```

**Design highlights**

| Layer | Responsibility |
|-------|----------------|
| **Routes** | HTTP mapping, middleware composition |
| **Controllers** | Request/response handling |
| **Services** | Business logic, transactions, workflow rules |
| **Repositories** | Prisma data access |
| **Validators** | Zod schemas for body, query, and params |

The frontend uses **Server Components** for initial data loading and **Client Components** only where interactivity is required (forms, filters, dialogs, React Query mutations).

---

## Folder Structure

```
expenseflow/
├── docker-compose.yml          # PostgreSQL for local development
├── README.md
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models and enums
│   │   ├── seed.ts             # Demo users and hierarchy
│   │   └── migrations/         # Versioned SQL migrations
│   ├── src/
│   │   ├── app.ts              # Express app factory
│   │   ├── index.ts            # Server entry point
│   │   ├── config/             # Env, database, uploads
│   │   ├── controllers/        # HTTP handlers
│   │   ├── middlewares/        # Auth, RBAC, validation, uploads
│   │   ├── repositories/       # Prisma queries
│   │   ├── routes/             # Route definitions
│   │   ├── services/           # Business logic
│   │   ├── types/              # Shared TypeScript types
│   │   ├── utils/              # JWT, pagination, mappers
│   │   └── validators/         # Zod schemas
│   └── tests/                  # Jest + Supertest integration tests
│
└── frontend/
    ├── src/
    │   ├── app/                # Next.js routes (Server Component pages)
    │   ├── components/         # UI, forms, filters, page content
    │   ├── hooks/              # Custom React hooks
    │   ├── lib/                # API client, auth, server queries
    │   ├── providers/          # Auth, React Query, toast
    │   ├── schemas/            # Zod form/filter schemas
    │   ├── services/           # API service layer
    │   ├── types/              # Frontend types
    │   └── __tests__/          # React Testing Library tests
    └── public/
```

---

## Roles

| Role | Capabilities |
|------|-------------|
| **Employee** | Create/edit draft claims, upload receipts, submit/resubmit, view own claims and approval history |
| **Manager** | Review pending claims for direct reports, approve/reject/revert to employee, view action history |
| **Senior Manager** | Final approval stage for manager-forwarded claims, reject, revert to manager |
| **Admin** | CRUD users, assign employees → managers and managers → senior managers, view all claims, monthly summary |

Reporting hierarchy is stored on `User.managerId`. An employee must have an assigned manager before submitting a claim.

---

## Approval Workflow

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Employee creates claim

    DRAFT --> PENDING_MANAGER: Submit
    REVERTED_TO_EMPLOYEE --> PENDING_MANAGER: Resubmit

    PENDING_MANAGER --> PENDING_SENIOR_MANAGER: Manager approves
    PENDING_MANAGER --> APPROVED: Manager approves\n(no senior manager)
    PENDING_MANAGER --> REJECTED: Manager rejects
    PENDING_MANAGER --> REVERTED_TO_EMPLOYEE: Manager reverts

    PENDING_SENIOR_MANAGER --> APPROVED: Senior Manager approves
    PENDING_SENIOR_MANAGER --> REJECTED: Senior Manager rejects
    PENDING_SENIOR_MANAGER --> REVERTED_TO_MANAGER: Senior Manager reverts

    REVERTED_TO_MANAGER --> PENDING_SENIOR_MANAGER: Manager re-approves

    APPROVED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
```

**Key rules**

- Claims are editable only in `DRAFT` or `REVERTED_TO_EMPLOYEE`.
- Submit/resubmit requires an active assigned manager.
- Manager approval forwards to the senior manager when one exists in the reporting chain; otherwise the claim is fully approved.
- Every action writes an `ApprovalHistory` record (`SUBMITTED`, `RESUBMITTED`, `APPROVED`, `REJECTED`, `REVISION_REQUESTED`).

---

## Database Schema

| Model | Purpose |
|-------|---------|
| **User** | Accounts with role, manager relationship, active flag |
| **Claim** | Expense record — amount, category, description, receipt, status, `pendingWith` |
| **ApprovalHistory** | Immutable audit log of workflow actions |
| **RefreshToken** | Hashed refresh tokens with expiry and revocation |

**Enums**

- `Role`: `EMPLOYEE`, `MANAGER`, `SENIOR_MANAGER`, `ADMIN`
- `ClaimStatus`: `DRAFT`, `PENDING_MANAGER`, `PENDING_SENIOR_MANAGER`, `REVERTED_TO_EMPLOYEE`, `REVERTED_TO_MANAGER`, `APPROVED`, `REJECTED`, `CANCELLED`
- `ExpenseCategory`: `TRAVEL`, `MEALS`, `ACCOMMODATION`, `SUPPLIES`, `SOFTWARE`, `TRAINING`, `OTHER`
- `ApprovalAction`: `SUBMITTED`, `RESUBMITTED`, `APPROVED`, `REJECTED`, `REVISION_REQUESTED`, `CANCELLED`
- `ApprovalStep`: `MANAGER`, `SENIOR_MANAGER`, `ADMIN`

**Relationships**

```
User ──< Claim (employee)
User ──< Claim (pendingWith approver)
User ──< ApprovalHistory (actor)
User ──< RefreshToken
Claim ──< ApprovalHistory
User ──< User (manager / directReports)
```

---

## Tech Stack

| Area | Technologies |
|------|-------------|
| **Backend** | Node.js, Express 5, TypeScript, Prisma, PostgreSQL, Zod, JWT, bcrypt, Multer |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, React Query, React Hook Form, Zod, Axios |
| **Auth** | Access JWT (Bearer) + refresh token (httpOnly cookie, rotation on refresh) |
| **Testing** | Jest, Supertest (backend), React Testing Library (frontend) |
| **DevOps** | Docker Compose (PostgreSQL), ESLint |

---

## Installation

### Prerequisites

- **Node.js** 20+
- **npm** 10+
- **Docker** (recommended for PostgreSQL) or a local PostgreSQL 16 instance

### 1. Clone the repository

```bash
git clone <repository-url>
cd expenseflow
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:

- User: `expenseflow`
- Password: `expenseflow`
- Database: `expenseflow`

### 3. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit the files as needed (see [Environment Variables](#environment-variables)).

### 5. Initialize the database

```bash
cd backend
npm run db:migrate
npm run db:seed
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | API server port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://expenseflow:expenseflow@localhost:5432/expenseflow` |
| `JWT_ACCESS_SECRET` | Access token signing secret (min 32 chars) | — |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (min 32 chars) | — |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Global rate limit window | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `REFRESH_TOKEN_COOKIE_NAME` | Refresh cookie name | `refreshToken` |
| `COOKIE_SECURE` | Secure cookie flag (use `true` in production HTTPS) | `false` |
| `COOKIE_SAME_SITE` | SameSite policy | `lax` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api/v1` |

---

## Running the Application

Open two terminals:

**Backend** (port 4000):

```bash
cd backend
npm run dev
```

**Frontend** (port 3000):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

After seeding, log in with password **`password123`**:

| Email | Role |
|-------|------|
| `employee@expenseflow.com` | Employee |
| `manager@expenseflow.com` | Manager |
| `sm@expenseflow.com` | Senior Manager |
| `admin@expenseflow.com` | Admin |

---

## Database Commands

Run from `backend/`:

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply migrations (development)
npm run db:migrate

# Push schema without migration files (prototyping only)
npm run db:push

# Seed demo users and hierarchy
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

**Production migration:**

```bash
npx prisma migrate deploy
```

---

## Testing

**Backend** (Jest + Supertest, requires PostgreSQL):

```bash
cd backend
npm test
```

Covers authentication, JWT refresh rotation, submit/approve/reject/revert workflows, and RBAC.

**Frontend** (React Testing Library):

```bash
cd frontend
npm test
```

Covers create claim, submit/resubmit, manager approve, and senior manager revert flows.

---

## Deployment

### Backend

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Set strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (32+ characters).
3. Set `CORS_ORIGIN` to your frontend URL.
4. Set `COOKIE_SECURE=true` when serving over HTTPS.
5. Build and start:

```bash
cd backend
npm run db:generate
npx prisma migrate deploy
npm run build
npm start
```

6. Ensure the receipt upload directory is writable and persisted (or replace with S3/object storage in production).

**Suggested platforms:** Railway, Render, Fly.io, AWS ECS, or any Node.js host.

### Frontend

1. Set `NEXT_PUBLIC_API_URL` to the deployed API URL.
2. Build and start:

```bash
cd frontend
npm run build
npm start
```

**Suggested platforms:** Vercel, Netlify, or any Node.js host.

### Docker Compose (database only)

The included `docker-compose.yml` runs PostgreSQL only. For a full containerized stack, extend it with backend and frontend services and wire environment variables accordingly.

---

## API Overview

Base URL: `http://localhost:4000/api/v1`

All protected routes require `Authorization: Bearer <access_token>`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register employee account |
| `POST` | `/auth/login` | Login; returns access token + refresh cookie |
| `POST` | `/auth/refresh` | Rotate tokens (cookie or body) |
| `POST` | `/auth/logout` | Revoke refresh token |
| `GET` | `/auth/me` | Current user profile |

### Claims (Employee)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/claims` | List own claims (paginated, filterable) |
| `POST` | `/claims` | Create draft claim |
| `GET` | `/claims/:id` | Get own claim |
| `PATCH` | `/claims/:id` | Update editable claim |
| `DELETE` | `/claims/:id` | Delete editable claim |
| `POST` | `/claims/:id/submit` | Submit or resubmit for review |
| `GET` | `/claims/:id/history` | Approval history |

### Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/uploads/receipt` | Upload receipt file (multipart) |

### Manager

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/manager/claims` | List pending claims |
| `GET` | `/manager/claims/:id` | Get pending claim detail |
| `POST` | `/manager/claims/:id/approve` | Approve and forward |
| `POST` | `/manager/claims/:id/approve-after-revert` | Re-approve after SM revert |
| `POST` | `/manager/claims/:id/reject` | Reject with note |
| `POST` | `/manager/claims/:id/revert-to-employee` | Send back for revision |
| `GET` | `/manager/history` | Manager action history |

### Senior Manager

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/senior-manager/claims` | List pending claims |
| `GET` | `/senior-manager/claims/:id` | Get pending claim detail |
| `POST` | `/senior-manager/claims/:id/approve` | Final approval |
| `POST` | `/senior-manager/claims/:id/reject` | Reject with note |
| `POST` | `/senior-manager/claims/:id/revert-to-manager` | Revert to manager |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users` | List users |
| `POST` | `/admin/users` | Create user |
| `PATCH` | `/admin/users/:id` | Update user |
| `DELETE` | `/admin/users/:id` | Delete user |
| `POST` | `/admin/users/:id/deactivate` | Deactivate user |
| `POST` | `/admin/users/:id/assign-to-manager` | Assign employee to manager |
| `POST` | `/admin/users/:id/assign-to-senior-manager` | Assign manager to senior manager |
| `GET` | `/admin/claims` | List all claims |
| `GET` | `/admin/summary/monthly` | Monthly claimed vs approved summary |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check |

---

## Screenshots

> Replace placeholders with actual screenshots before submission.

| Screen | Description |
|--------|-------------|
| ![Employee Dashboard](docs/screenshots/employee-dashboard.png) | Employee dashboard with recent claims |
| ![Create Claim](docs/screenshots/create-claim.png) | New claim form with receipt upload |
| ![Manager Review](docs/screenshots/manager-review.png) | Manager claim review with approve/reject/revert |
| ![Approval History](docs/screenshots/approval-history.png) | Timeline of approval actions |
| ![Admin Users](docs/screenshots/admin-users.png) | Admin user management and assignments |
| ![Monthly Summary](docs/screenshots/monthly-summary.png) | Admin monthly summary report |

Create a `docs/screenshots/` folder and add PNG captures from the running app.

---

## Tradeoffs

| Decision | Rationale | Tradeoff |
|----------|-----------|----------|
| **Monorepo-style folders** (`backend/`, `frontend/`) | Clear separation, easy to deploy independently | No shared package for types; frontend duplicates API types |
| **Local file storage for receipts** | Simple setup for take-home scope | Not suitable for multi-instance production without shared storage |
| **JWT access + httpOnly refresh cookie** | Short-lived access tokens, secure refresh | Requires cookie/CORS configuration; SSR needs cookie mirroring |
| **Server Components + React Query** | Reduced hydration, fast initial paint | Dual data-fetch paths (server prefetch + client cache) |
| **Prisma ORM** | Type-safe queries, migrations | Heavier than raw SQL for complex reporting queries |
| **Express over Nest/Fastify** | Familiar, minimal boilerplate | Less built-in structure than framework-heavy alternatives |
| **Integration tests against real Postgres** | High confidence in workflow correctness | Slower tests; requires running database |

---

## Future Improvements

- [ ] Object storage (S3/R2) for receipt uploads with signed URLs
- [ ] Email/Slack notifications on status changes
- [ ] Policy engine (spending limits, category rules, auto-approval thresholds)
- [ ] Shared TypeScript package for API types between frontend and backend
- [ ] E2E tests with Playwright covering full browser flows
- [ ] OpenAPI/Swagger documentation generated from route schemas
- [ ] Refresh token `jti` claim to eliminate same-second token collisions
- [ ] Multi-currency support and finance export (CSV/PDF)
- [ ] Audit log retention policies and admin impersonation for support
- [ ] CI pipeline (lint, test, migrate check) on every pull request

---

## Submission Checklist

Use this checklist before submitting the take-home assignment:

- [ ] Repository is pushed to GitHub (or provided zip) with clear commit history
- [ ] Root `README.md` is complete (this file)
- [ ] `backend/.env.example` and `frontend/.env.local.example` are included (no secrets committed)
- [ ] Database migrations run cleanly on a fresh PostgreSQL instance
- [ ] Seed script creates demo accounts documented above
- [ ] Backend starts with `npm run dev` and passes `npm test`
- [ ] Frontend starts with `npm run dev` and passes `npm test`
- [ ] End-to-end workflow verified manually:
  - [ ] Employee creates and submits a claim
  - [ ] Manager approves or reverts
  - [ ] Senior Manager approves or reverts to manager
  - [ ] Admin can manage users and view summary
- [ ] Screenshots added under `docs/screenshots/`
- [ ] Deployment URLs documented (if deployed), or clear local setup instructions provided
- [ ] Known limitations and tradeoffs documented (see above)

---

## License

UNLICENSED — submitted as a take-home assignment. All rights reserved by the author unless otherwise agreed with the evaluator.
