import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, X, Shield, Download, Tag, Bell, BarChart3, CalendarDays, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { playAddCelebration } from '@/lib/celebrations';
import { useToast } from '@/hooks/use-toast';
import { getPlanTier } from '@/lib/planFeatures';

const plans = [
  {
    id: 'monthly' as const,
    name: 'Monthly',
    price: '$0.99',
    period: '/mo',
    description: 'Start saving smarter',
    icon: Zap,
    features: [
      { text: 'Unlimited subscriptions', icon: Layers },
      { text: 'Smart renewal reminders', icon: Bell },
      { text: 'Full analytics & insights', icon: BarChart3 },
      { text: 'Calendar view', icon: CalendarDays },
    ],
  },
  {
    id: '6month' as const,
    name: '6-Month',
    price: '$4.99',
    period: '/6mo',
    description: 'Best value for savers',
    icon: Crown,
    badge: 'Most Popular',
    savings: 'Save 16%',
    features: [
      { text: 'Everything in Monthly', icon: Check },
      { text: 'Export data as CSV', icon: Download },
      { text: 'Priority support', icon: Shield },
    ],
  },
  {
    id: 'annual' as const,
    name: 'Annual',
    price: '$8.99',
    period: '/yr',
    description: 'Maximum control',
    icon: Sparkles,
    savings: 'Save 25%',
    features: [
      { text: 'Everything in 6-Month', icon: Check },
      { text: 'Custom categories', icon: Tag },
      { text: 'Early access to features', icon: Sparkles },
    ],
  },
];

const comparisonFeatures = [
  { name: 'Track subscriptions', free: '3 max', monthly: 'Unlimited', sixMonth: 'Unlimited', annual: 'Unlimited' },
  { name: 'Smart reminders', free: false, monthly: true, sixMonth: true, annual: true },
  { name: 'Full analytics', free: false, monthly: true, sixMonth: true, annual: true },
  { name: 'Calendar view', free: false, monthly: true, sixMonth: true, annual: true },
  { name: 'Export CSV', free: false, monthly: false, sixMonth: true, annual: true },
  { name: 'Custom categories', free: false, monthly: false, sixMonth: false, annual: true },
  { name: '⭐ Priority Support', free: false, monthly: false, sixMonth: true, annual: true },
  { name: 'Early access', free: false, monthly: false, sixMonth: false, annual: true },
];

const Plans = () => {
  const navigate = useNavigate();
  const { selectPlan, subscriptionPlan } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const currentTier = getPlanTier(subscriptionPlan);

  const handleSelect = async (planId: 'monthly' | '6month' | 'annual') => {
    setLoading(planId);
    try {
      await selectPlan(planId);
      playAddCelebration();
      toast({ title: '🎉 Welcome aboard!', description: 'Your plan is now active. All features unlocked!' });
      setTimeout(() => navigate('/'), 600);
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const getButtonLabel = (planId: string) => {
    if (loading === planId) return 'Activating…';
    if (subscriptionPlan === planId) return 'Current Plan';
    const planTier = getPlanTier(planId);
    if (currentTier > 0 && planTier > currentTier) return 'Upgrade';
    if (currentTier > 0 && planTier < currentTier) return 'Downgrade';
    return 'Get Started';
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Choose Your Plan
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-lg">
          Unlock the full power of subscription tracking
        </p>
      </motion.div>

      {/* Plan cards */}
      <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          const isPopular = plan.id === '6month';
          const isCurrent = subscriptionPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`relative flex flex-col rounded-2xl border p-5 backdrop-blur-sm transition-all hover:scale-[1.02] ${
                isCurrent
                  ? 'border-primary/60 bg-primary/8 shadow-lg shadow-primary/15 ring-1 ring-primary/30'
                  : isPopular
                  ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border bg-card/80'
              }`}
            >
              {plan.badge && !isCurrent && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  {plan.badge}
                </Badge>
              )}
              {isCurrent && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-primary-foreground">
                  ✓ Active
                </Badge>
              )}

              <div className="mb-3 flex items-center gap-2">
                <div className={`rounded-lg p-2 ${isPopular || isCurrent ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`h-5 w-5 ${isPopular || isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              {plan.savings && (
                <span className="mb-3 text-xs font-medium text-primary">{plan.savings}</span>
              )}
              {!plan.savings && <div className="mb-3" />}

              <ul className="mb-5 flex-1 space-y-2">
                {plan.features.map((f) => {
                  const FIcon = f.icon;
                  return (
                    <li key={f.text} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <FIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f.text}
                    </li>
                  );
                })}
              </ul>

              <Button
                onClick={() => handleSelect(plan.id)}
                disabled={loading !== null || isCurrent}
                variant={isPopular || isCurrent ? 'default' : 'outline'}
                className={`w-full ${isCurrent ? 'opacity-70' : ''}`}
              >
                {getButtonLabel(plan.id)}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-10 w-full max-w-4xl"
      >
        <h2 className="font-display text-lg font-semibold mb-4 text-center">Compare all features</h2>
        <div className="glass-card overflow-hidden">
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Feature</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">Free</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">Monthly</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">6-Month</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">Annual</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr key={row.name} className="border-b border-border/30 last:border-0">
                    <td className="p-3 text-xs text-foreground/80">{row.name}</td>
                    {[row.free, row.monthly, row.sixMonth, row.annual].map((val, ci) => (
                      <td key={ci} className="p-3 text-center">
                        {typeof val === 'string' ? (
                          <span className="text-xs text-muted-foreground">{val}</span>
                        ) : val ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Plans;
