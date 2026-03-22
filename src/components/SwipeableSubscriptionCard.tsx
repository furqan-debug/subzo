import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onDelete: () => void;
}

const THRESHOLD = -100;

const SwipeableSubscriptionCard = ({ children, onDelete }: Props) => {
  const x = useMotionValue(0);
  const deletedRef = useRef(false);

  // Color goes from transparent-ish dark → vivid red as the user swipes left
  const bg = useTransform(x, [-150, -60, 0], [
    'hsl(0, 72%, 50%)',  // fully swiped: vivid red
    'hsl(0, 65%, 38%)',  // mid-way: darker red
    'hsl(225, 20%, 10%)', // at rest: matches card background
  ]);
  const iconOpacity = useTransform(x, [-100, -40, 0], [1, 0.5, 0]);
  const iconScale = useTransform(x, [-120, -60, 0], [1.2, 0.9, 0.5]);
  const [swiping, setSwiping] = useState(false);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setSwiping(false);
    if (info.offset.x < THRESHOLD && !deletedRef.current) {
      deletedRef.current = true;
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
          <Trash2 className="h-5 w-5 text-white" />
        </motion.div>
      </motion.div>

      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.08}
        dragSnapToOrigin={false}
        style={{ x }}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        className="relative z-10"
        whileDrag={{ cursor: 'grabbing' }}
      >
        <div style={{ pointerEvents: swiping ? 'none' : 'auto' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default SwipeableSubscriptionCard;
