import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, X, Shield, Download, Bell, BarChart3, CalendarDays, Layers, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { playAddCelebration } from '@/lib/celebrations';
import { useToast } from '@/hooks/use-toast';
import { getPlanTier } from '@/lib/planFeatures';

const proFeatures = [
  { text: 'Unlimited subscriptions', icon: Layers },
  { text: 'Smart renewal reminders', icon: Bell },
  { text: 'Full analytics & insights', icon: BarChart3 },
  { text: 'Calendar view', icon: CalendarDays },
  { text: 'Export data as CSV/PDF', icon: Download },
  { text: '⭐ Priority Support', icon: Shield },
];

const comparisonFeatures = [
  { name: 'Track subscriptions', free: '2 max', pro: 'Unlimited' },
  { name: 'Smart reminders', free: false, pro: true },
  { name: 'Full analytics', free: false, pro: true },
  { name: 'Calendar view', free: false, pro: true },
  { name: 'CSV export', free: false, pro: true },
  { name: '⭐ Priority Support', free: false, pro: true },
];

const Plans = () => {
  const navigate = useNavigate();
  const { selectPlan, cancelPlan, subscriptionPlan } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const currentTier = getPlanTier(subscriptionPlan);

  const handleSelect = async (planId: 'monthly' | 'annual') => {
    setLoading(planId);
    try {
      await selectPlan(planId);
      playAddCelebration();
      toast({ title: '🎉 Welcome to Pro!', description: 'All features are now unlocked.' });
      setTimeout(() => navigate('/'), 600);
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleDowngrade = async () => {
    setLoading('free');
    try {
      await cancelPlan();
      toast({ title: 'Plan cancelled', description: 'You're now on the Free tier.' });
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
    if (currentTier > 0 && planTier < currentTier) return 'Switch to Monthly';
    return 'Get Started';
  };

  const isCurrentMonthly = subscriptionPlan === 'monthly';
  const isCurrentAnnual = subscriptionPlan === 'annual';

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
        {/* Free card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          className={`relative flex flex-col rounded-2xl border p-5 backdrop-blur-sm ${
            !subscriptionPlan
              ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
              : 'border-border bg-card/80'
          }`}
        >
          {!subscriptionPlan && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground border border-border">
              Current
            </Badge>
          )}
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg p-2 bg-muted">
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Free</h3>
              <p className="text-xs text-muted-foreground">Basic tracking</p>
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">$0</span>
            <span className="text-sm text-muted-foreground">/forever</span>
          </div>
          <div className="mb-3" />
          <ul className="mb-5 flex-1 space-y-2">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <Layers className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
              2 subscriptions max
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
              Basic totals only
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/30" />
              No reminders
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/30" />
              No analytics
            </li>
          </ul>
          <Button variant="outline" className="w-full opacity-60" disabled>
            {!subscriptionPlan ? 'Current Plan' : 'Free Tier'}
          </Button>
        </motion.div>

        {/* Pro Monthly */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className={`relative flex flex-col rounded-2xl border p-5 backdrop-blur-sm transition-all hover:scale-[1.02] ${
            isCurrentMonthly
              ? 'border-primary/60 bg-primary/8 shadow-lg shadow-primary/15 ring-1 ring-primary/30'
              : 'border-border bg-card/80'
          }`}
        >
          {isCurrentMonthly && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-primary-foreground">
              ✓ Active
            </Badge>
          )}
          <div className="mb-3 flex items-center gap-2">
            <div className={`rounded-lg p-2 ${isCurrentMonthly ? 'bg-primary/10' : 'bg-muted'}`}>
              <Crown className={`h-5 w-5 ${isCurrentMonthly ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Pro Monthly</h3>
              <p className="text-xs text-muted-foreground">Full control</p>
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">$1.99</span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </div>
          <div className="mb-3" />
          <ul className="mb-5 flex-1 space-y-2">
            {proFeatures.map((f) => {
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
            onClick={() => handleSelect('monthly')}
            disabled={loading !== null || isCurrentMonthly}
            variant="outline"
            className={`w-full ${isCurrentMonthly ? 'opacity-70' : ''}`}
          >
            {getButtonLabel('monthly')}
          </Button>
        </motion.div>

        {/* Pro Annual — highlighted */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`relative flex flex-col rounded-2xl border p-5 backdrop-blur-sm transition-all hover:scale-[1.02] ${
            isCurrentAnnual
              ? 'border-primary/60 bg-primary/8 shadow-lg shadow-primary/15 ring-1 ring-primary/30'
              : 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20'
          }`}
        >
          {isCurrentAnnual ? (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-primary-foreground">
              ✓ Active
            </Badge>
          ) : (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              ⭐ Most Popular
            </Badge>
          )}
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg p-2 bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Pro Annual</h3>
              <p className="text-xs text-muted-foreground">Best value</p>
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">$14.99</span>
            <span className="text-sm text-muted-foreground">/yr</span>
          </div>
          <span className="mb-3 text-xs font-medium text-primary">
            $1.99 × 12 = $23.88 — Save 37%
          </span>
          <ul className="mb-5 flex-1 space-y-2">
            {proFeatures.map((f) => {
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
            onClick={() => handleSelect('annual')}
            disabled={loading !== null || isCurrentAnnual}
            variant="default"
            className={`w-full ${isCurrentAnnual ? 'opacity-70' : ''}`}
          >
            {getButtonLabel('annual')}
          </Button>
        </motion.div>
      </div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-10 w-full max-w-4xl"
      >
        <h2 className="font-display text-lg font-semibold mb-4 text-center">Free vs Pro</h2>
        <div className="glass-card overflow-hidden">
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Feature</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">Free</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr key={row.name} className="border-b border-border/30 last:border-0">
                    <td className="p-3 text-xs text-foreground/80">{row.name}</td>
                    <td className="p-3 text-center">
                      {typeof row.free === 'string' ? (
                        <span className="text-xs text-muted-foreground">{row.free}</span>
                      ) : row.free ? (
                        <Check className="h-4 w-4 text-primary mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {typeof row.pro === 'string' ? (
                        <span className="text-xs font-medium text-primary">{row.pro}</span>
                      ) : row.pro ? (
                        <Check className="h-4 w-4 text-primary mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
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
