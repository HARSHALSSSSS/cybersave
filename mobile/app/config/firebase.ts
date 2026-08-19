/**
 * Firebase Phone Auth for the mobile app (Android + iOS).
 *
 * Android: copy Firebase `google-services.json` → `mobile/android/app/google-services.json`
 * iOS: copy Firebase `GoogleService-Info.plist` → `mobile/ios/Cybersave/GoogleService-Info.plist`
 *       then set CFBundleURLSchemes in Info.plist to the plist's REVERSED_CLIENT_ID value.
 */
export const USE_FIREBASE_AUTH = false;
