import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onDelete: () => void;
}

const THRESHOLD = -100;

const SwipeableSubscriptionCard = ({ children, onDelete }: Props) => {
  const x = useMotionValue(0);
  const bg = useTransform(x, [-150, -100, 0], [
    'hsl(0, 72%, 55%)',
    'hsl(0, 72%, 45%)',
    'hsl(0, 72%, 35%)',
  ]);
  const iconOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const iconScale = useTransform(x, [-120, -80, 0], [1.2, 0.8, 0.5]);
  const [swiping, setSwiping] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setSwiping(false);
    if (info.offset.x < THRESHOLD) {
      onDelete();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete backdrop */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-6 rounded-xl"
        style={{ backgroundColor: bg }}
      >
        <motion.div style={{ opacity: iconOpacity, scale: iconScale }}>
          <Trash2 className="h-5 w-5 text-destructive-foreground" />
        </motion.div>
      </motion.div>

      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        className="relative z-10"
      >
        <div style={{ pointerEvents: swiping ? 'none' : 'auto' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default SwipeableSubscriptionCard;
