

# Plan: Enhanced Subscription Plans with Feature Gating

## Current State Analysis

**Plans page** lists 3 tiers (monthly/6-month/annual) with generic features but:
- No actual feature gating exists — all users can access everything
- Plans feel weak — features listed aren't enforced or differentiated
- No subscription limits or premium badges shown

## Proposed Changes

### 1. Define Clear, Enforced Feature Tiers

| Feature | Free (No Plan) | Monthly | 6-Month | Annual |
|---------|---------------|---------|---------|--------|
| Track subscriptions | 3 max | Unlimited | Unlimited | Unlimited |
| Smart reminders | ❌ | ✅ | ✅ | ✅ |
| Analytics | Basic (totals only) | Full | Full | Full |
| Calendar view | ❌ | ✅ | ✅ | ✅ |
| Export data (CSV) | ❌ | ❌ | ✅ | ✅ |
| Custom categories | ❌ | ❌ | ❌ | ✅ |
| Priority support badge | ❌ | ❌ | ✅ | ✅ |
| Early access badge | ❌ | ❌ | ❌ | ✅ |

### 2. Implementation

**A. Create `src/lib/planFeatures.ts`**
- Define plan tiers and feature access map
- Helper functions: `canAccessFeature(plan, feature)`, `getSubscriptionLimit(plan)`, `getPlanBadges(plan)`

**B. Update `src/hooks/useProfile.ts`**
- Export plan-aware helpers that components can use

**C. Gate Features in UI**

1. **Index.tsx** — Limit free users to 3 subscriptions; show upgrade prompt when limit reached
2. **Analytics.tsx** — Show full analytics only for paid users; free users see totals only with upgrade CTA
3. **CalendarPage.tsx** — Lock behind paywall for free users
4. **AddSubscription.tsx** — Block adding 4th subscription for free users
5. **SettingsPage.tsx** — Show plan badges and active features
6. **NotificationScheduler.tsx** — Only schedule reminders for paid users

**D. Enhance Plans Page**
- Update features list with clearer value props
- Add "Current Plan" indicator
- Show feature comparison table
- Highlight what user gains by upgrading

**E. Add Premium Badges**
- Show badges in UI for 6-month/annual subscribers (Priority Support, Early Access)

### 3. Files to Modify/Create

| File | Action |
|------|--------|
| `src/lib/planFeatures.ts` | Create — feature gating logic |
| `src/pages/Plans.tsx` | Update — enhanced UI, comparison, current plan |
| `src/pages/Index.tsx` | Update — subscription limit, upgrade prompts |
| `src/pages/Analytics.tsx` | Update — lock advanced features for free |
| `src/pages/CalendarPage.tsx` | Update — paywall for free users |
| `src/pages/AddSubscription.tsx` | Update — block when limit reached |
| `src/pages/SettingsPage.tsx` | Update — show plan badges |
| `src/components/NotificationScheduler.tsx` | Update — paid only |
| `src/components/FeatureGate.tsx` | Create — reusable lock component |

### 4. UX Flow

- Free user adds 4th subscription → modal appears "Upgrade to unlock unlimited subscriptions"
- Free user taps Calendar → sees locked state with upgrade CTA
- Free user views Analytics → sees basic totals, advanced charts blurred/locked
- Paid user sees appropriate badges in settings
- All paid features immediately unlock upon plan selection

