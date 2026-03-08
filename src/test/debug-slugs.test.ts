import { describe, it } from 'vitest';
import * as simpleIcons from 'simple-icons';

describe('debug slugs', () => {
  it('find correct slugs', () => {
    const icons = simpleIcons as any;
    const allIcons: { slug: string; title: string }[] = [];
    for (const val of Object.values(icons)) {
      if (val && typeof val === 'object' && 'slug' in (val as any)) {
        allIcons.push({ slug: (val as any).slug, title: (val as any).title });
      }
    }
    
    const searches = ['amazon', 'disney', 'openai', 'chatgpt', 'adobe', 'microsoft', 'hulu', 'paramount', 'slack', 'linkedin', 'canva', 'kindle', 'xbox', 'nintendo', 'espn', 'aws', 'heroku', 'monday'];
    for (const s of searches) {
      const matches = allIcons.filter(i => i.slug.includes(s) || i.title.toLowerCase().includes(s));
      console.log(`\n${s}:`, matches.map(m => `${m.title} (${m.slug})`));
    }
  });
});
