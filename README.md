# Subzo — Smart Subscription Tracker

Manage, track, and optimize all your subscriptions in one place.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage)
- **Mobile:** Capacitor (iOS & Android)

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd subzo

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Mobile Development

```sh
# Add native platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Run on device/emulator
npx cap run ios      # Requires Xcode (macOS only)
npx cap run android  # Requires Android Studio
```

## Deployment

Build the production bundle:

```sh
npm run build
```

The output will be in the `dist/` directory, ready for deployment.
