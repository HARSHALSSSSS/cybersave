# MilesWeb — Citizen Web Portal

## 1. Create production `.env`

Copy `.env.milesweb.example` → `.env` and fill Firebase keys (same Web app as local dev).

## 2. Build on your PC

```bash
cd web
npm install
npm run build
```

Output folder: **`web/dist/`**

## 3. Upload to MilesWeb

Upload **everything inside `dist/`** to **`public_html/`** (root of cybersaveonline.com).

The `.htaccess` for React Router is included in the build (from `public/.htaccess`).

## 4. Backend CORS

On the API server `.env`, ensure:

```
CORS_ORIGINS=https://cybersaveonline.com,https://www.cybersaveonline.com,https://api.cybersaveonline.com
```

Restart the Node API after changing CORS.

## 5. Firebase

Firebase Console → Authentication → Settings → **Authorized domains**:

- `cybersaveonline.com`
- `www.cybersaveonline.com`

Enable **Blaze billing** for real SMS OTP on production.

## 6. Verify

- https://cybersaveonline.com loads home page
- Browser devtools → Network → API calls go to `https://api.cybersaveonline.com/api/v1/...`
- Login → OTP flow works
