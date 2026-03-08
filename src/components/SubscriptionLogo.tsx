import { getLocalLogoUrl } from '@/lib/subscriptionLogos';

interface SubscriptionLogoProps {
  name: string;
  logoUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { img: 'h-5 w-5', text: 'text-xs' },
  md: { img: 'h-6 w-6', text: 'text-sm' },
  lg: { img: 'h-9 w-9', text: 'text-2xl' },
};

/**
 * Renders a subscription logo with local-first fallback:
 * 1. Local SVG from simple-icons bundle
 * 2. Remote logo_url from DB
 * 3. Text initial badge
 */
const SubscriptionLogo = ({ name, logoUrl, size = 'md', className = '' }: SubscriptionLogoProps) => {
  const localSrc = getLocalLogoUrl(name);
  const src = localSrc ?? logoUrl;
  const s = sizeMap[size];

  if (src) {
    return <img src={src} alt={`${name} logo`} className={`${s.img} object-contain ${className}`} loading="lazy" decoding="async" />;
  }

  return <span className={`${s.text} font-semibold text-muted-foreground ${className}`}>{name?.[0] ?? '?'}</span>;
};

export default SubscriptionLogo;
