

# Fix Mobile Export + Add Welcome Notification

## Problem 1: PDF/CSV Export Broken on Android

The current export uses `doc.save()` (jsPDF) and `document.createElement('a').click()` with blob URLs. These rely on browser download behavior that **does not work inside Android WebView** (Capacitor). The WebView has no download manager.

### Fix

Install `@capacitor/filesystem` and `@capacitor/share`. On native platforms, write the file to the device cache directory, then trigger the native share sheet so the user can save/send it.

**Files to modify:**
- **`src/lib/exportPdf.ts`** — Instead of `doc.save()`, detect native platform → write PDF bytes via `Filesystem.writeFile()` → open share sheet via `Share.share()`. On web, keep current behavior.
- **`src/pages/SettingsPage.tsx`** — Update CSV export: on native, write CSV string to cache via Filesystem, then share. On web, keep blob URL approach.

```text
Export flow (native):
  Generate data → Write to Filesystem (cache dir) → Share.share({ url: filePath })
  
Export flow (web):
  Keep existing blob/download behavior
```

## Problem 2: Welcome Notification on First Login

Send a premium-feeling local notification immediately after first sign-in or sign-up, personalized with the user's name.

### Implementation

- **`src/hooks/useNotifications.ts`** — Add `scheduleWelcomeNotification(userName: string)` that fires a notification ~3 seconds after call. Uses the `spending_insights` channel. Title: "Welcome to SubTracker ✨", body personalized with name.
- **`src/components/NotificationScheduler.tsx`** — Track whether welcome notification was already sent (via `localStorage` flag `subtracker_welcome_sent`). On mount, if user exists and flag is not set, request permission and fire the welcome notification, then set the flag.

### Notification Design
- Channel: `spending_insights` (default priority, no aggressive vibration)
- Icon color: `#6366f1` (primary purple, matching app theme)
- Fires 3 seconds after login so user sees it after the app loads
- Body example: "Hey Alex, welcome aboard! 🚀 Track your subscriptions like a pro and never miss a renewal."

## Dependencies to Install
- `@capacitor/filesystem`
- `@capacitor/share`

## Files Changed
1. `src/lib/exportPdf.ts` — Native-aware PDF export
2. `src/pages/SettingsPage.tsx` — Native-aware CSV export  
3. `src/hooks/useNotifications.ts` — Add welcome notification function
4. `src/components/NotificationScheduler.tsx` — Trigger welcome notification on first login
5. `package.json` — Add `@capacitor/filesystem` and `@capacitor/share`

