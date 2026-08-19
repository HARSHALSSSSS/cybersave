# MilesWeb deployment

Upload the **`backend/`** folder. Do **not** upload `node_modules/` — install on the server.

## 1. Create `.env` on server

Copy `.env.milesweb.example` → `.env` and fill in:

- `DATABASE_URL` — your cloud Postgres URL
- `CITIZEN_JWT_SECRET` / `ADMIN_JWT_SECRET` — strong random strings
- `WHATSAPP_*` — Meta WhatsApp Cloud API (OTP delivery)
- `RAZORPAY_*` — live keys for production

## 2. MilesWeb Node.js app settings

| Setting | Value |
|---------|--------|
| Node.js version | **20.x** |
| Application root | `backend` |
| Startup command | `node dist/main.js` |

## 3. Build on server (cPanel terminal)

```bash
cd backend
npm install
npx prisma generate
npm run build
npx prisma migrate deploy
npx ts-node --transpile-only prisma/seed.ts
```

Run the seed **once** on first deploy. Then restart the Node app from cPanel.

## 4. Verify

- `https://api.cybersaveonline.com/api/v1/health`
- `https://api.cybersaveonline.com/api/v1/auth/config` → `authProvider: "whatsapp"`, `otpChannel: "whatsapp"`, `whatsappConfigured: true`

## Default admin (after seed)

- Email: `admin@cybersave.local`
- Password: `Admin@123456` — change immediately.

## What to upload

Include: `src/`, `prisma/`, `package.json`, `package-lock.json`, `dist/` (if pre-built), `.env`, empty `storage/` folder.

Exclude: `node_modules/`, `.git/`, `dist.zip`, local logs.
