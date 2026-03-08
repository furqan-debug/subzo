
# Fix Broken Subscription Logo Images

## Root Cause
The `SubscriptionLogo` component renders an `<img>` tag for the DB `logoUrl` fallback but has **no `onError` handler**. When the CDN URL is broken/unreachable, the browser shows a broken image icon instead of gracefully falling back to the text initial badge.

## Changes

### 1. Add `onError` fallback to `SubscriptionLogo` component
Add React state to track image load failure. On error, hide the `<img>` and render the text initial badge instead. This ensures **zero broken images** regardless of whether the local mapping or DB URL works.

```text
Fallback chain:
  Local SVG (simple-icons) → DB logo_url → [onError] → Text Initial Badge
```

### 2. Add missing service mappings to `subscriptionLogos.ts`
From the screenshots, these services need mappings added (where available in simple-icons):
- `LinkedIn Premium` → `linkedin`
- `Kindle Unlimited` → `amazonkindle` (if available, else `amazon`)
- `MasterClass` → may not exist in simple-icons
- `Midjourney` → may not exist
- `Mubi` → may not exist
- `MyFitnessPal` → `myfitnesspal`
- `Noom` → may not exist
- `Walmart+` → `walmart`
- `Brilliant` → may not exist
- `Calm` → may not exist
- `Cursor Pro` → `cursor` (if available)
- `BetterHelp` → may not exist
- `Blinkist` → may not exist

For services not in simple-icons, the `onError` handler fix ensures they gracefully show initials instead of broken images.

### Files Modified
- `src/components/SubscriptionLogo.tsx` -- add `useState` + `onError` handler
- `src/lib/subscriptionLogos.ts` -- add ~8 new service mappings where slugs exist
