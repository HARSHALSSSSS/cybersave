# Cybersave Mobile

Production-ready React Native frontend for the Cybersave e-governance mobile application.

## Stack

- React Native 0.86 + TypeScript
- React Navigation (native stack)
- Redux Toolkit
- TanStack Query
- React Hook Form + Zod
- React Native Reanimated & Gesture Handler
- React Native SVG & Linear Gradient
- MMKV storage

## Project Structure

```
mobile/
├── app/           # App shell, navigation, providers, config, store
├── assets/        # Images, fonts, icons, lottie
├── components/    # Shared UI components
├── features/      # Feature modules (auth, home, etc.)
├── theme/         # Design tokens (colors, typography, spacing...)
├── services/      # API, storage, analytics
├── hooks/         # Shared hooks
├── utils/         # Helpers
├── types/         # Shared TypeScript types
└── constants/     # App constants
```

## API & production backend

The app talks to **`https://api.cybersaveonline.com/api/v1`** (live MilesWeb backend).

| Build type | API used |
|------------|----------|
| **Release APK / IPA** | Hosted API (always) |
| **Metro dev** (`npm start`) | Hosted when `USE_HOSTED_API = true` in `app/config/env.ts` |

**Current setting:** `USE_HOSTED_API = true` — Metro dev builds use the same live API as production.

To switch back to a local backend while developing, set `USE_HOSTED_API = false` in `app/config/env.ts` and run the backend on port `8000`.

Verify the API is reachable:

```bash
curl https://api.cybersaveonline.com/api/v1/health
curl https://api.cybersaveonline.com/api/v1/auth/config
```

### Production builds

**Android release APK:**

```bash
cd mobile/android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

**Android App Bundle (Play Store):**

```bash
cd mobile/android
./gradlew bundleRelease
```

**iOS (Mac required):**

```bash
cd mobile/ios && pod install && cd ..
npm run ios -- --configuration Release
```

### Firebase (phone OTP on real devices)

1. Download `google-services.json` from Firebase Console → place at `android/app/google-services.json`
2. Download `GoogleService-Info.plist` → place at `ios/Cybersave/GoogleService-Info.plist`
3. Enable **Phone** sign-in in Firebase Authentication
4. Add your app's SHA-1 (Android) in Firebase project settings

## Getting Started

```bash
cd mobile
npm install
npm start
```

### Android
```bash
npm run android
```

### iOS
```bash
cd ios && pod install && cd ..
npm run ios
```

## Implemented Screens (Phase 1)

1. **Splash** — Branded launch with Digital India badge
2. **Onboarding** — 3-slide carousel with 3D illustrations
3. **Language Selection** — 12 Indian languages grid
4. **Login** — Mobile OTP + biometric option
5. **OTP Verification** — 4-digit input with resend timer
6. **Create Account** — Full registration form
7. **Home** — Dashboard with quick actions, categories, schemes banner
8. **Notifications** — Filterable notification center
9. **Government Schemes** — Searchable schemes list
10. **Wallet** — Balance, transactions, payment methods
11. **Transaction History** — Filterable grouped transaction list
12. **Transaction Details** — Payment receipt with download
13. **Add Money** — Amount entry with payment source selection
14. **Refund Status** — Refund journey stepper
15. **Profile** — User card, menu list, logout
16. **Personal Information** — Editable profile form with verified/linked badges
17. **My Documents** — Storage usage, filters, document cards with actions
18. **My Addresses** — Address cards with default badge, edit/delete

## Design System

All styling uses centralized tokens in `theme/`:
- `colors.ts` — Brand palette + light/dark semantic colors
- `typography.ts` — Type scale
- `spacing.ts` — 4px-based spacing scale
- `radius.ts` — Border radius tokens
- `shadows.ts` / `elevation.ts` — Depth system
- `animations.ts` — Duration & motion tokens
