

## Redesign Google Auth: Separate Hook + Reusable Button

### What Changes

Restructure the Google sign-in into a clean, portable architecture matching your other app's proven pattern.

### New Files

**1. `src/hooks/useGoogleAuth.ts`** -- Self-contained hook
- Exports `initializeGoogleAuth()` -- called once on app startup (native only)
- Exports `signInWithGoogle()` -- handles both native and web flows
- Native flow: logout stale session first, then `SocialLogin.login()`, extract `idToken`, exchange via `supabase.auth.signInWithIdToken()`
- Web flow: standard `supabase.auth.signInWithOAuth()` redirect (no popup, direct redirect to `window.location.origin`)
- Graceful error handling for cancellation, reauth errors (`[16]`), and missing tokens

**2. `src/components/GoogleSignInButton.tsx`** -- Reusable UI button
- Calls `signInWithGoogle()` from the hook
- Shows loading spinner while authenticating
- Displays toast on error
- Can be dropped into any login/signup form

### Modified Files

**3. `src/hooks/useAuth.tsx`**
- Remove all Google sign-in logic (the `signInWithGoogle` method and the `GOOGLE_WEB_CLIENT_ID` constant)
- Remove `signInWithGoogle` from `AuthContextType` and the provider value
- Keep email/password auth, signOut, resetPassword unchanged

**4. `src/App.tsx`**
- Call `initializeGoogleAuth()` at app startup inside `AppRoutes` component (runs once, only initializes on native)

**5. `src/pages/Auth.tsx`**
- Replace inline Google button with `<GoogleSignInButton />`
- Remove the manual `signInWithGoogle` call and toast logic for Google

### Native Flow Detail

```text
User taps button
  --> SocialLogin.logout() (clear stale credentials)
  --> SocialLogin.login({ provider: 'google' })
  --> Native account picker appears (no browser)
  --> Returns idToken
  --> supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })
  --> Session created, onAuthStateChange fires
```

### Web Flow Detail

```text
User clicks button
  --> supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: origin })
  --> Browser redirects to Google
  --> Google redirects back to app
  --> Supabase handles session from URL hash
```

### Key Improvements Over Current Code
- **Logout before login** on native to prevent stale credential issues
- **No popup window** on web (direct redirect, more reliable)
- **Initialization separated** from sign-in (called once at startup)
- **Cancellation handling** -- user dismissing picker is not treated as an error
- **Reusable button component** -- drop into any page
- **Portable hook** -- self-contained, easy to copy to other projects

