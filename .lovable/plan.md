

# Sort Catalog by Popularity

## Approach
Since we don't have usage data, we'll define a popularity ranking client-side. The most recognized services (Netflix, Spotify, YouTube, etc.) get sorted first, with remaining services alphabetical after.

## Changes

### `src/hooks/useSubscriptions.ts`
- Keep the DB query as-is (ordered by name)
- After fetching, sort client-side using a popularity map: top ~25 services get explicit rank numbers, everything else falls to the end alphabetically

### Popularity Order (top tier first)
Netflix, Spotify, YouTube Premium, Amazon Prime, Disney+, Apple Music, HBO Max, ChatGPT Plus, Claude Pro, Google One, iCloud+, Adobe Creative Cloud, Microsoft 365, Hulu, Paramount+, Apple TV+, Notion, Slack, Zoom, GitHub, Figma, Dropbox, NordVPN, Crunchyroll, PlayStation Plus

All others: sorted alphabetically after these.

