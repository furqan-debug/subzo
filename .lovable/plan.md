

# Fix: Signup "Failed to fetch" Error on Localhost

## Problem

The screenshot shows `net::ERR_NAME_NOT_RESOLVED` errors when signing up on `localhost`. Two issues are visible:

1. **The Supabase domain itself fails to resolve** — the POST to `qotgbnaoczggzldejhrw.supabase.co/auth/v1/signup` returns `ERR_NAME_NOT_RESOLVED`. This is likely a **network/DNS issue** on the device, not a code bug.

2. **A suspicious `ubzo.app` URL appears** — the browser tries to load `qotgbnaoczggzldejhrw...ubzo.app%3A%2F%2F`, suggesting `Capacitor.isNativePlatform()` might be returning `true` in the localhost dev environment, causing `getRedirectUrl()` to produce `com.subzo.app://` instead of `https://localhost`.

## Fix

### 1. Make `getRedirectUrl` more defensive (`src/lib/redirectUrl.ts`)

Add a secondary check: only use the native scheme if both `isNativePlatform()` is true AND we're NOT running in a browser context (i.e., `getPlatform()` returns `'android'` or `'ios'`, not `'web'`).

```typescript
import { Capacitor } from '@capacitor/core';

const NATIVE_SCHEME = 'com.subzo.app';

export function getRedirectUrl(path = '/'): string {
  const platform = Capacitor.getPlatform();
  if (platform === 'android' || platform === 'ios') {
    return `${NATIVE_SCHEME}://${path.replace(/^\//, '')}`;
  }
  return `${window.location.origin}${path}`;
}
```

This prevents the native scheme from being used when developing in a browser, even if Capacitor's `isNativePlatform()` returns an unexpected value.

### 2. User Action: Verify DNS/Network

The `ERR_NAME_NOT_RESOLVED` on the Supabase domain itself (`qotgbnaoczggzldejhrw.supabase.co`) points to a **network issue** on the device — not a code problem. The user should:
- Check internet connectivity
- Try from a different network or disable any VPN/proxy
- Verify the Supabase project is active in the dashboard

## Files to Modify
- `src/lib/redirectUrl.ts` — Use `getPlatform()` instead of `isNativePlatform()` for a more reliable check

