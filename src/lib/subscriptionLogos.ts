/**
 * Local subscription logo resolver using the `simple-icons` package.
 * Returns SVG data URIs so icons load from the JS bundle — no CDN needed.
 */

const LOGO_MAP: Record<string, { slug: string; color: string }> = {
  'Netflix': { slug: 'netflix', color: '#E50914' },
  'Spotify': { slug: 'spotify', color: '#1DB954' },
  'YouTube Premium': { slug: 'youtube', color: '#FF0000' },
  'Amazon Prime': { slug: 'amazonprime', color: '#00A8E1' },
  'Disney+': { slug: 'disneyplus', color: '#113CCF' },
  'Apple Music': { slug: 'applemusic', color: '#FA243C' },
  'HBO Max': { slug: 'hbo', color: '#5822B4' },
  'ChatGPT Plus': { slug: 'openai', color: '#412991' },
  'Claude Pro': { slug: 'anthropic', color: '#D97757' },
  'Google One': { slug: 'google', color: '#4285F4' },
  'iCloud+': { slug: 'icloud', color: '#3693F3' },
  'Adobe Creative Cloud': { slug: 'adobe', color: '#FF0000' },
  'Microsoft 365': { slug: 'microsoft', color: '#5E5E5E' },
  'Hulu': { slug: 'hulu', color: '#1CE783' },
  'Paramount+': { slug: 'paramount', color: '#0064FF' },
  'Apple TV+': { slug: 'appletv', color: '#000000' },
  'Notion': { slug: 'notion', color: '#000000' },
  'Slack': { slug: 'slack', color: '#4A154B' },
  'Zoom': { slug: 'zoom', color: '#0B5CFF' },
  'GitHub': { slug: 'github', color: '#181717' },
  'Figma': { slug: 'figma', color: '#F24E1E' },
  'Dropbox': { slug: 'dropbox', color: '#0061FF' },
  'NordVPN': { slug: 'nordvpn', color: '#4687FF' },
  'Crunchyroll': { slug: 'crunchyroll', color: '#F47521' },
  'PlayStation Plus': { slug: 'playstation', color: '#003791' },
  'LinkedIn Premium': { slug: 'linkedin', color: '#0A66C2' },
  'Twitch': { slug: 'twitch', color: '#9146FF' },
  'Reddit Premium': { slug: 'reddit', color: '#FF4500' },
  'Duolingo Plus': { slug: 'duolingo', color: '#58CC02' },
  'Grammarly': { slug: 'grammarly', color: '#15C39A' },
  'Canva Pro': { slug: 'canva', color: '#00C4CC' },
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
  'Kindle Unlimited': { slug: 'amazonkindle', color: '#FF9900' },
  'Xbox Game Pass': { slug: 'xbox', color: '#107C10' },
  'Nintendo Switch Online': { slug: 'nintendoswitch', color: '#E60012' },
  'Peacock': { slug: 'peacock', color: '#000000' },
  'ESPN+': { slug: 'espn', color: '#FF1F1F' },
  'Tidal': { slug: 'tidal', color: '#000000' },
  'Deezer': { slug: 'deezer', color: '#FEAA2D' },
  'SoundCloud Go': { slug: 'soundcloud', color: '#FF3300' },
  'Medium': { slug: 'medium', color: '#000000' },
  'Substack': { slug: 'substack', color: '#FF6719' },
  'Vercel': { slug: 'vercel', color: '#000000' },
  'Netlify': { slug: 'netlify', color: '#00C7B7' },
  'AWS': { slug: 'amazonaws', color: '#232F3E' },
  'DigitalOcean': { slug: 'digitalocean', color: '#0080FF' },
  'Heroku': { slug: 'heroku', color: '#430098' },
  'GitLab': { slug: 'gitlab', color: '#FC6D26' },
  'Jira': { slug: 'jira', color: '#0052CC' },
  'Confluence': { slug: 'confluence', color: '#172B4D' },
  'Monday.com': { slug: 'mondaydotcom', color: '#6C00FF' },
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

// Cache resolved logos so we only build the data URI once per slug
const cache = new Map<string, string>();

/**
 * Returns an SVG data-URI for the given subscription name, or `null` if not mapped.
 * Uses dynamic import to keep the initial bundle lean — each icon is resolved on first call.
 */
export function getLocalLogoUrl(name: string): string | null {
  const entry = LOGO_MAP[name];
  if (!entry) return null;

  if (cache.has(name)) return cache.get(name)!;

  try {
    // simple-icons exposes each icon as a named export from its index
    // We use require to synchronously resolve at runtime (works with Vite's SSR / bundler)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const icons = require('simple-icons');
    const key = `si${entry.slug.charAt(0).toUpperCase()}${entry.slug.slice(1)}`;
    const icon = icons[key];
    if (!icon?.svg) return null;

    // Inject the brand color into the SVG
    const coloredSvg = icon.svg.replace('<svg', `<svg fill="${entry.color}"`);
    const dataUri = `data:image/svg+xml,${encodeURIComponent(coloredSvg)}`;
    cache.set(name, dataUri);
    return dataUri;
  } catch {
    return null;
  }
}

/**
 * Async version that uses dynamic import — preferred for Vite/ESM environments.
 * Pre-loads and caches logos for a list of names.
 */
export async function preloadLogos(names: string[]): Promise<void> {
  const uniqueNames = names.filter((n) => LOGO_MAP[n] && !cache.has(n));
  if (uniqueNames.length === 0) return;

  try {
    const icons = await import('simple-icons');
    for (const name of uniqueNames) {
      const entry = LOGO_MAP[name]!;
      const key = `si${entry.slug.charAt(0).toUpperCase()}${entry.slug.slice(1)}`;
      const icon = (icons as any)[key];
      if (!icon?.svg) continue;
      const coloredSvg = icon.svg.replace('<svg', `<svg fill="${entry.color}"`);
      cache.set(name, `data:image/svg+xml,${encodeURIComponent(coloredSvg)}`);
    }
  } catch {
    // silently fail — fallback to initials
  }
}

/**
 * Synchronous getter that only reads from cache (after preloadLogos has run).
 */
export function getCachedLogoUrl(name: string): string | null {
  return cache.get(name) ?? null;
}
