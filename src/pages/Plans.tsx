import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, X, Shield, Download, Bell, BarChart3, CalendarDays, Layers } from 'lucide-react';
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
  { text: 'Export data as CSV', icon: Download },
  { text: 'Priority Support', icon: Shield },
];

const comparisonFeatures = [
  { name: 'Track subscriptions', free: '2 max', pro: 'Unlimited' },
  { name: 'Smart reminders', free: false, pro: true },
  { name: 'Full analytics', free: false, pro: true },
  { name: 'Calendar view', free: false, pro: true },
  { name: 'CSV export', free: false, pro: true },
  { name: 'Priority Support', free: false, pro: true },
];

const Plans = () => {
  const navigate = useNavigate();
  const { selectPlan, subscriptionPlan } = useProfile();
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
      <div className="grid w-full max-w-4xl gap-5 sm:grid-cols-3">
        {/* Free card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          className={`relative flex flex-col rounded-2xl border p-6 ${
            !subscriptionPlan
              ? 'border-border/60 bg-card/90'
              : 'border-border/40 bg-card/60'
          }`}
        >
          {/* Shimmer top line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />

          {!subscriptionPlan && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground border border-border text-[10px]">
              Current
            </Badge>
          )}
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-muted/60">
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Free</h3>
              <p className="text-[11px] text-muted-foreground">Basic tracking</p>
            </div>
          </div>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-5xl font-bold text-foreground/80">$0</span>
            <span className="text-sm text-muted-foreground">/forever</span>
          </div>
          <div className="mb-4" />
          <ul className="mb-6 flex-1 space-y-2.5">
            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Layers className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
              2 subscriptions max
            </li>
            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
              Basic totals only
            </li>
            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/20" />
              No reminders
            </li>
            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/20" />
              No analytics
            </li>
          </ul>
          <Button variant="outline" className="w-full opacity-50 border-border/50" disabled>
            {!subscriptionPlan ? 'Current Plan' : 'Free Tier'}
          </Button>
        </motion.div>

        {/* Pro Monthly */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative flex flex-col rounded-2xl p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, hsl(230 22% 11%) 0%, hsl(245 25% 14%) 40%, hsl(230 20% 10%) 100%)',
            boxShadow: '0 0 0 1px hsl(var(--primary) / 0.08), 0 8px 40px -8px hsl(var(--primary) / 0.12), 0 2px 12px -2px hsl(0 0% 0% / 0.4), inset 0 1px 0 0 hsl(var(--foreground) / 0.04)',
          }}
        >
          {/* Ambient glow orb */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
          {/* Shimmer top line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {isCurrentMonthly && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] border-0"
              style={{ background: 'linear-gradient(135deg, hsl(var(--success)), hsl(155 60% 35%))', color: 'white', boxShadow: '0 0 12px -2px hsl(var(--success) / 0.4)' }}>
              ✓ Active
            </Badge>
          )}
          <div className="relative z-10 mb-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-primary/10">
              <Crown className="h-5 w-5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Pro Monthly</h3>
              <p className="text-[11px] text-muted-foreground">Full control</p>
            </div>
          </div>
          <div className="relative z-10 mb-1 flex items-baseline gap-1">
            <span className="text-5xl font-bold text-gradient">$1.99</span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </div>
          <div className="mb-4" />
          <ul className="relative z-10 mb-6 flex-1 space-y-2.5">
            {proFeatures.map((f) => {
              const FIcon = f.icon;
              return (
                <li key={f.text} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <FIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]" />
                  {f.text}
                </li>
              );
            })}
          </ul>
          <Button
            onClick={() => handleSelect('monthly')}
            disabled={loading !== null || isCurrentMonthly}
            variant="outline"
            className={`relative z-10 w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all ${isCurrentMonthly ? 'opacity-60' : ''}`}
          >
            {getButtonLabel('monthly')}
          </Button>
        </motion.div>

        {/* Pro Annual — highlighted */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative flex flex-col rounded-2xl p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, hsl(240 24% 12%) 0%, hsl(250 28% 16%) 40%, hsl(235 22% 11%) 100%)',
            boxShadow: '0 0 60px -12px hsl(var(--primary) / 0.25), 0 0 0 1px hsl(var(--primary) / 0.12), 0 8px 40px -8px hsl(var(--primary) / 0.18), 0 2px 12px -2px hsl(0 0% 0% / 0.4), inset 0 1px 0 0 hsl(var(--foreground) / 0.05)',
          }}
        >
          {/* Ambient glow orbs */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
          {/* Shimmer top line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {isCurrentAnnual ? (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] border-0"
              style={{ background: 'linear-gradient(135deg, hsl(var(--success)), hsl(155 60% 35%))', color: 'white', boxShadow: '0 0 12px -2px hsl(var(--success) / 0.4)' }}>
              ✓ Active
            </Badge>
          ) : (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] border-0 text-primary-foreground"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))', boxShadow: '0 0 16px -3px hsl(var(--primary) / 0.5)' }}>
              ⭐ Most Popular
            </Badge>
          )}
          <div className="relative z-10 mb-4 flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-primary/12">
              <Sparkles className="h-5 w-5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Pro Annual</h3>
              <p className="text-[11px] text-muted-foreground">Best value</p>
            </div>
          </div>
          <div className="relative z-10 mb-1 flex items-baseline gap-1">
            <span className="text-5xl font-bold text-gradient">$14.99</span>
            <span className="text-sm text-muted-foreground">/yr</span>
          </div>
          <span className="relative z-10 mb-4 text-xs font-medium text-primary/80">
            Save 37% vs monthly
          </span>
          <ul className="relative z-10 mb-6 flex-1 space-y-2.5">
            {proFeatures.map((f) => {
              const FIcon = f.icon;
              return (
                <li key={f.text} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <FIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]" />
                  {f.text}
                </li>
              );
            })}
          </ul>
          <Button
            onClick={() => handleSelect('annual')}
            disabled={loading !== null || isCurrentAnnual}
            className={`relative z-10 w-full border-0 text-primary-foreground transition-all ${isCurrentAnnual ? 'opacity-60' : 'glow-primary'}`}
            style={!isCurrentAnnual ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))' } : undefined}
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
        <div className="rounded-xl overflow-hidden border border-border/40"
          style={{
            background: 'linear-gradient(145deg, hsl(230 22% 11%) 0%, hsl(230 20% 9%) 100%)',
            boxShadow: '0 2px 12px -2px hsl(0 0% 0% / 0.3)',
          }}>
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left p-3.5 text-xs text-muted-foreground font-medium">Feature</th>
                  <th className="text-center p-3.5 text-xs text-muted-foreground font-medium">Free</th>
                  <th className="text-center p-3.5 text-xs font-medium text-primary">
                    <span className="inline-flex items-center gap-1">
                      <Crown className="h-3 w-3" /> Pro
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr key={row.name} className="border-b border-border/20 last:border-0 transition-colors hover:bg-primary/[0.02]">
                    <td className="p-3.5 text-xs text-foreground/80">{row.name}</td>
                    <td className="p-3.5 text-center">
                      {typeof row.free === 'string' ? (
                        <span className="text-xs text-muted-foreground">{row.free}</span>
                      ) : row.free ? (
                        <Check className="h-4 w-4 text-primary mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/20 mx-auto" />
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {typeof row.pro === 'string' ? (
                        <span className="text-xs font-medium text-primary">{row.pro}</span>
                      ) : row.pro ? (
                        <Check className="h-4 w-4 text-primary mx-auto drop-shadow-[0_0_4px_hsl(var(--primary)/0.4)]" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/20 mx-auto" />
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
