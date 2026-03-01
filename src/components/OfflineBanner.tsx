import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 2500);
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-warning/90 py-1.5 text-xs font-medium text-warning-foreground backdrop-blur-sm"
          style={{ color: 'hsl(0 0% 10%)' }}
        >
          <WifiOff className="h-3.5 w-3.5" />
          You're offline — showing cached data
        </motion.div>
      )}
      {showBackOnline && !isOffline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-success/90 py-1.5 text-xs font-medium backdrop-blur-sm"
          style={{ color: 'hsl(0 0% 100%)' }}
        >
          <Wifi className="h-3.5 w-3.5" />
          Back online
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
