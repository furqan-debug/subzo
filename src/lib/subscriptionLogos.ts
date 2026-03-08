/**
 * Local subscription logo resolver using the `simple-icons` package.
 * Returns SVG data URIs so icons load from the JS bundle — no CDN needed.
 */
import * as simpleIcons from 'simple-icons';

const LOGO_MAP: Record<string, { slug: string; color: string }> = {
  'Netflix': { slug: 'netflix', color: '#E50914' },
  'Spotify': { slug: 'spotify', color: '#1DB954' },
  'YouTube Premium': { slug: 'youtube', color: '#FF0000' },
  'Apple Music': { slug: 'applemusic', color: '#FA243C' },
  'HBO Max': { slug: 'hbo', color: '#5822B4' },
  'Claude Pro': { slug: 'anthropic', color: '#D97757' },
  'Google One': { slug: 'google', color: '#4285F4' },
  'iCloud+': { slug: 'icloud', color: '#3693F3' },
  'Paramount+': { slug: 'paramountplus', color: '#0064FF' },
  'Apple TV+': { slug: 'appletv', color: '#000000' },
  'Notion': { slug: 'notion', color: '#000000' },
  'Zoom': { slug: 'zoom', color: '#0B5CFF' },
  'GitHub': { slug: 'github', color: '#181717' },
  'Figma': { slug: 'figma', color: '#F24E1E' },
  'Dropbox': { slug: 'dropbox', color: '#0061FF' },
  'NordVPN': { slug: 'nordvpn', color: '#4687FF' },
  'Crunchyroll': { slug: 'crunchyroll', color: '#F47521' },
  'PlayStation Plus': { slug: 'playstation', color: '#003791' },
  'Twitch': { slug: 'twitch', color: '#9146FF' },
  'Reddit Premium': { slug: 'reddit', color: '#FF4500' },
  'Duolingo Plus': { slug: 'duolingo', color: '#58CC02' },
  'Grammarly': { slug: 'grammarly', color: '#15C39A' },
  'Evernote': { slug: 'evernote', color: '#00A82D' },
  'Todoist': { slug: 'todoist', color: '#E44332' },
  'Trello': { slug: 'trello', color: '#0052CC' },
  'Asana': { slug: 'asana', color: '#F06A6A' },
  '1Password': { slug: '1password', color: '#0094F5' },
  'LastPass': { slug: 'lastpass', color: '#D32D27' },
  'Bitwarden': { slug: 'bitwarden', color: '#175DDC' },
  'ExpressVPN': { slug: 'expressvpn', color: '#DA3940' },
  'SurfShark': { slug: 'surfshark', color: '#178BF1' },
  'Audible': { slug: 'audible', color: '#F8991C' },
  'Tidal': { slug: 'tidal', color: '#000000' },
  'Deezer': { slug: 'deezer', color: '#FEAA2D' },
  'SoundCloud Go': { slug: 'soundcloud', color: '#FF3300' },
  'Medium': { slug: 'medium', color: '#000000' },
  'Substack': { slug: 'substack', color: '#FF6719' },
  'Vercel': { slug: 'vercel', color: '#000000' },
  'Netlify': { slug: 'netlify', color: '#00C7B7' },
  'DigitalOcean': { slug: 'digitalocean', color: '#0080FF' },
  'GitLab': { slug: 'gitlab', color: '#FC6D26' },
  'Jira': { slug: 'jira', color: '#0052CC' },
  'Airtable': { slug: 'airtable', color: '#18BFFF' },
  'Miro': { slug: 'miro', color: '#050038' },
  'Linear': { slug: 'linear', color: '#5E6AD2' },
  'Loom': { slug: 'loom', color: '#625DF5' },
  'Calendly': { slug: 'calendly', color: '#006BFF' },
  'Mailchimp': { slug: 'mailchimp', color: '#FFE01B' },
  'HubSpot': { slug: 'hubspot', color: '#FF7A59' },
  'Stripe': { slug: 'stripe', color: '#635BFF' },
  'Shopify': { slug: 'shopify', color: '#7AB55C' },
  'Squarespace': { slug: 'squarespace', color: '#000000' },
  'WordPress': { slug: 'wordpress', color: '#21759B' },
  'Wix': { slug: 'wix', color: '#0C6EFC' },
};

// Pre-build the cache at module load time
const cache = new Map<string, string>();

function buildCache() {
  const icons = simpleIcons as Record<string, { svg?: string; slug?: string }>;
  // Build a lookup by slug for reliable matching
  const bySlug = new Map<string, { svg: string }>();
  for (const val of Object.values(icons)) {
    if (val && typeof val === 'object' && 'slug' in val && 'svg' in val && val.svg) {
      bySlug.set(val.slug as string, val as { svg: string });
    }
  }
  for (const [name, entry] of Object.entries(LOGO_MAP)) {
    const icon = bySlug.get(entry.slug);
    if (!icon?.svg) continue;
    const coloredSvg = icon.svg.replace('<svg', `<svg fill="${entry.color}"`);
    cache.set(name, `data:image/svg+xml,${encodeURIComponent(coloredSvg)}`);
  }
}

buildCache();

/**
 * Returns an SVG data-URI for the given subscription name, or `null` if not mapped.
 */
export function getLocalLogoUrl(name: string): string | null {
  return cache.get(name) ?? null;
}
