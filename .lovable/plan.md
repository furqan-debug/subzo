

# Add More Popular Subscriptions to Catalog

## Current State
The catalog has ~45 services. Many widely-used subscriptions are missing.

## New Services to Add (~30 more)

| Service | Category | Price/mo | Website |
|---------|----------|----------|---------|
| Claude Pro | Productivity | $20.00 | anthropic.com |
| Gemini Advanced | Productivity | $19.99 | gemini.google.com |
| Copilot Pro | Productivity | $20.00 | microsoft.com |
| Perplexity Pro | Productivity | $20.00 | perplexity.ai |
| Midjourney | Productivity | $10.00 | midjourney.com |
| Cursor Pro | Productivity | $20.00 | cursor.com |
| Vercel Pro | Professional | $20.00 | vercel.com |
| Stripe | Professional | $0.00 | stripe.com |
| AWS | Cloud | $29.99 | aws.amazon.com |
| Cloudflare | Cloud | $5.00 | cloudflare.com |
| Bitwarden | Security | $3.33 | bitwarden.com |
| Surfshark | Security | $12.95 | surfshark.com |
| Bumble | Other | $29.99 | bumble.com |
| Tinder | Other | $14.99 | tinder.com |
| MasterClass | Education | $10.00 | masterclass.com |
| Brilliant | Education | $11.99 | brilliant.org |
| Codecademy | Education | $17.49 | codecademy.com |
| Blinkist | Education | $12.49 | blinkist.com |
| Walmart+ | Shopping | $12.95 | walmart.com |
| Instacart+ | Shopping | $9.99 | instacart.com |
| DoorDash DashPass | Shopping | $9.99 | doordash.com |
| Uber One | Shopping | $9.99 | uber.com |
| Planet Fitness | Fitness | $25.00 | planetfitness.com |
| MyFitnessPal | Fitness | $19.99 | myfitnesspal.com |
| Apple Fitness+ | Fitness | $9.99 | apple.com |
| Noom | Health | $32.00 | noom.com |
| BetterHelp | Health | $65.00 | betterhelp.com |
| Kindle Unlimited | Entertainment | $11.99 | amazon.com |
| Mubi | Entertainment | $14.99 | mubi.com |
| SoundCloud Go+ | Music | $9.99 | soundcloud.com |
| Scribd | Entertainment | $11.99 | scribd.com |

## Implementation

**Single new SQL migration** that:
1. INSERTs ~30 new services with name, category, default_price, billing_cycle, website_url, cancel_url, cancellation_steps, and SimpleIcons/favicon logo URLs
2. Uses `ON CONFLICT` or checks to avoid duplicates if any already exist (Tinder, MasterClass, Kindle Unlimited exist as logo updates but may not have been inserted — will use safe INSERT approach)

## File to Create

| File | Changes |
|------|---------|
| New Supabase migration | INSERT ~30 new subscription_catalog entries with logos from SimpleIcons CDN where available, Google favicons as fallback |

