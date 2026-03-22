import { useEffect, useRef } from 'react';
import { useSpring, useMotionValue } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

export interface AnimatedNumberProps {
  value: number;
  /** ISO 4217 currency code (e.g. 'USD', 'EUR'). When provided, formats via Intl.NumberFormat. */
  currency?: string;
  /** Simple prefix (e.g. '$'). Ignored when `currency` is set. */
  prefix?: string;
  decimals?: number;
  className?: string;
}

const AnimatedNumber = ({ value, currency, prefix = '', decimals = 2, className }: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 20 });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = currency
          ? formatCurrency(latest, currency)
          : `${prefix}${latest.toFixed(decimals)}`;
      }
    });
    return unsubscribe;
  }, [springValue, currency, prefix, decimals]);

  const initial = currency ? formatCurrency(0, currency) : `${prefix}${'0'.repeat(decimals > 0 ? 1 : 0)}${decimals > 0 ? '.' + '0'.repeat(decimals) : ''}`;

  return <span ref={ref} className={className}>{initial}</span>;
};

export default AnimatedNumber;
