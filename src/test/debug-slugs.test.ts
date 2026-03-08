import { describe, it } from 'vitest';
import * as simpleIcons from 'simple-icons';

describe('debug slugs', () => {
  it('find missing slugs from our map', () => {
    const icons = simpleIcons as any;
    const bySlug = new Map<string, boolean>();
    for (const val of Object.values(icons)) {
      if (val && typeof val === 'object' && 'slug' in (val as any)) {
        bySlug.set((val as any).slug, true);
      }
    }
    
    const LOGO_MAP: Record<string, string> = {
      'Netflix': 'netflix', 'Spotify': 'spotify', 'YouTube Premium': 'youtube',
      'Amazon Prime': 'amazonprime', 'Disney+': 'disneyplus', 'Apple Music': 'applemusic',
      'HBO Max': 'hbo', 'ChatGPT Plus': 'openai', 'Claude Pro': 'anthropic',
      'Google One': 'google', 'iCloud+': 'icloud', 'Adobe Creative Cloud': 'adobe',
      'Microsoft 365': 'microsoft', 'Hulu': 'hulu', 'Paramount+': 'paramount',
      'Apple TV+': 'appletv', 'Notion': 'notion', 'Slack': 'slack',
      'Zoom': 'zoom', 'GitHub': 'github', 'Figma': 'figma',
      'Dropbox': 'dropbox', 'NordVPN': 'nordvpn', 'Crunchyroll': 'crunchyroll',
      'PlayStation Plus': 'playstation', 'LinkedIn Premium': 'linkedin',
      'Twitch': 'twitch', 'Reddit Premium': 'reddit', 'Duolingo Plus': 'duolingo',
      'Grammarly': 'grammarly', 'Canva Pro': 'canva', 'Evernote': 'evernote',
      'Todoist': 'todoist', 'Trello': 'trello', 'Asana': 'asana',
      '1Password': '1password', 'LastPass': 'lastpass', 'Bitwarden': 'bitwarden',
      'ExpressVPN': 'expressvpn', 'SurfShark': 'surfshark', 'Audible': 'audible',
      'Kindle Unlimited': 'amazonkindle', 'Xbox Game Pass': 'xbox',
      'Nintendo Switch Online': 'nintendoswitch', 'ESPN+': 'espn',
      'Tidal': 'tidal', 'Deezer': 'deezer', 'SoundCloud Go': 'soundcloud',
      'Medium': 'medium', 'Substack': 'substack', 'Vercel': 'vercel',
      'Netlify': 'netlify', 'AWS': 'amazonaws', 'DigitalOcean': 'digitalocean',
      'Heroku': 'heroku', 'GitLab': 'gitlab', 'Jira': 'jira',
      'Monday.com': 'mondaydotcom', 'Airtable': 'airtable', 'Miro': 'miro',
      'Linear': 'linear', 'Loom': 'loom', 'Calendly': 'calendly',
      'Mailchimp': 'mailchimp', 'HubSpot': 'hubspot', 'Stripe': 'stripe',
      'Shopify': 'shopify', 'Squarespace': 'squarespace', 'WordPress': 'wordpress', 'Wix': 'wix',
    };

    const missing: string[] = [];
    const found: string[] = [];
    for (const [name, slug] of Object.entries(LOGO_MAP)) {
      if (bySlug.has(slug)) found.push(name);
      else missing.push(`${name} (${slug})`);
    }
    console.log(`Found: ${found.length}/${Object.keys(LOGO_MAP).length}`);
    console.log('Missing:', missing);
  });
});
