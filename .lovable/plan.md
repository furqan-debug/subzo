

# Enforce All Plan Features According to Tiers

## Current State Audit

| Feature | Promised in Plans | Actually Gated? |
|---------|------------------|-----------------|
| Unlimited subscriptions | Yes | ✅ Working — free users capped at 2 |
| Smart renewal reminders | Yes | ⚠️ Partially — notifications are gated in `NotificationScheduler`, but free users can still change reminder settings in Settings (misleading) |
| Full analytics | Yes | ✅ Working — gated with `FeatureGate` blur |
| Calendar view | Yes | ✅ Working — full page gated |
| CSV export | Yes | ❌ Feature doesn't exist at all |
| Priority Support | Yes | N/A — label/badge only |

## What Needs to Be Done

### 1. Build CSV Export Feature (gated to Pro)
- Add an "Export CSV" button on the **Settings** page under a new "Data" section
- On click, fetch all user subscriptions, convert to CSV (name, amount, cycle, category, status, next_renewal), and trigger a browser download
- Wrap the button with `FeatureGate` so free users see a locked state with upgrade prompt

### 2. Gate Reminder Settings for Free Users
- In `SettingsPage.tsx`, wrap the reminder days selector row with a visual lock indicator for free users
- Free users see the reminder row but with a lock icon and "Pro" badge — the select is disabled
- Keeps the UI visible (so they know what they're missing) but non-functional

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/SettingsPage.tsx` | Add CSV export button (gated), disable reminder selector for free users with lock indicator |
| `src/hooks/useSubscriptions.ts` | (if needed) Verify export query works with existing hook |

### Implementation Details

**CSV Export:**
- Uses existing `useSubscriptions()` data — no new API calls
- Generates CSV string client-side with headers: Name, Amount, Billing Cycle, Category, Status, Next Renewal
- Creates a Blob and triggers download via `URL.createObjectURL`
- Wrapped in `FeatureGate` with `feature="export_csv"`

**Reminder Gating:**
- Check `canAccess(subscriptionPlan, 'smart_reminders')`
- If false: disable the Select, show a small Lock icon + "Pro" text next to the label
- Keeps the visual row intact so users see what they'd unlock

