import { describe, it, expect } from 'vitest';
import * as simpleIcons from 'simple-icons';

describe('debug slugs', () => {
  it('check structure', () => {
    const icons = simpleIcons as any;
    // Check a known icon
    const netflix = icons.siNetflix;
    console.log('Netflix keys:', netflix ? Object.keys(netflix) : 'NOT FOUND');
    console.log('Netflix slug:', netflix?.slug);
    
    // Find amazon
    const keys = Object.keys(icons).filter(k => k.toLowerCase().includes('amazon'));
    console.log('Amazon keys:', keys);
    
    const prime = icons.siAmazonprime || icons.siAmazonPrime || icons.siPrime;
    console.log('Prime:', prime ? Object.keys(prime) : 'NOT FOUND');
    
    expect(netflix).toBeTruthy();
  });
});
