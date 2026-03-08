import { describe, it, expect } from 'vitest';
import { getLocalLogoUrl } from '@/lib/subscriptionLogos';

describe('getLocalLogoUrl', () => {
  it('returns a data URI for known services', () => {
    const url = getLocalLogoUrl('Netflix');
    expect(url).not.toBeNull();
    expect(url).toMatch(/^data:image\/svg\+xml,/);
  });

  it('returns a data URI for Spotify', () => {
    const url = getLocalLogoUrl('Spotify');
    expect(url).not.toBeNull();
    expect(url).toContain('data:image/svg+xml,');
  });

  it('returns null for unknown services', () => {
    expect(getLocalLogoUrl('SomeRandomService')).toBeNull();
  });

  it('returns logos for all major mapped services', () => {
    const services = [
      'Netflix', 'Spotify', 'YouTube Premium', 'Amazon Prime', 'Disney+',
      'Apple Music', 'ChatGPT Plus', 'Claude Pro', 'GitHub', 'Figma',
      'Notion', 'Slack', 'Zoom', 'Dropbox', 'NordVPN',
    ];
    for (const name of services) {
      const url = getLocalLogoUrl(name);
      expect(url, `Logo missing for ${name}`).not.toBeNull();
    }
  });

  it('includes brand color in the SVG', () => {
    const url = getLocalLogoUrl('Netflix');
    // Netflix color is #E50914
    expect(url).toContain(encodeURIComponent('#E50914'));
  });
});
