

# Tier-Adaptive Hero Spending Card

## Concept

The hero spending card on the home page evolves visually based on the user's plan tier, making upgrades feel rewarding. Each tier gets progressively more premium aesthetics — richer gradients, more glow, exclusive badges, and personalized greetings.

## Three Tier Designs

### Free Tier
- Clean, minimal card — current base design (subtle dark gradient, single muted glow orb)
- Greeting: "Hey, {firstName}" in muted text
- No badge
- Subtle nudge: small "Upgrade to Pro" text link near the bottom

### Pro Monthly
- Enhanced gradient with purple tones, two glow orbs (primary + accent)
- Top-right corner: animated shimmer border accent
- Greeting: "Hey, {firstName}" with a **"Pro" badge pill** next to name (purple, small glow)
- Top shine line becomes brighter
- Card border shifts to `border-primary/30`

### Pro Annual
- Most premium: deeper purple-to-blue gradient, three glow orbs, golden accent highlights
- Animated top shine line with gradient sweep
- Greeting: "Hey, {firstName}" with a **"Pro Elite" badge** (gold-tinted, with ⭐ icon, subtle gold glow)
- Card border: `border-[hsl(45,80%,55%)]/25` (gold tint)
- Additional decorative element: faint diamond/star particle in corner

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Import `useAuth` for user name, use `subscriptionPlan` to conditionally render tier-specific card styles, badges, greeting, glow layers |
| `src/index.css` | Add `.hero-card-pro` and `.hero-card-elite` CSS classes with enhanced gradients and box-shadows |

## Implementation Details

- Extract first name from `user.user_metadata.full_name` or `user.email`
- Tier detection via existing `subscriptionPlan` from `useProfile()` (null = free, 'monthly' = Pro, 'annual' = Pro Elite)
- Badge component inline — pill with icon, text, and tier-specific colors
- All visual changes are purely CSS classes + conditional classNames — no structural changes to the card layout
- Glow orb count and intensity increase per tier

