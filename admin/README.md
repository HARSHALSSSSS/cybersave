# Cybersave Admin

Production-grade React admin dashboard for Cybersave operations.

## Stack

- React 19 + Vite + TypeScript
- React Router v7
- TanStack Query + Zustand
- Axios API layer
- React Hook Form + Zod
- Tailwind CSS v4 + shadcn/ui + Radix UI
- Lucide React, Framer Motion, Recharts, Sonner

## Run

```bash
cd admin
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Routes

| Path | Screen |
|------|--------|
| `/dashboard` | Super Admin Dashboard |
| `/users` | User Management |
| `/users/:citizenId` | Citizen Detail |
| `/applications` | Applications |
| `/applications/:applicationId` | Application Detail |
| `/services` | Government Services Directory |
| `/services/new` | Add New Service |

Other sidebar items render a Coming Soon placeholder.

## Architecture

Feature-based modules under `src/features/*` with self-contained pages, components, services, schemas, and mock data. Shared UI lives in `src/components`. Theme tokens in `src/theme`. Backend calls go through `src/services/api`.
