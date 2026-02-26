

## Plan: Clean Up Branding & Fix Capacitor App ID

### Problem
The Capacitor config uses an invalid App ID (`app.lovable.8f6f7216fd234557bf5f8e7ab00fbcd0`) which fails Android/iOS validation. Multiple files also reference "Lovable" branding that should be replaced with the app's actual name "Subzo".

### Changes

**1. `capacitor.config.ts`** — Fix App ID and app name:
- `appId`: `'com.subzo.app'`
- `appName`: `'Subzo'`
- Keep server URL as-is (it's the preview URL for hot-reload, not branding)

**2. `index.html`** — Replace all branding:
- Title: `Subzo`
- Description: `Smart subscription tracker`
- Remove Lovable og:image, twitter:site references
- Clean up TODO comments

**3. `vite.config.ts`** — The `lovable-tagger` import is a dev-only tool used internally by the platform. It only runs in development mode and is not included in production builds. It will be left as-is since removing it could break the development environment.

**4. `README.md`** — Rewrite with clean project documentation for Subzo (no Lovable references).

### Files Modified
- `capacitor.config.ts`
- `index.html`
- `README.md`

