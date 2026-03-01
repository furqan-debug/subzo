

# Add Calendar View and Upcoming Subscriptions Widget

Inspired by the reference screenshots, this plan adds two new features: a **Calendar page** showing renewal dates with subscription logos on calendar days, and an **Upcoming Subscriptions widget** on the home page with a horizontally scrollable card strip.

---

## 1. Create Calendar Page (`src/pages/CalendarPage.tsx`)

A new page at `/calendar` showing a monthly calendar view where:
- Each day that has a subscription renewal shows the subscription's logo (or first letter) as a small indicator
- Tapping a day with renewals shows the subscription details below the calendar
- Month navigation with left/right arrows
- Today is highlighted
- Uses the existing `react-day-picker` library (already installed) with custom day rendering

**Key behavior:**
- Build a map of `day -> subscription[]` from active subscriptions' `next_renewal` dates
- Custom `DayContent` component renders the logo inside the calendar cell
- Below the calendar, a "Selected day" section shows the subscriptions renewing on the tapped date with name, amount, and billing cycle
- Clean, minimal design matching the app's glass-card aesthetic

---

## 2. Add Upcoming Subscriptions Widget to Home Page (`src/pages/Index.tsx`)

Replace or enhance the current "Upcoming renewals" section with a horizontally scrollable card strip (like the reference image's widget):
- Each card shows: logo, subscription name, "Renew in Xd" text in orange/warning color, and price/cycle
- Horizontal scroll with `overflow-x-auto` and snap scrolling
- Limited to subscriptions renewing within the next 14 days
- Cards link to subscription detail page

---

## 3. Add Calendar to Bottom Navigation (`src/components/AppLayout.tsx`)

Replace one of the existing nav items or add Calendar as a 5th item:
- Replace the "Add" nav item (since there's already a FAB for adding) with a Calendar icon
- Route: `/calendar`
- Icon: `CalendarDays` from lucide-react

---

## 4. Register Route in App.tsx

Add the `/calendar` route wrapped in `ProtectedRoute > AppLayout > PageTransition`.

---

## Technical Details

**CalendarPage.tsx structure:**
- Uses `react-day-picker` `DayPicker` component with custom `components.DayContent`
- `useMemo` to build a `Map<string, Subscription[]>` keyed by `YYYY-MM-DD`
- State: `selectedDate` for showing details below calendar
- Custom day rendering: if subscriptions exist for that day, show a small logo or colored dot; otherwise normal number

**Home widget structure:**
- Horizontal flex container with `overflow-x-auto`, `snap-x`, `snap-mandatory`
- Each card: `snap-start`, `min-w-[140px]`, glass-card styling
- Shows logo, name, renewal countdown in warning color, price

**Files to create:**
- `src/pages/CalendarPage.tsx`

**Files to modify:**
- `src/pages/Index.tsx` -- add horizontal upcoming widget
- `src/components/AppLayout.tsx` -- swap "Add" nav for "Calendar"
- `src/App.tsx` -- add `/calendar` route

