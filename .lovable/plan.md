

## Problem Analysis

The app opens the **Lovable platform login page** (lovable.dev/login) instead of your Subzo auth screen. This happens because:

1. **`capacitor.config.ts`** has `server.url` pointing to `lovableproject.com` — this is the development preview URL which sits behind Lovable's own authentication wall. When the native app loads it, Lovable redirects to its own login page.

2. **Google OAuth uses redirect flow** — on mobile/Capacitor, `signInWithOAuth` with redirect opens an external browser, which loses context of the app. It needs a popup-based or in-app browser approach instead.

## Plan

### 1. Fix Capacitor config — remove remote server URL

Remove the `server` block entirely from `capacitor.config.ts`. The app will load from the local `dist/` directory (which is the correct production behavior). The `server.url` was only meant for development hot-reload and causes the Lovable login redirect issue.

```typescript
const config: CapacitorConfig = {
  appId: 'com.subzo.app',
  appName: 'Subzo',
  webDir: 'dist',
};
```

### 2. Fix Google OAuth for Capacitor — use popup flow

Update `signInWithGoogle` in `useAuth.tsx` to use `skipBrowserRedirect: true` and open the OAuth URL in an in-app browser window instead of redirecting. This keeps auth within the app context.

### 3. After pulling changes

User must:
1. `git pull`
2. `npm run build`
3. `npx cap sync`
4. `npx cap run android`

The app will now load your Subzo auth page from local files, and Google sign-in will work within the app.

### Files Modified
- `capacitor.config.ts` — remove `server` block
- `src/hooks/useAuth.tsx` — popup-based Google OAuth for mobile

