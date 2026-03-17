

# Fix: Email Confirmation Redirects to Browser Instead of Native App

## Problem

When a user signs up on the Android app and clicks the email confirmation link, they're taken to the **web browser** instead of back into the native app. This happens because:

1. `signUp()` sets `emailRedirectTo: window.location.origin` — which resolves to the web URL (e.g., `https://...lovableproject.com`), not the native app scheme
2. `resetPasswordForEmail()` has the same issue with `redirectTo`
3. The Capacitor config is missing the deep link scheme, and Supabase likely doesn't have `com.subzo.app://` in its allowed redirect URLs

## Fix

### 1. Create a helper to detect the correct redirect URL (`src/lib/redirectUrl.ts`)

```typescript
import { Capacitor } from '@capacitor/core';

const NATIVE_SCHEME = 'com.subzo.app';

export function getRedirectUrl(path = '/'): string {
  if (Capacitor.isNativePlatform()) {
    return `${NATIVE_SCHEME}://${path.replace(/^\//, '')}`;
  }
  return `${window.location.origin}${path}`;
}
```

### 2. Update `useAuth.tsx`

- `signUp`: use `getRedirectUrl('/')` for `emailRedirectTo`
- `resetPassword`: use `getRedirectUrl('/reset-password')` for `redirectTo`

### 3. Update `useDeepLinkHandler.ts`

Already handles `com.subzo.app://` scheme via the Capacitor App listener — no changes needed, it should already intercept the token/code from the deep link URL.

### 4. Supabase Dashboard Configuration (manual step)

The user must add `com.subzo.app://` (with wildcard or specific paths) to the **Redirect URLs** list in Supabase Dashboard → Authentication → URL Configuration. Without this, Supabase will reject the redirect.

### 5. Android App Links in `capacitor.config.ts`

No code change needed here — the `com.subzo.app://` scheme should already be registered in the Android manifest via the Capacitor app plugin listener. But we should verify the user has the intent filter in their `AndroidManifest.xml`.

## Files to Modify
1. **`src/lib/redirectUrl.ts`** — New helper (detect native vs web redirect)
2. **`src/hooks/useAuth.tsx`** — Use native scheme for email redirects on mobile
3. **`src/hooks/useGoogleAuth.ts`** — Use native scheme for web OAuth `redirectTo` (edge case if web OAuth is used on native)

## Manual Steps for User
- Add `com.subzo.app://**` to Supabase Dashboard → Auth → Redirect URLs
- Ensure Android `AndroidManifest.xml` has intent filter for `com.subzo.app` scheme (should already exist from Capacitor App plugin setup)

