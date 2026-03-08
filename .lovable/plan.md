

# Improve Android Notification System for User Engagement

## Current State
- Single notification type: renewal reminder X days before, at 9:00 AM
- Only for Pro users
- No notification channels, no grouping, no variety

## Plan

### 1. Add Android Notification Channels
Create distinct channels so users can control notification types independently in Android settings:
- **Renewal Reminders** (high priority) — existing behavior
- **Spending Insights** (default priority) — weekly/monthly spend summaries
- **Trial Expiry Alerts** (high priority) — urgent alerts before free trials end

Register channels on app startup via `LocalNotifications.createChannel()`.

### 2. Multi-tier Renewal Reminders
Instead of one notification, schedule **two** per subscription:
- **Early reminder**: X days before (existing, user-configured)
- **Day-of reminder**: Morning of renewal day — "Netflix renews today — $15.99"

Uses separate notification IDs (offset the base ID) so both can coexist.

### 3. Trial Expiry Alerts
For subscriptions with `trial_end_date`, schedule a notification **1 day before** trial ends:
- "Your Spotify trial ends tomorrow — cancel before you're charged $9.99"

This is high-value engagement that helps users feel the app is protecting their money.

### 4. Weekly Spending Summary
Schedule a **recurring weekly notification** (e.g., every Monday at 10 AM):
- "You have 3 renewals this week totaling $45.97"

Uses `LocalNotifications.schedule` with `every: 'week'` repeat. The body text is computed at schedule time based on upcoming 7-day renewals.

### 5. Notification Tap Deep Linking
Add a `LocalNotifications.addListener('localNotificationActionPerformed')` handler to navigate users to the relevant subscription detail page when they tap a notification. Use `extra` data field to pass subscription ID.

### Files Modified
- **`src/hooks/useNotifications.ts`** — Add channel creation, multi-tier reminders, trial alerts, weekly summary, and deep link listener
- **`src/components/NotificationScheduler.tsx`** — Pass trial data through, register channels on mount
- **`src/App.tsx`** — Add notification tap listener for deep linking (via `useNavigate`)

### Notification ID Strategy
```text
Renewal reminder (early):  uuidToNotifId(sub.id)
Renewal reminder (day-of): uuidToNotifId(sub.id) + 1
Trial expiry alert:        uuidToNotifId(sub.id) + 2
Weekly summary:            fixed ID 999999
```

