

# Settings Page Design Overhaul

## Current Issues
- Flat, uniform glass-card sections with no visual hierarchy
- Profile card is basic — no plan badge or visual flair
- Preferences section cramped with Save button awkwardly inside
- Plan section has tiny feature chips that feel cluttered
- Sign out button floats at the bottom with no context
- No section headers to organize the page
- Missing account management options (delete account, app version)

## Proposed Design

### Structure (top to bottom)

**1. Profile Hero Section**
- Larger avatar (18x18) with gradient ring matching plan status
- Name + email prominently displayed
- Plan badge inline with name (e.g., "Pro" pill or "Free" pill)
- Member since date in muted text

**2. Subscription Plan Card** (elevated, visually distinct)
- If Free: amber/warning-tinted card with upgrade CTA and brief "You're missing out on..." line
- If Pro: success-tinted card showing plan name, renewal info, and a row of unlocked feature icons
- "Change Plan" / "Upgrade to Pro" button

**3. Preferences Section** (clean grouped list)
- Section header: "Preferences"
- Each setting as a row: icon + label on left, select on right (horizontal layout, not stacked)
- Currency row
- Reminder days row
- Save button below, only enabled when values changed

**4. Account Section**
- Section header: "Account"
- Sign out row styled as a list item (not a full-width destructive button)
- Delete account row (navigates or opens confirmation) — required by Google Play policy
- App version text at bottom in muted

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/SettingsPage.tsx` | Full redesign of layout, sections, visual hierarchy |

## Key Design Decisions
- Use the existing `glass-card` class but vary border colors per section (primary tint for plan, default for preferences)
- Horizontal setting rows instead of stacked label + select
- Track dirty state for Save button (only show when changed)
- Add delete account option (shows confirmation dialog, calls Supabase `auth.admin.deleteUser` or equivalent)
- Keep the premium fintech aesthetic — no neon, subtle gradients

