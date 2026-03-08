

# Download Subscription Logos Locally

## Problem
All catalog logos load from external CDNs (SimpleIcons, Google Favicons) at runtime. This means broken icons if CDN is down, slower load times, and no offline support.

## Approach
Install the `simple-icons` npm package (contains 3000+ brand SVGs as build-time assets) and create a local logo mapping system. This eliminates CDN dependency entirely.

## Changes

### 1. Install `simple-icons` package
Add `simple-icons` as a dependency. This ships SVG data for all major brands at build time -- no network requests needed.

### 2. Create `src/lib/subscriptionLogos.ts`
A mapping from service name to its Simple Icons slug + brand color. For services not in Simple Icons (BetterHelp, Blinkist, etc.), we'll generate colored initial badges via a utility function instead.

```text
Map structure:
  "Netflix"    → { slug: "netflix",    color: "#E50914" }
  "Spotify"    → { slug: "spotify",    color: "#1DB954" }
  "Claude Pro" → { slug: "anthropic",  color: "#D97757" }
  ...~70 entries
```

Export a `getLocalLogoUrl(name: string)` function that returns the SVG as a data URI from `simple-icons`, or `null` if not found.

### 3. Update `src/pages/AddSubscription.tsx`
- Replace the `getLogoSrc` fallback chain: try `getLocalLogoUrl(item.name)` first, then fall back to `item.logo_url` (CDN), then initials badge
- Remove the Google Favicons fallback (no longer needed)

### 4. Update logo rendering across pages
- `src/pages/Index.tsx` -- use `getLocalLogoUrl(sub.name)` before `sub.logo_url`
- `src/pages/SubscriptionDetail.tsx` -- same pattern
- `src/pages/CalendarPage.tsx` -- same pattern
- `src/components/SwipeableSubscriptionCard.tsx` -- if it renders logos

### 5. Update DB migration (optional cleanup)
Update `subscription_catalog` rows to set `logo_url = NULL` since logos are now resolved locally. This is optional; the code will simply prefer local over DB URLs.

## Benefits
- Icons load instantly from the JS bundle (no network requests)
- Works fully offline
- No broken images from CDN outages
- Smaller per-icon footprint since Simple Icons are optimized SVGs

