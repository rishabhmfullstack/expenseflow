# ExpenseFlow — Backend API

REST API for ExpenseFlow, an expense management system with multi-level approval workflows.

Part of the [ExpenseFlow monorepo](../README.md). Pairs with the [frontend](../frontend/README.md).

## Table of Contents

- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Seed](#seed)
- [Run](#run)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Tradeoffs](#tradeoffs)
- [Future Improvements](#future-improvements)

---

## Architecture

Clean architecture with a strict request flow:

**Routes → Controllers → Services → Repositories → Prisma → PostgreSQL**

```mermaid
flowchart LR
  Client[Frontend / Client] --> Routes[Routes]
  Routes --> Controllers[Controllers]
  Controllers --> Services[Services]
  Services --> Repos[Repositories]
  Repos --> Prisma[Prisma]
  Prisma --> PG[(PostgreSQL)]
```

| Layer | Responsibility |
|---|---|
| **Routes** | HTTP endpoints, middleware wiring |
| **Controllers** | Parse requests, send JSON responses |
| **Services** | Business logic, authorization, transactions |
| **Repositories** | Database queries |
| **Validators** | Zod input validation |
| **Middlewares** | JWT auth, rate limiting, error handling |

### Tech Stack

Express 5 · TypeScript · Prisma · PostgreSQL · Zod · JWT · bcrypt · Helmet · CORS · cookie-parser

---

## Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma       # Database models and enums
├── src/
│   ├── config/           # Env validation, Prisma client
│   ├── controllers/      # HTTP handlers
│   ├── middlewares/      # Auth, validate, rate limit, errors
│   ├── repositories/     # Data access layer
│   ├── routes/           # Express routers
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # JWT, hashing, mappers, pagination
│   ├── validators/       # Zod schemas
│   ├── app.ts            # Express app factory
│   └── index.ts          # Server bootstrap
├── .env.example
└── package.json
```

---

## Prerequisites

- **Node.js** 20+
- **npm** 9+
- **PostgreSQL** 16+ (local Docker or remote server)

From the project root, start local Postgres:

```bash
docker compose up -d
```

---

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

API runs at `http://localhost:4000`.

**Health check:** `GET http://localhost:4000/health`

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Runtime environment |
| `PORT` | No | `4000` | API server port |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | **Yes** | — | Access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token secret (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed frontend origin |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |
| `REFRESH_TOKEN_COOKIE_NAME` | No | `refreshToken` | HttpOnly cookie name |
| `COOKIE_SECURE` | No | `false` | Set `true` in production (HTTPS) |
| `COOKIE_SAME_SITE` | No | `lax` | Use `none` for cross-domain deploy |

**Local Docker Postgres example:**

```env
DATABASE_URL=postgresql://expenseflow:expenseflow@localhost:5432/expenseflow?schema=public
```

**Remote database example:**

```env
DATABASE_URL=postgresql://USER:PASSWORD@db-host.example.com:5432/expenseflow?schema=public
```

---

## Database Migration

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply migration (development)
npm run db:migrate

# Push schema without migration history (prototyping)
npm run db:push

# Open Prisma Studio
npm run db:studio
```

**Production:**

```bash
npx prisma migrate deploy
```

Run migrations before starting the server on a new deployment.

---

## Seed

No automated seed script is included yet.

**Create an employee via signup:**

```bash
curl -X POST http://localhost:4000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Employee"
  }'
```

Signup always creates `EMPLOYEE` users. Promote to `ADMIN` via Prisma Studio:

```bash
npm run db:studio
```

Then use **Admin → Users** in the frontend to create managers and assign relationships.

---

## Run

### Development

```bash
npm run dev
```

Uses `tsx watch` for hot reload.

### Production

```bash
npm run build
npm start
```

Use PM2 or systemd to keep the process running behind Nginx/Caddy with HTTPS.

---

## API Routes

Base path: `/api/v1`

### Auth — `/auth`

| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Register (creates Employee) |
| POST | `/login` | Login, returns access token + refresh cookie |
| POST | `/refresh` | Rotate refresh token |
| POST | `/logout` | Revoke refresh token |
| GET | `/me` | Current user (requires auth) |

### Employee claims — `/claims`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List own claims (paginated, filterable) |
| POST | `/` | Create claim |
| GET | `/:id` | Get own claim |
| PATCH | `/:id` | Update claim (draft/reverted only) |
| DELETE | `/:id` | Delete claim (draft/reverted only) |
| POST | `/:id/submit` | Submit or resubmit claim to manager |
| GET | `/:id/history` | Approval history |

### Manager — `/manager`

| Method | Path | Description |
|---|---|---|
| GET | `/claims` | List pending claims |
| GET | `/claims/:id` | Get pending claim |
| GET | `/claims/:id/history` | Approval history |
| POST | `/claims/:id/approve` | Approve |
| POST | `/claims/:id/approve-after-revert` | Re-approve after SM revert |
| POST | `/claims/:id/reject` | Reject (note required) |
| POST | `/claims/:id/revert-to-employee` | Revert (note required) |

### Senior Manager — `/senior-manager`

| Method | Path | Description |
|---|---|---|
| GET | `/claims` | List pending claims |
| GET | `/claims/:id` | Get pending claim |
| GET | `/claims/:id/history` | Approval history |
| POST | `/claims/:id/approve` | Approve |
| POST | `/claims/:id/reject` | Reject (note required) |
| POST | `/claims/:id/revert-to-manager` | Revert (note required) |

### Admin — `/admin`

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List users |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| POST | `/users/:id/deactivate` | Deactivate user |
| POST | `/users/:id/assign-to-manager` | Assign employee to manager |
| POST | `/users/:id/assign-to-senior-manager` | Assign manager to SM |
| GET | `/claims` | List all claims |
| GET | `/claims/:id/history` | Approval history |
| GET | `/summary/monthly` | Monthly claimed vs approved |

---

## Authentication

- **Access token** — JWT in `Authorization: Bearer` header
- **Refresh token** — HttpOnly cookie, path `/api/v1/auth`, rotated on refresh
- **Role middleware** — Routes enforce `EMPLOYEE`, `MANAGER`, `SENIOR_MANAGER`, `ADMIN`

All responses follow:

```json
{ "success": true, "data": { ... }, "meta": { ... } }
```

Errors:

```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

---

## Deployment

Deploy the backend on its own server (Railway, Render, Fly.io, VPS, etc.).

### Production `.env`

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@DB_HOST:5432/expenseflow?schema=public
JWT_ACCESS_SECRET=<strong-secret-32-chars-min>
JWT_REFRESH_SECRET=<strong-secret-32-chars-min>
CORS_ORIGIN=https://app.yourdomain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

Use `COOKIE_SAME_SITE=none` when frontend and API are on **different domains**.

### Checklist

1. PostgreSQL reachable from backend server only
2. Run `npx prisma migrate deploy`
3. Set strong JWT secrets
4. Enable HTTPS via reverse proxy
5. Set `CORS_ORIGIN` to exact frontend URL
6. Run `npm run build && npm start`

See the [root README](../README.md#deployment) for full split-server guidance.

---

## Tradeoffs

| Decision | Rationale | Tradeoff |
|---|---|---|
| Repository pattern | Testable, clear layers | More boilerplate |
| Role-prefixed routes | Explicit auth boundaries | Some endpoint duplication |
| Refresh token in cookie | Secure, httpOnly | Cross-domain cookie config |
| Zod validation | Type-safe input | Schemas maintained separately from frontend |
| No seed script | Minimal setup | Manual user creation for demos |

---

## Future Improvements

- Claim submit endpoint (`DRAFT` → `PENDING_MANAGER`)
- Prisma seed script
- OpenAPI/Swagger spec
- Email notifications
- Receipt file upload API
- Unit and integration tests
- Structured logging (Pino/Winston)

---

## License

UNLICENSED
