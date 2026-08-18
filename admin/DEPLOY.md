# MilesWeb — Admin Dashboard

Two production layouts:

| URL | Upload to | `VITE_ADMIN_BASE` |
|-----|-----------|-------------------|
| **https://admin.cybersaveonline.com/** | subdomain docroot (root) | `/` |
| **https://cybersaveonline.com/admin/** | `public_html/admin/` | `/admin` |

Build generates the correct `.htaccess` and `_redirects` for the chosen base.

## 1. Create production `.env`

**Subdomain (admin.cybersaveonline.com):**

```
VITE_API_BASE_URL=https://api.cybersaveonline.com/api/v1
VITE_ADMIN_BASE=/
VITE_APP_ENV=production
VITE_SHOW_DEMO_CREDENTIALS=true
```

**Path under main site (`/admin/`):** copy `.env.milesweb.example` → `.env`:

```
VITE_API_BASE_URL=https://api.cybersaveonline.com/api/v1
VITE_ADMIN_BASE=/admin
VITE_APP_ENV=production
```

`VITE_ADMIN_BASE` must match where the built files are served.

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

- Subdomain: https://admin.cybersaveonline.com/login (or open `/` — redirects to login when signed out)
- Path deploy: https://cybersaveonline.com/admin/login
- Login: `admin@cybersave.local` / `Admin@123456` (change after first login)
- Dashboard loads data from API

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page / 404 on `/login` refresh | Rebuild with the correct `VITE_ADMIN_BASE` and redeploy `.htaccess` from `dist/` |
| Blank page / 404 on refresh | Ensure `.htaccess` from `dist/` is in the admin docroot |
| Assets 404 (wrong path) | Rebuild with `VITE_ADMIN_BASE=/admin` |
| API CORS error | Add `https://cybersaveonline.com` to backend `CORS_ORIGINS` |
| Login redirect wrong | Rebuild after latest admin code (login path fix) |
