import { describe, it, expect } from 'vitest';
import { getLocalLogoUrl } from '@/lib/subscriptionLogos';

describe('getLocalLogoUrl', () => {
  it('returns a data URI for known services', () => {
    const url = getLocalLogoUrl('Netflix');
    expect(url).not.toBeNull();
    expect(url).toMatch(/^data:image\/svg\+xml,/);
  });

  it('returns null for unknown services', () => {
    expect(getLocalLogoUrl('SomeRandomService')).toBeNull();
  });

  it('returns logos for all major mapped services', () => {
    const services = [
      'Netflix', 'Spotify', 'YouTube Premium', 'Apple Music',
      'Claude Pro', 'GitHub', 'Figma', 'Notion', 'Zoom',
      'Dropbox', 'NordVPN', 'Twitch', 'Bitwarden', 'Stripe',
    ];
    for (const name of services) {
      const url = getLocalLogoUrl(name);
      expect(url, `Logo missing for ${name}`).not.toBeNull();
    }
  });

  it('includes brand color in the SVG', () => {
    const url = getLocalLogoUrl('Netflix');
    expect(url).toContain(encodeURIComponent('#E50914'));
  });

  it('services not in simple-icons fall back gracefully to null', () => {
    // These services are NOT in simple-icons, so should return null
    // The SubscriptionLogo component will fall back to DB logo_url or initials
    expect(getLocalLogoUrl('Amazon Prime')).toBeNull();
    expect(getLocalLogoUrl('Disney+')).toBeNull();
  });
});
