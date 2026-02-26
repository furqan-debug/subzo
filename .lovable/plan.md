

## Plan: Add Mock Paywall with Subscription Plans

### Overview
After login, users will see a premium plans page. They select a plan, and the app records their choice — granting access to the main app. No real payment processing.

### Database Changes

**Add columns to `profiles` table:**
- `subscription_plan` (text, default `null`) — stores `'monthly'`, `'6month'`, or `'annual'`
- `plan_selected_at` (timestamptz, default `null`) — when they chose the plan

### New Page: `/plans`

**`src/pages/Plans.tsx`** — A premium-styled plans selection page with:
- Three plan cards: Monthly ($0.99), 6-Month ($4.99), Annual ($8.99)
- Highlight "Most Popular" badge on 6-Month plan
- Savings percentages displayed on 6-month and annual
- Glass-card styling consistent with existing premium theme
- Framer Motion staggered entry animations
- On plan selection: update `profiles.subscription_plan`, play the add celebration sound/confetti, navigate to `/`

### Routing & Access Control

**`src/components/ProtectedRoute.tsx`** — After confirming user is authenticated, query their profile for `subscription_plan`. If `null`, redirect to `/plans`.

**`src/App.tsx`** — Add `/plans` route (authenticated but not behind paywall check).

### Hook Updates

**`src/hooks/useProfile.ts`** (new) — Hook to fetch/update the current user's profile, exposing `subscription_plan` for the paywall gate.

### Implementation Steps

1. Run migration to add `subscription_plan` and `plan_selected_at` columns to `profiles`
2. Create `useProfile` hook
3. Create `Plans.tsx` page with three plan cards, animations, and celebration feedback
4. Update `ProtectedRoute` to check subscription status and redirect unpaid users to `/plans`
5. Add `/plans` route to `App.tsx`

