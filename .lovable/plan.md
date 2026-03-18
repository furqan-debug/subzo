

# Clean Up, Remove Bloat, Rebrand, and Optimize

## 1. Remove "Lovable" References

**`vite.config.ts`**: Remove the `lovable-tagger` import and plugin. It's a dev-only tagger that adds no value to production and carries the "lovable" brand.

## 2. Rename "SubTracker" → "Subzo"

Three files still use the old name "SubTracker":
- **`src/lib/exportPdf.ts`** — PDF header and footer text
- **`src/pages/SettingsPage.tsx`** — version label at the bottom
- **`src/components/NotificationScheduler.tsx`** — localStorage key uses `subtracker_` prefix (rename to `subzo_`)

## 3. Delete `src/App.css` (Dead Code)

This is the default Vite boilerplate CSS (`.logo`, `.read-the-docs`, logo-spin animation). It's never imported anywhere — pure dead weight.

## 4. Delete `src/test/example.test.ts` (Placeholder)

A dummy test (`expect(true).toBe(true)`) with zero value.

## 5. Remove 25+ Unused UI Components

None of these shadcn/ui components are imported anywhere outside their own files:
- `accordion`, `aspect-ratio`, `avatar`, `breadcrumb`, `carousel`, `chart`, `checkbox`, `command`, `context-menu`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input-otp`, `menubar`, `navigation-menu`, `pagination`, `progress`, `radio-group`, `resizable`, `sheet`, `slider`, `table`, `tabs`, `textarea`, `toggle`, `toggle-group`

This is ~27 component files that inflate the bundle and slow IDE indexing. They can be re-added via shadcn CLI if ever needed.

## 6. Remove Unused Radix Dependencies from `package.json`

Corresponding to the deleted UI components, remove these unused packages:
`@radix-ui/react-accordion`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-context-menu`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-menubar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-slider`, `@radix-ui/react-tabs`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`

Also remove unused runtime deps: `cmdk`, `embla-carousel-react`, `input-otp`, `react-resizable-panels`, `react-day-picker`, `react-hook-form`, `@hookform/resolvers`, `zod`, `next-themes`

## 7. Speed / Scalability Improvements

- **Lazy-load heavy pages** (`Analytics`, `CalendarPage`, `Plans`, `AddSubscription`, `SubscriptionDetail`, `SettingsPage`) using `React.lazy()` + `Suspense` in `App.tsx`. This splits the bundle so the initial load only includes the home page.
- **Remove `@capacitor/ios`** from dependencies — this is an Android-only app per the config.

## Summary of Changes

| Action | Files |
|--------|-------|
| Remove lovable-tagger | `vite.config.ts` |
| Rename SubTracker → Subzo | `exportPdf.ts`, `SettingsPage.tsx`, `NotificationScheduler.tsx` |
| Delete dead CSS | `src/App.css` |
| Delete placeholder test | `src/test/example.test.ts` |
| Delete ~27 unused UI components | `src/components/ui/` |
| Clean package.json deps | `package.json` |
| Lazy-load route pages | `src/App.tsx` |
| Remove iOS dep | `package.json` |

