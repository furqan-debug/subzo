
# Improve App Based on User Feedback

Two key improvements based on competitor app reviews:

---

## 1. Let Users Try Before Subscribing (Free Trial)

**Problem**: Currently, after sign-up, users are immediately forced to the `/plans` page and cannot access ANY features until they pick a paid plan. This creates friction and bad reviews.

**Solution**: Allow users to explore the app freely after sign-up, with a soft paywall approach.

### Changes:
- **Remove the hard paywall gate** in `ProtectedRoute.tsx` -- stop redirecting to `/plans` when no plan is selected. Users can use the app immediately after signing up.
- **Add a subtle upgrade banner** on the home page (`Index.tsx`) -- a dismissible card encouraging users to subscribe, shown only when they have no plan selected. Non-intrusive, appears at the top of the subscription list.
- **Keep the Plans page accessible** from Settings and the banner, but it's no longer a forced gate.

---

## 2. Add Discount & Trial Period Fields to Subscriptions

**Problem**: Users can't track discounted prices or free trial periods for their subscriptions. These are common real-world scenarios (e.g., "50% off for 3 months", "14-day free trial").

**Solution**: Add optional discount and trial tracking fields.

### Database Changes (migration):
- Add columns to `subscriptions` table:
  - `discount_percentage` (numeric, nullable) -- e.g., 50 for 50% off
  - `discount_end_date` (date, nullable) -- when the discount expires
  - `trial_end_date` (date, nullable) -- when the free trial ends

### UI Changes:

**Add Subscription page** (`AddSubscription.tsx`):
- Add an optional "Trial / Discount" collapsible section in the custom subscription form with:
  - Toggle for "Free trial" with a date picker for trial end date
  - Toggle for "Discounted price" with a percentage input and end date

**Subscription Detail page** (`SubscriptionDetail.tsx`):
- Show trial status badge (e.g., "Trial ends in 5 days") if `trial_end_date` is set and in the future
- Show discount info (e.g., "50% off until Mar 15") if discount fields are set
- These appear as additional detail cards in the existing grid

**Home page** (`Index.tsx` / `SwipeableSubscriptionCard.tsx`):
- Show a small "Trial" or "Discounted" badge on subscription cards when applicable

### Types update (`useSubscriptions.ts`):
- Add `discount_percentage`, `discount_end_date`, and `trial_end_date` to the `Subscription` interface

---

## Technical Summary

| File | Change |
|---|---|
| `supabase/migrations/` | New migration adding 3 columns to `subscriptions` |
| `src/integrations/supabase/types.ts` | Will auto-update with new columns |
| `src/hooks/useSubscriptions.ts` | Update `Subscription` interface |
| `src/components/ProtectedRoute.tsx` | Remove forced redirect to `/plans` |
| `src/pages/Index.tsx` | Add soft upgrade banner for free users |
| `src/pages/AddSubscription.tsx` | Add trial/discount fields in custom form |
| `src/pages/SubscriptionDetail.tsx` | Show trial/discount info cards |
| `src/components/SwipeableSubscriptionCard.tsx` | Add trial/discount badges |
