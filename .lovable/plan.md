

# Plans Page — Elite Premium Card Redesign

## Reference
The uploaded screenshot shows a dark, rich card with deep navy/purple tones, prominent gradient text for the dollar amount, and a clean minimal layout. The plan cards should match this elite fintech aesthetic.

## Changes — `src/pages/Plans.tsx`

### Card Visual Overhaul
- Replace flat `border/bg-card` styling with the `hero-spending-card` gradient background (deep navy-purple) for Pro cards
- Add ambient glow orbs (blurred circles) behind each Pro card for depth
- Top shimmer line (`h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent`) on each card
- Price text uses `text-gradient` class for the bold amount (like the hero spending card)
- Larger price typography (`text-4xl` → `text-5xl`) for impact
- Annual card gets extra glow: `shadow-[0_0_60px_-12px_hsl(var(--primary)/0.25)]`

### Badge Styling
- "⭐ Most Popular" badge: gradient background (`bg-gradient-to-r from-primary to-primary-glow`) with slight glow shadow
- "✓ Active" badge: success gradient with glow
- "Current" (free): stays muted

### Feature List Polish
- Check icons for Pro features get a subtle glow dot (`text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]`)
- Free card X icons stay muted/dim

### Buttons
- Annual "Get Started" button: full gradient (`bg-gradient-to-r from-primary to-primary-glow`) with `glow-primary` class
- Monthly button: outlined with primary border, hover fills gradient
- Free button: stays disabled/muted

### Comparison Table
- Add subtle row hover effect
- Pro column header gets a small crown icon

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Plans.tsx` | Card backgrounds, gradients, glow orbs, badge styles, button styles, typography |

