# Fix Deep Link Flow: No Browser, No Lovable, No Play Store

## Two Problems Identified

**Problem 1: "Open Subzo" opens Play Store**
The intent URL includes `package=com.subzo.app`. When Android cannot resolve the intent to a locally installed app (common with debug APKs that lack proper intent-filter verification), it falls back to opening the Play Store listing for that package. Fix: remove the `package` parameter from the intent URI.

**Problem 2: Users see the Lovable "Authenticating..." page**
The `lovableproject.com` preview domain has a platform auth gate. Before the SPA even loads, Lovable's hosting shows its own branded page. This cannot be fixed on code level — it requires using a custom domain that you own.

## Solution

### Step 1: Connect your custom domain

You need to connect your own domain (e.g. `subzo.app` or `auth.subzo.app`) to this project via **Project Settings → Domains**. This eliminates the Lovable auth gate entirely.

**I need to know your domain name to proceed** — but the code changes below use a placeholder you can swap later.

### Step 2: Fix AuthCallback page (`src/pages/AuthCallback.tsx`)

- Remove `package=com.subzo.app` from the intent URI — this prevents the Play Store fallback
- Brand the fallback UI properly (Subzo logo/colors instead of plain spinner)
- Use only the custom scheme `com.subzo.app://` as the redirect method (simpler, more reliable for debug builds)
- Add a direct `window.location.href` assignment instead of `replace` for better browser compatibility

### Step 3: Update redirect URL (`src/lib/redirectUrl.ts`)

Change `WEB_URL` from the lovableproject.com domain to your custom domain:

```text
Before: https://8f6f7216-...lovableproject.com
After:  https://yourdomain.com
```

### Step 4: Add Android App Links support (`public/.well-known/assetlinks.json`)

Create `public/.well-known/assetlinks.json` with your app's SHA-256 fingerprint. This tells Android to open your app directly when links from your domain are tapped — no browser intermediary at all.

```text
Flow after fix:
  User clicks email link
  → Opens yourdomain.com/auth/callback (your branded page)
  → Android recognizes App Link → opens native app directly
  → If App Links not verified yet: page redirects via com.subzo.app:// scheme
  → Deep link handler picks up tokens → user lands on home screen
```

### Step 5: Update Supabase Dashboard

Add your new domain's callback URL to Supabase → Auth → Redirect URLs:

- `https://yourdomain.com/auth/callback`
- `com.subzo.app://**` (keep existing)

## Files Changed

1. `src/pages/AuthCallback.tsx` — Remove package param from intent, brand with Subzo
2. `src/lib/redirectUrl.ts` — Use custom domain instead of lovableproject.com
3. `public/.well-known/assetlinks.json` — New file for Android App Links

## What I Need From You

- Your domain name ([https://www.subzoapp.com/](https://www.subzoapp.com/))
- Your app's SHA-256 signing certificate fingerprint E0:5A:9D:4C:97:36:44:B6:E5:7E:E6:19:91:DD:65:E1:6F:25:F5:11:B9:E0:30:29:88:E3:21:89:1D:9F:1C:B8