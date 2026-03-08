

# Plan: Simplify to 2 Paid Tiers with Pricing Psychology

## Summary

Consolidate from 3 paid tiers (Monthly / 6-Month / Annual) down to **2 Pro tiers** (Pro Monthly $1.99/mo + Pro Annual $14.99/yr). Reduce free limit from 3 to 2 subscriptions. All Pro features are identical — the annual plan is purely a pricing discount.

## Changes

### 1. `src/lib/planFeatures.ts`
- Remove `'6month'` from `PlanId` type — only `'monthly' | 'annual'`
- Remove `custom_categories` and `early_access` features (all Pro features are the same)
- Give **both** monthly and annual: unlimited subs, reminders, analytics, calendar, CSV export, priority support
- Change `FREE_SUBSCRIPTION_LIMIT` from 3 to **2**
- Update `getPlanTier`: monthly=1, annual=2 (no 6month)

### 2. `src/pages/Plans.tsx`
- Replace 3-card grid with **3 cards: Free (display only) + Pro Monthly + Pro Annual**
- Free card: "2 subscriptions, basic totals" — no button (already on free)
- Pro Monthly: $1.99/mo — all features listed
- Pro Annual: $14.99/yr — "⭐ Most Popular" badge, show savings "$1.99×12 = $23.88 — Save 37%"
- Annual card visually highlighted (border, glow, scale)
- Comparison table: 3 columns (Free / Pro Monthly / Pro Annual) — all Pro features identical
- Update `handleSelect` type to `'monthly' | 'annual'`

### 3. `src/hooks/useProfile.ts`
- Update `selectPlan` type from `'monthly' | '6month' | 'annual'` to `'monthly' | 'annual'`

### 4. `src/pages/SettingsPage.tsx`
- Update `planLabels`: remove `6month`, update prices to `$1.99/mo` and `$14.99/yr`

### 5. Feature gating pages (Index, AddSubscription, Analytics, Calendar, etc.)
- No logic changes needed — they use `canAccess()` which will still work since both `monthly` and `annual` unlock everything

## Feature Comparison (New)

| Feature | Free | Pro |
|---------|------|-----|
| Track subscriptions | 2 max | Unlimited |
| Smart reminders | — | ✓ |
| Full analytics | — | ✓ |
| Calendar view | — | ✓ |
| CSV export | — | ✓ |
| ⭐ Priority Support | — | ✓ |

