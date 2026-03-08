

# Make the Hero Card Feel Truly Premium Per Tier

## Problem
The current tier differences are too subtle — slightly different glow intensities and border colors. A user upgrading from Free to Pro sees almost the same card. There's no "wow" moment.

## Approach: Dramatically Different Cards Per Tier

Instead of tweaking CSS opacity values, each tier gets a structurally different card with unique visual elements.

### Free Tier — Clean & Minimal
- Current minimal design, no decoration
- Simple greeting, plain text amount
- Muted color palette, no glow orbs
- Small "Unlock Pro features" text link at bottom

### Pro Monthly — Animated & Vibrant
- Purple gradient background with visible shimmer animation sweeping across the card
- Animated gradient border (not just a static border color)
- "Pro" badge with a subtle pulse-glow animation
- A decorative horizontal divider line with gradient fade between greeting and amount
- The yearly projection pill gets a slight glow ring
- Subscription count shown in a styled chip instead of plain text

### Pro Elite (Annual) — Luxury & Gold
- Deep purple-to-dark gradient with gold accent highlights
- Animated gold shimmer line sweeping across the top
- Floating particle dots (2-3 small gold circles with float animation at different speeds)
- "Elite" badge with gold fill and star icon, continuous subtle glow animation
- The spending amount uses a gold-tinted gradient text instead of the standard purple gradient
- A "Premium Member" subtitle line under the greeting in gold muted text
- Yearly projection pill in gold theme
- Decorative corner accent (small radial gradient in top-right corner)

## Key Design Principles
- Each tier upgrade should feel like opening a new level — not a config tweak
- Animations reserved for paid tiers only (free = static, pro = shimmer, elite = shimmer + float)
- Gold is exclusive to Elite — Pro never uses gold
- Keep the premium fintech aesthetic, nothing cartoonish

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Restructure hero card into 3 distinct render paths with unique layouts, decorative elements, animated particles for elite, gradient text variants |
| `src/index.css` | Add gold gradient text class, floating particle keyframes, animated border shimmer, new tier-specific decorative utilities |

