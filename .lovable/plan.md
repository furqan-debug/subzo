

# Subzo — Subscription Tracker & Manager

## Overview
A dark-themed, modern subscription management app with minimal friction UX. Users can track all their recurring subscriptions, get reminders before charges, view spending analytics, and access guided cancellation flows. Built as a web app with Capacitor for native mobile deployment.

## Design Direction
- **Dark & modern** fintech aesthetic — dark backgrounds, subtle gradients, accent colors (e.g., electric blue/purple)
- Minimal UI with large touch targets for mobile-first experience
- Card-based layout for subscriptions
- Smooth animations and transitions

## Pages & Features

### 1. Auth (Sign Up / Login)
- Email + password authentication
- Google OAuth sign-in
- Clean onboarding with app value proposition
- Password reset flow

### 2. Dashboard (Home)
- **Monthly spending summary** at the top (total, change vs last month)
- **Upcoming renewals** section showing next 7 days
- **Active subscriptions list** as cards with logo, name, price, next billing date
- Quick-add button (floating action button style)

### 3. Add Subscription
- **Search from catalog** — 50+ popular services with pre-filled logos, categories, and cancellation links (Netflix, Spotify, Hulu, Disney+, Adobe, etc.)
- **Custom entry** — name, amount, billing cycle (weekly/monthly/yearly), start date, category
- Category tags: Entertainment, Music, Productivity, Cloud, Fitness, News, etc.

### 4. Subscription Detail
- Full details: name, cost, billing cycle, next renewal, total spent to date
- Edit/delete subscription
- **Cancel subscription button** → opens guided cancellation:
  - Direct link to the service's cancellation page
  - Step-by-step cancellation instructions specific to that service
  - Mark as "cancellation requested" status

### 5. Analytics / Insights
- **Monthly spending chart** (bar chart over time)
- **Spending by category** (donut/pie chart)
- **Total yearly projection**
- Most expensive subscription highlight

### 6. Reminders & Notifications
- In-app reminder settings: notify X days before renewal
- Upcoming renewals notification list
- Toast/banner notifications within the app

### 7. Profile & Settings
- Account management
- Currency preference
- Default reminder timing
- Dark/light mode toggle
- Sign out

## Backend (Supabase)
- **profiles** table — user preferences, currency
- **subscriptions** table — user's tracked subscriptions with RLS
- **subscription_catalog** table — pre-built catalog of popular services with logos, cancellation URLs, and instructions
- **reminders** table — user-configured reminders
- Row-Level Security on all user data tables

## Mobile Setup
- Capacitor configuration for native iOS/Android wrapping
- Mobile-optimized responsive design
- PWA-ready as fallback

