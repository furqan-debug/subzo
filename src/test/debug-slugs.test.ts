import { describe, it, expect } from 'vitest';
import * as simpleIcons from 'simple-icons';

describe('debug slugs', () => {
  it('find amazon related icons', () => {
    const icons = simpleIcons as Record<string, { slug?: string; title?: string }>;
    const amazonIcons = Object.values(icons)
      .filter((v) => v && typeof v === 'object' && 'slug' in v && typeof v.slug === 'string' && v.slug.includes('amazon'))
      .map((v) => ({ slug: v.slug, title: v.title }));
    console.log('Amazon icons:', JSON.stringify(amazonIcons));
    expect(amazonIcons.length).toBeGreaterThan(0);
  });
});
