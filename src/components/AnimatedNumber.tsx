import { useEffect, useRef } from 'react';
import { useSpring, useMotionValue, motion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}

const AnimatedNumber = ({ value, prefix = '', decimals = 2, className }: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 20 });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, decimals]);

  return <span ref={ref} className={className}>{prefix}0.{'0'.repeat(decimals)}</span>;
};

export default AnimatedNumber;
