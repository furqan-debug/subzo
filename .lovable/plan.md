

# Speed and Performance Optimization

## Problem Analysis
The app feels slow due to several compounding issues: render-blocking font loading, expensive CSS effects (128px blur with continuous animation), excessive per-item framer-motion animations, no query caching (data re-fetches on every navigation), and AnimatePresence blocking page transitions.

---

## 1. Remove render-blocking Google Fonts import

Replace the CSS `@import` in `src/index.css` with a `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html`. This prevents the CSS from blocking the initial render.

**Files:** `index.html`, `src/index.css`

---

## 2. Remove expensive ambient background blur

The `AppLayout.tsx` has two 384px divs with `blur-[128px]` and `animate-pulse-glow` running continuously. These are extremely expensive for mobile GPUs. Remove them entirely.

**File:** `src/components/AppLayout.tsx`

---

## 3. Simplify glass-card CSS

Remove the `::before` pseudo-element gradient overlay from every `.glass-card`. This creates an extra compositing layer on every single card in the app. Use a simpler single-gradient background instead.

**File:** `src/index.css`

---

## 4. Add staleTime to React Query hooks

Currently `useSubscriptions`, `useProfile`, and `useCatalog` all have `staleTime: 0` (default), causing re-fetches on every navigation. Set `staleTime: 30000` (30 seconds) so data is reused when switching between pages.

**Files:** `src/hooks/useSubscriptions.ts`, `src/hooks/useProfile.ts`

---

## 5. Remove AnimatePresence wait mode

Change `AnimatePresence mode="wait"` to just `AnimatePresence` in `App.tsx`. The "wait" mode delays showing the new page until the old one finishes its exit animation, making every navigation feel sluggish.

**File:** `src/App.tsx`

---

## 6. Reduce per-item staggered animations

Remove individual `delay` props from list items in `Index.tsx`, `Analytics.tsx`, and `AddSubscription.tsx`. Instead, animate the parent container once. Individual item delays of `0.02-0.05s * N items` add up significantly.

**Files:** `src/pages/Index.tsx`, `src/pages/Analytics.tsx`, `src/pages/AddSubscription.tsx`

---

## 7. Fix AnimatedNumber ref warning

The console shows "Function components cannot be given refs" for `AnimatedNumber`. While not a perf issue per se, React warnings slow down dev mode. The component already uses an internal ref correctly -- the warning comes from framer-motion trying to pass a ref. No code change needed as this is a dev-only warning, but noted.

---

## 8. Remove SettingsPage duplicate Supabase call

`SettingsPage` makes its own `supabase.from('profiles').select()` call in a `useEffect`, while `useProfile` already fetches the same data. Remove the duplicate and use the profile from `useProfile` instead.

**File:** `src/pages/SettingsPage.tsx`

---

## 9. Simplify PageTransition

Reduce the transition wrapper to just a simple opacity fade (remove the y-axis shift) and shorten duration to 100ms.

**File:** `src/components/PageTransition.tsx`

---

## Summary of expected impact

- **Font loading**: Eliminates ~200-500ms render block on first load
- **Blur removal**: Major GPU savings, especially on mobile/Android
- **staleTime**: Eliminates redundant network requests on every navigation
- **AnimatePresence**: Pages appear instantly instead of waiting for exit animation
- **Stagger removal**: Lists render immediately instead of trickling in
- **Duplicate query removal**: One fewer Supabase request per settings visit

