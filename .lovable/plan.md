
# Smoothness and Value Upgrade for Subzo

## Overview
Enhance the app with smoother page transitions, skeleton loading states, pull-to-refresh feel, richer data insights, and small quality-of-life features that make the app feel polished and worth opening daily.

---

## 1. Smooth Page Transitions with AnimatePresence

Wrap the Routes in `AnimatePresence` with a shared page transition wrapper so navigating between pages has a fluid crossfade instead of an instant swap.

- Create a `PageTransition` wrapper component using framer-motion (`opacity` + slight `y` shift, 200ms)
- Wrap each route's content in `PageTransition` keyed by `location.pathname`

---

## 2. Skeleton Loading States (instead of spinners)

Replace every `Loader2 spinner` with contextual skeleton placeholders that match the layout of the content being loaded. This feels significantly smoother.

- **Index page**: Skeleton hero card + 3 skeleton subscription rows
- **Analytics page**: Skeleton stat cards + skeleton pie chart area
- **Settings page**: Skeleton profile card + skeleton preference fields
- **Subscription detail**: Skeleton header + skeleton detail grid

Uses the existing `Skeleton` component from `src/components/ui/skeleton.tsx`.

---

## 3. Animated Number Counter for Monthly Spending

The hero spending card's dollar amount will animate from 0 to the actual value using a counting animation (framer-motion `useSpring`), making the dashboard feel alive when it loads.

---

## 4. Swipe-to-Delete on Subscription Cards (Index page)

Add horizontal swipe gesture on subscription cards (using framer-motion `drag="x"`) that reveals a red delete zone. Swiping past a threshold triggers delete with the existing confetti/sound feedback. This is a native-app-like interaction that adds significant perceived quality.

---

## 5. Quick Stats Bar on Home Page

Add a compact row of 3 micro-stats below the hero card:
- **Cheapest** subscription name + price
- **Most expensive** subscription name + price  
- **Days until next renewal** countdown

These give immediate value each time the user opens the app.

---

## 6. "Money Saved" Section in Analytics

Add a new card showing estimated savings from cancelled subscriptions (sum of cancelled subscription amounts projected over time since cancellation). This makes users feel good about using the app and gives a reason to come back.

---

## 7. Haptic-Like Micro-Interactions

- Button press scale animation (0.97 on tap) across all interactive cards
- Subtle spring bounce on nav tab switch
- Card hover lift effect with shadow progression

---

## Technical Details

### Files to create:
- `src/components/PageTransition.tsx` -- AnimatePresence wrapper
- `src/components/SkeletonLoaders.tsx` -- All skeleton variants (Index, Analytics, Settings, Detail)
- `src/components/AnimatedNumber.tsx` -- Counting number animation component
- `src/components/SwipeableSubscriptionCard.tsx` -- Drag-to-delete card wrapper

### Files to modify:
- `src/App.tsx` -- Add AnimatePresence + PageTransition around Routes
- `src/pages/Index.tsx` -- Use skeletons, AnimatedNumber, SwipeableCard, add quick stats bar
- `src/pages/Analytics.tsx` -- Use skeletons, add "Money Saved" card (from cancelled subs)
- `src/pages/SettingsPage.tsx` -- Use skeletons
- `src/pages/SubscriptionDetail.tsx` -- Use skeletons
- `src/components/AppLayout.tsx` -- Enhanced nav spring animation
- `src/hooks/useSubscriptions.ts` -- Include cancelled subs in query for savings calculation
- `src/index.css` -- Add smooth scroll behavior, touch-action optimizations
