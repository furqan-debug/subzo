

# Push Notifications for Subscription Renewals

## Approach: Capacitor Local Notifications

Since the app already tracks `next_renewal` dates and a user-configurable `reminder_days_before` setting, the most reliable approach is **Capacitor Local Notifications**. These are scheduled directly on the device -- no server infrastructure, no Firebase/APNs setup, and they work offline.

---

## How It Works

1. When the app opens, it reads all active subscriptions and the user's `reminder_days_before` preference
2. It calculates the notification date for each subscription (renewal date minus reminder days)
3. It schedules a local notification for each upcoming renewal
4. Notifications re-sync every time the app opens or a subscription is added/edited/deleted

Example: If Netflix renews on March 15 and reminder is set to 3 days, a notification fires on March 12 saying "Netflix renews in 3 days -- $14.99"

---

## What Gets Built

### 1. Install `@capacitor/local-notifications` package

### 2. Create `src/hooks/useNotifications.ts`
- Request notification permission on first app launch
- `scheduleRenewalNotifications(subscriptions, reminderDays)` function that:
  - Cancels all previously scheduled notifications
  - Loops through active subscriptions
  - For each, calculates `next_renewal - reminder_days_before`
  - Skips dates in the past
  - Schedules a notification with title like "Upcoming Renewal" and body like "Netflix renews in 3 days -- $14.99"

### 3. Update `src/App.tsx`
- Call `useNotifications()` at app level so notifications sync on every app open

### 4. Update `src/hooks/useSubscriptions.ts`
- After add/update/delete mutations succeed, trigger a re-schedule of notifications

### 5. Update `src/pages/SettingsPage.tsx`
- After saving `reminder_days_before`, trigger a re-schedule so the new preference takes effect immediately

### 6. Add notification permission prompt
- On first launch, show a clean prompt explaining why notifications are needed before requesting OS permission
- Store permission state so we don't re-ask

---

## Notification Content

Each notification will include:
- **Title**: "Subscription Renewal"
- **Body**: "{Name} renews in {N} days -- {currency}{amount}"
- **Schedule**: Fires at 9:00 AM on the reminder date (not middle of the night)
- **Unique ID**: Based on subscription ID so updates replace old notifications

---

## Technical Notes

- `@capacitor/local-notifications` works on both iOS and Android natively
- On web (browser preview), notifications gracefully no-op so the app won't break
- After any code changes, you'll need to run `npx cap sync` to update the native project
- Android 13+ requires runtime notification permission (handled automatically by the plugin)
- iOS always requires permission (handled via the plugin's `requestPermissions()`)

