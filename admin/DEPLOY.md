# MilesWeb — Admin Dashboard

Admin runs at **https://cybersaveonline.com/admin/**

## 1. Create production `.env`

Copy `.env.milesweb.example` → `.env`:

```
VITE_API_BASE_URL=https://api.cybersaveonline.com/api/v1
VITE_ADMIN_BASE=/admin
VITE_APP_ENV=production
```

`VITE_ADMIN_BASE=/admin` is required so assets and routes work under `/admin/`.

## 2. Build on your PC

```bash
cd admin
npm install
npm run build
```

Output folder: **`admin/dist/`**

## 3. Upload to MilesWeb

Upload **everything inside `dist/`** to **`public_html/admin/`**.

The `.htaccess` for SPA routing is included (from `public/.htaccess`).

## 4. Verify

- https://cybersaveonline.com/admin/login
- Login: `admin@cybersave.local` / `Admin@123456` (change after first login)
- Dashboard loads data from API

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page / 404 on refresh | Ensure `.htaccess` is in `public_html/admin/` |
| Assets 404 (wrong path) | Rebuild with `VITE_ADMIN_BASE=/admin` |
| API CORS error | Add `https://cybersaveonline.com` to backend `CORS_ORIGINS` |
| Login redirect wrong | Rebuild after latest admin code (login path fix) |
