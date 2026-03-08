/**
 * Local subscription logo resolver using the `simple-icons` package.
 * Returns SVG data URIs so icons load from the JS bundle — no CDN needed.
 */
import * as simpleIcons from 'simple-icons';

const LOGO_MAP: Record<string, { slug: string; color: string }> = {
  // Entertainment
  'Netflix': { slug: 'netflix', color: '#E50914' },
  'Disney+': { slug: 'disneyplus', color: '#113CCF' },
  'HBO Max': { slug: 'hbo', color: '#5822B4' },
  'Paramount+': { slug: 'paramountplus', color: '#0064FF' },
  'Apple TV+': { slug: 'appletv', color: '#000000' },
  'Crunchyroll': { slug: 'crunchyroll', color: '#F47521' },
  'Audible': { slug: 'audible', color: '#F8991C' },
  'Twitch': { slug: 'twitch', color: '#9146FF' },
  'Hulu': { slug: 'hulu', color: '#1CE783' },
  'Peacock': { slug: 'peacock', color: '#000000' },

  // Music
  'Spotify': { slug: 'spotify', color: '#1DB954' },
  'YouTube Premium': { slug: 'youtube', color: '#FF0000' },
  'Apple Music': { slug: 'applemusic', color: '#FA243C' },
  'Tidal': { slug: 'tidal', color: '#000000' },
  'Deezer': { slug: 'deezer', color: '#FEAA2D' },
  'SoundCloud Go': { slug: 'soundcloud', color: '#FF3300' },
  'Pandora': { slug: 'pandora', color: '#224099' },

  // Productivity
  'Notion': { slug: 'notion', color: '#000000' },
  'Zoom': { slug: 'zoom', color: '#0B5CFF' },
  'Figma': { slug: 'figma', color: '#F24E1E' },
  'Canva Pro': { slug: 'canva', color: '#00C4CC' },
  'ChatGPT Plus': { slug: 'openai', color: '#412991' },
  'Claude Pro': { slug: 'anthropic', color: '#D97757' },
  'Copilot Pro': { slug: 'githubcopilot', color: '#000000' },
  'Adobe Creative Cloud': { slug: 'adobe', color: '#FF0000' },
  'Grammarly': { slug: 'grammarly', color: '#15C39A' },
  'Todoist': { slug: 'todoist', color: '#E44332' },
  'Trello': { slug: 'trello', color: '#0052CC' },
  'Asana': { slug: 'asana', color: '#F06A6A' },
  'Jira': { slug: 'jira', color: '#0052CC' },
  'Airtable': { slug: 'airtable', color: '#18BFFF' },
  'Miro': { slug: 'miro', color: '#050038' },
  'Linear': { slug: 'linear', color: '#5E6AD2' },
  'Loom': { slug: 'loom', color: '#625DF5' },
  'Calendly': { slug: 'calendly', color: '#006BFF' },
  'Evernote': { slug: 'evernote', color: '#00A82D' },
  'Slack': { slug: 'slack', color: '#4A154B' },
  'Monday.com': { slug: 'monday', color: '#FF3D57' },

  // Cloud & Dev
  'GitHub': { slug: 'github', color: '#181717' },
  'GitLab': { slug: 'gitlab', color: '#FC6D26' },
  'Google One': { slug: 'google', color: '#4285F4' },
  'iCloud+': { slug: 'icloud', color: '#3693F3' },
  'Dropbox': { slug: 'dropbox', color: '#0061FF' },
  'Vercel': { slug: 'vercel', color: '#000000' },
  'Netlify': { slug: 'netlify', color: '#00C7B7' },
  'DigitalOcean': { slug: 'digitalocean', color: '#0080FF' },
  'AWS': { slug: 'amazonwebservices', color: '#232F3E' },
  'Cloudflare': { slug: 'cloudflare', color: '#F38020' },
  'Heroku': { slug: 'heroku', color: '#430098' },

  // Security
  '1Password': { slug: '1password', color: '#0094F5' },
  'LastPass': { slug: 'lastpass', color: '#D32D27' },
  'Bitwarden': { slug: 'bitwarden', color: '#175DDC' },
  'NordVPN': { slug: 'nordvpn', color: '#4687FF' },
  'ExpressVPN': { slug: 'expressvpn', color: '#DA3940' },
  'SurfShark': { slug: 'surfshark', color: '#178BF1' },

  // Education
  'Coursera Plus': { slug: 'coursera', color: '#0056D2' },
  'Duolingo Plus': { slug: 'duolingo', color: '#58CC02' },
  'Codecademy': { slug: 'codecademy', color: '#1F4056' },
  'Skillshare': { slug: 'skillshare', color: '#00FF84' },

  // Shopping & Food
  'Amazon Prime': { slug: 'amazon', color: '#FF9900' },
  'DoorDash DashPass': { slug: 'doordash', color: '#FF3008' },
  'Uber One': { slug: 'uber', color: '#000000' },
  'Instacart+': { slug: 'instacart', color: '#43B02A' },
  'Shopify': { slug: 'shopify', color: '#7AB55C' },

  // Gaming
  'PlayStation Plus': { slug: 'playstation', color: '#003791' },
  'Xbox Game Pass': { slug: 'xbox', color: '#107C10' },
  'Nintendo Switch Online': { slug: 'nintendoswitch', color: '#E60012' },
  'EA Play': { slug: 'ea', color: '#000000' },
  'Reddit Premium': { slug: 'reddit', color: '#FF4500' },

  // Dating
  'Bumble': { slug: 'bumble', color: '#FFC629' },
  'Tinder': { slug: 'tinder', color: '#FF6B6B' },

  // Fitness
  'Apple Fitness+': { slug: 'apple', color: '#000000' },
  'Strava': { slug: 'strava', color: '#FC4C02' },
  'Peloton': { slug: 'peloton', color: '#000000' },

  // News & Media
  'Medium': { slug: 'medium', color: '#000000' },
  'Substack': { slug: 'substack', color: '#FF6719' },
  'The New York Times': { slug: 'newyorktimes', color: '#000000' },

  // Marketing & Business
  'Mailchimp': { slug: 'mailchimp', color: '#FFE01B' },
  'HubSpot': { slug: 'hubspot', color: '#FF7A59' },
  'Stripe': { slug: 'stripe', color: '#635BFF' },
  'Squarespace': { slug: 'squarespace', color: '#000000' },
  'WordPress': { slug: 'wordpress', color: '#21759B' },
  'Wix': { slug: 'wix', color: '#0C6EFC' },
  'Google Workspace': { slug: 'google', color: '#4285F4' },
  'Microsoft 365': { slug: 'microsoft', color: '#5E5E5E' },

  // Additional services
  'LinkedIn Premium': { slug: 'linkedin', color: '#0A66C2' },
  'Kindle Unlimited': { slug: 'amazon', color: '#FF9900' },
  'MyFitnessPal': { slug: 'myfitnesspal', color: '#0070E0' },
  'Walmart+': { slug: 'walmart', color: '#0071CE' },
  'Cursor Pro': { slug: 'cursor', color: '#000000' },
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
