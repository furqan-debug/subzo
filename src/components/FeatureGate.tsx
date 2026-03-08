import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { canAccess, type Feature } from '@/lib/planFeatures';

interface FeatureGateProps {
  feature: Feature;
  children: React.ReactNode;
  /** Shown as blurred overlay instead of full lock */
  blur?: boolean;
  title?: string;
  description?: string;
}

const FeatureGate = ({ feature, children, blur, title, description }: FeatureGateProps) => {
  const { subscriptionPlan } = useProfile();

  if (canAccess(subscriptionPlan, feature)) {
    return <>{children}</>;
  }

  if (blur) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-50">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <UpgradeCTA title={title} description={description} />
        </div>
      </div>
    );
  }

  return <LockedState title={title} description={description} />;
};

function UpgradeCTA({
  title = 'Upgrade to unlock',
  description = 'This feature is available on a paid plan.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 text-center max-w-xs mx-auto"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mx-auto mb-3">
        <Lock className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-display font-semibold text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 mb-4">{description}</p>
      <Button asChild size="sm" className="glow-primary bg-gradient-to-r from-primary to-primary-glow">
        <Link to="/plans">
          <Crown className="h-3.5 w-3.5 mr-1.5" />
          View Plans
        </Link>
      </Button>
    </motion.div>
  );
}

function LockedState({
  title = 'Upgrade to unlock',
  description = 'This feature is available on a paid plan.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <UpgradeCTA title={title} description={description} />
    </div>
  );
}

export default FeatureGate;
