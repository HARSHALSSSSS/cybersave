# Cybersave Backend

NestJS modular monolith for the Cybersave digital services platform.

## Stack

- NestJS 11 + TypeScript
- PostgreSQL + Prisma
- Redis (Docker — jobs in later phases)
- JWT auth (separate citizen + admin)
- Swagger OpenAPI

## Prerequisites

- Node.js 20+
- Docker Desktop (for Postgres + Redis)

## Quick start

```bash
# From c:\cybersave\backend

# 1. Install dependencies
npm install

# 2. Start Postgres + Redis
docker compose up -d

# 3. Configure environment
copy .env.example .env

# 4. Run migrations
npm run prisma:migrate

# 5. Seed roles, permissions, super admin
npm run db:seed

# 6. Start dev server
npm run start:dev
```

API base: `http://localhost:8000/api/v1`  
Swagger: `http://localhost:8000/api/v1/docs`

## Default super admin (seed)

- Email: `admin@cybersave.local`
- Password: `Admin@123456`

Change immediately in non-development environments.

## Citizen auth (dev)

```bash
POST /api/v1/auth/otp/request  { "phone": "+919876543210" }
POST /api/v1/auth/otp/verify   { "phone": "+919876543210", "code": "<devCode from response>" }
```

In development, OTP is logged to console and returned in the response as `devCode`.

## Project structure

```
backend/
├── prisma/           # Schema, migrations, seed
├── src/
│   ├── config/       # Environment configuration
│   ├── common/       # Guards, filters, decorators, constants
│   ├── database/     # Prisma module
│   ├── integrations/ # Storage, payment (later), notifications (later)
│   └── modules/      # Feature modules (auth, health, services, …)
├── docker-compose.yml
└── .env.example
```

## Architecture reference

See [`../docs/PROJECT_AUDIT_AND_ARCHITECTURE.md`](../docs/PROJECT_AUDIT_AND_ARCHITECTURE.md).

## Production (MilesWeb)

See **[DEPLOY.md](./DEPLOY.md)**. Copy `.env.milesweb.example` → `.env` on the server.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Cloud PostgreSQL |
| `CITIZEN_JWT_SECRET` / `ADMIN_JWT_SECRET` | JWT signing (32+ chars) |
| `CORS_ORIGINS` | Live web + admin URLs |
| `STORAGE_PUBLIC_BASE_URL` | `https://api.cybersaveonline.com/api/v1/storage/local` |
| `FIREBASE_*` | Firebase phone OTP |
| `RAZORPAY_*` | Razorpay payments |

### Tests

```bash
npm run build
npm run test:e2e   # requires Postgres (docker compose up -d)
```

## Phase 8 scope (this scaffold)

- [x] NestJS project at repo root sibling to `mobile/` and `admin/`
- [x] Full Prisma schema (all approved entities)
- [x] Docker Compose (Postgres + Redis)
- [x] Config, database, health check
- [x] Citizen OTP auth + Admin password auth
- [x] RBAC seed (roles, permissions, super admin)
- [x] Storage abstraction + local presigned upload provider
- [x] Global API envelope, validation, Swagger, exception filter

## Phases 9–11 (implemented)

### Phase 9 — Auth hardening
- Global rate limiting (`@nestjs/throttler`)
- Stricter limits on OTP and admin login routes
- SMS provider abstraction (`ConsoleSmsProvider` — logs OTP in dev)
- OTP invalidation on re-request + per-phone abuse cap

### Phase 10 — RBAC admin APIs
- `GET /api/v1/admin/roles` — roles with permissions
- `GET /api/v1/admin/permissions` — permission catalogue
- `GET /api/v1/admin/admin-users` — paginated admin/operator list
- `@RequirePermissions` / `@RequireAnyPermissions` on admin routes

### Phase 11 — Service catalogue (admin + citizen)

**Admin**
- `GET/POST /api/v1/admin/main-services`
- `GET/PATCH /api/v1/admin/main-services/:id`
- `POST /api/v1/admin/main-services/reorder`
- `POST /api/v1/admin/main-services/:id/archive`
- `POST /api/v1/admin/main-services/:mainId/sub-services` — creates sub-service + **draft v1 bundle** (overview, form, pricing, default workflow)
- `PATCH /api/v1/admin/sub-services/:id`
- `POST /api/v1/admin/sub-services/:id/archive`
- `POST /api/v1/admin/sub-services/:subId/versions` — clone new draft from published
- `GET /api/v1/admin/service-versions/:id` — full wizard bundle
- `PUT /api/v1/admin/service-versions/:id/overview` — persist overview step
- `GET /api/v1/admin/service-versions/:id/preview`

**Citizen (public)**
- `GET /api/v1/services` — published catalogue
- `GET /api/v1/services/sub/:subServiceId/configuration` — UI-ready config

## Not yet implemented

- Form builder save, documents, pricing, workflow editor APIs
- Service publish/validate
- Application lifecycle, payments, notifications
- Wallet (deferred per architecture)
- S3/Cloudinary storage providers (interface ready)
