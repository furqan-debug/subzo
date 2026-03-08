
# Make the App Smooth, Fast, and Offline-Ready

This plan focuses on three pillars: **performance**, **smoothness**, and **offline resilience** -- all achievable within the current React + Capacitor + Supabase stack.

---

## 1. Offline Data Caching with React Query

React Query supports an "offline-first" mode out of the box. We'll configure it so users can browse their subscriptions even without internet.

### Changes to `src/App.tsx`:
- Configure the global `QueryClient` with offline-friendly defaults:
  - `gcTime: Infinity` -- keep cached data in memory permanently (until app restart)
  - `staleTime: 5 * 60 * 1000` (5 minutes) -- reduce unnecessary refetches
  - `retry: 2` with `retryDelay` for graceful network retries
  - `networkMode: 'offlineFirst'` -- serve cache instantly, then sync in background

### Changes to `src/hooks/useSubscriptions.ts` and `src/hooks/useProfile.ts`:
- Remove per-query `staleTime` overrides (global default takes over)
- Add `networkMode: 'offlineFirst'` to mutations so they queue when offline

---

## 2. Persist Cache Across Sessions

### New utility: `src/lib/queryPersister.ts`
- Create a lightweight localStorage-based persister that saves/restores the React Query cache
- On app load, hydrate from localStorage; on cache updates, debounce-write to localStorage
- This means even after closing and reopening the app, the last-known data is shown instantly

### Changes to `src/App.tsx`:
- Wrap the app with `PersistQueryClientProvider` from `@tanstack/react-query-persist-client` (already included with `@tanstack/react-query`)
- Or implement a simpler manual approach: subscribe to query cache changes and persist to localStorage, then restore on init

Given the dependency constraints (no new packages), we'll use a manual approach:
- `queryClient.getQueryCache().subscribe()` to listen for changes
- Debounce writes to `localStorage` 
- On startup, call `queryClient.setQueryData()` for each stored key

---

## 3. Offline Status Indicator

### New component: `src/components/OfflineBanner.tsx`
- A small, animated banner that slides in at the top when `navigator.onLine` is false
- Shows "You're offline -- showing cached data" with a subtle warning color
- Auto-dismisses when back online with a brief "Back online" confirmation
- Uses `online`/`offline` window events

### Changes to `src/App.tsx`:
- Add `<OfflineBanner />` inside the app tree

---

## 4. Performance Optimizations

### Reduce animation overhead:
- **`src/pages/Index.tsx`**: Remove staggered `delay` on subscription list items (already lean). Ensure `motion.div` uses `layout` prop sparingly
- **`src/components/PageTransition.tsx`**: Keep the current 100ms transition (already fast)

### Optimize images:
- **`src/pages/AddSubscription.tsx`** and **`src/pages/Index.tsx`**: Add `loading="lazy"` and `decoding="async"` to all `<img>` tags for subscription logos (some already have `loading="lazy"`)

### Font loading:
- **`index.html`**: Add `font-display: swap` to the Google Fonts URL to prevent FOIT (flash of invisible text). Change the URL from `display=swap` (already present -- confirm it's working)

---

## 5. Smooth Touch Interactions

### Changes to `src/index.css`:
- Add `will-change: transform` to `.glass-card` for GPU-accelerated transitions
- Add `touch-action: manipulation` on interactive elements to remove 300ms tap delay on mobile

---

## Technical Summary

| File | Change |
|---|---|
| `src/App.tsx` | Configure QueryClient with offline-first defaults; add cache persistence; add OfflineBanner |
| `src/lib/queryPersister.ts` | New file -- localStorage cache persist/restore utility |
| `src/components/OfflineBanner.tsx` | New file -- offline status indicator component |
| `src/hooks/useSubscriptions.ts` | Remove per-query staleTime, add offlineFirst to mutations |
| `src/hooks/useProfile.ts` | Remove per-query staleTime |
| `src/pages/Index.tsx` | Add `decoding="async"` to logo images |
| `src/pages/AddSubscription.tsx` | Add `decoding="async"` to logo images |
| `src/index.css` | Add `touch-action: manipulation` and `will-change: transform` for smooth touch |
| `index.html` | Verify font-display swap is active |

No new dependencies required -- all features use built-in React Query capabilities and browser APIs.
