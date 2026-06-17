import { useMemo, useState } from 'react';
import SubscriptionLogo from '@/components/SubscriptionLogo';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useSubscriptions, useDeleteSubscription } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, TrendingUp, Calendar, ArrowUpRight, ArrowDown, ArrowUp, Clock, Crown, X, Lock, Star } from 'lucide-react';
import { IndexSkeleton } from '@/components/SkeletonLoaders';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import AnimatedNumber from '@/components/AnimatedNumber';
import SwipeableSubscriptionCard from '@/components/SwipeableSubscriptionCard';
import { playDeleteFeedback } from '@/lib/celebrations';
import { toast } from '@/hooks/useToast';
import { getSubscriptionLimit, FREE_SUBSCRIPTION_LIMIT } from '@/lib/planFeatures';
import { toMonthlyAmount, formatBillingCycle, formatCurrency } from '@/lib/utils';

const Index = () => {
  const { data: subscriptions, isLoading } = useSubscriptions();
  const deleteMutation = useDeleteSubscription();
  const { subscriptionPlan, currency } = useProfile();
  const { user } = useAuth();
  // Persist banner dismissal so it doesn't reset on every navigation
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try { return localStorage.getItem('upgradeBannerDismissed') === '1'; } catch (e) { console.warn(e); return false; }
  });
  const dismissBanner = () => {
    setBannerDismissed(true);
    try { localStorage.setItem('upgradeBannerDismissed', '1'); } catch (e) { console.warn(e); }
  };
  const subLimit = getSubscriptionLimit(subscriptionPlan);
  const isAtLimit = (subscriptions?.filter(s => s.status === 'active').length ?? 0) >= subLimit;

  // Extract first name
  const firstName = useMemo(() => {
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (fullName) return fullName.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return null;
  }, [user]);

  // Tier helpers
  const isPro = subscriptionPlan === 'monthly';
  const isElite = subscriptionPlan === 'annual';
  const isFree = !isPro && !isElite;

  const activeSubscriptions = useMemo(
    () => subscriptions?.filter((s) => s.status === 'active') ?? [],
    [subscriptions]
  );

  const monthlyTotal = useMemo(() => {
    return activeSubscriptions.reduce(
      (sum, s) => sum + toMonthlyAmount(s.amount, s.billing_cycle),
      0
    );
  }, [activeSubscriptions]);

  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    return activeSubscriptions
      .filter((s) => {
        const days = differenceInDays(parseISO(s.next_renewal), now);
        return days >= 0 && days <= 14;
      })
      .sort((a, b) => parseISO(a.next_renewal).getTime() - parseISO(b.next_renewal).getTime());
  }, [activeSubscriptions]);

  // Quick stats
  const quickStats = useMemo(() => {
    if (!activeSubscriptions.length) return null;
    const sorted = [...activeSubscriptions].sort(
      (a, b) => toMonthlyAmount(a.amount, a.billing_cycle) - toMonthlyAmount(b.amount, b.billing_cycle)
    );
    const cheapest = sorted[0];
    const priciest = sorted[sorted.length - 1];
    const now = new Date();
    const nextRenewal = activeSubscriptions.reduce((closest, s) => {
      const days = differenceInDays(parseISO(s.next_renewal), now);
      return days >= 0 && days < closest ? days : closest;
    }, Infinity);
    return { cheapest, priciest, daysToNext: nextRenewal === Infinity ? null : nextRenewal };
  }, [activeSubscriptions]);

  const handleSwipeDelete = async (id: string, name: string) => {
    try {
      playDeleteFeedback();
      await deleteMutation.mutateAsync(id);
      toast({ title: `${name} deleted` });
    } catch {
      toast({ title: `Failed to delete ${name}`, variant: 'destructive' });
    }
  };

  if (isLoading) return <IndexSkeleton />;

  return (
    <div className="space-y-6">
      {/* Upgrade banner for free users */}
      {!subscriptionPlan && !bannerDismissed && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card border-primary/20 p-4">
            <div className="relative z-10 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Unlock full features</p>
                <p className="text-xs text-muted-foreground mt-0.5">Subscribe to get reminders, analytics & more.</p>
                <Button asChild size="sm" className="mt-2 h-7 text-xs glow-primary bg-gradient-to-r from-primary to-primary-glow">
                  <Link to="/plans">View plans</Link>
                </Button>
              </div>
              <button onClick={dismissBanner} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero spending card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* ──── FREE TIER ──── */}
        {isFree && (
          <div className="relative overflow-hidden rounded-2xl px-5 py-4 hero-spending-card border border-border/50">
            <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted-foreground/15 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  {firstName && <p className="text-sm text-muted-foreground/70 font-medium">Hey, {firstName}</p>}
                  <p className="text-[10px] text-muted-foreground/50 font-medium tracking-[0.15em] uppercase">Monthly spending</p>
                </div>
              </div>
              <p className="font-display text-4xl font-bold tracking-tight text-foreground/90">
                <AnimatedNumber value={monthlyTotal} currency={currency} />
              </p>
              <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-secondary/80 border border-border/50 text-muted-foreground">
                  {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-secondary border border-border text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  {formatCurrency(monthlyTotal * 12, currency)}/yr
                </span>
                <Link to="/analytics" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors ml-auto">
                  View insights <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ──── PRO MONTHLY ──── */}
        {isPro && (
          <div className="relative overflow-hidden rounded-2xl px-5 py-4 hero-card-pro pro-border-glow">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-0.5">
                {firstName && <p className="text-sm text-foreground/80 font-medium">Hey, {firstName}</p>}
                <span className="badge-pro badge-pro-pulse inline-flex items-center gap-1 rounded-full border border-primary/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  <Crown className="h-2.5 w-2.5" /> Pro
                </span>
              </div>
              <div className="pro-divider my-2" />
              <p className="text-[10px] text-muted-foreground/50 font-medium tracking-[0.15em] uppercase mb-0.5">Monthly spending</p>
              <p className="font-display text-4xl font-bold tracking-tight text-gradient">
                <AnimatedNumber value={monthlyTotal} currency={currency} />
              </p>
              <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 border border-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary/80">
                  {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-primary/8 border border-primary/15 text-primary glow-primary">
                  <TrendingUp className="h-3 w-3" />
                  {formatCurrency(monthlyTotal * 12, currency)}/yr
                </span>
                <Link to="/analytics" className="inline-flex items-center gap-1 text-[11px] text-accent/70 hover:text-accent transition-colors ml-auto">
                  View insights <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ──── PRO ELITE (ANNUAL) ──── */}
        {isElite && (
          <div className="relative overflow-hidden rounded-2xl px-5 py-4 hero-card-elite border border-[hsl(45,80%,55%)]/15">
            <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent/15 blur-3xl" />

            {/* Floating gold particles */}
            <div className="elite-particle elite-particle-1" />
            <div className="elite-particle elite-particle-2" />
            <div className="elite-particle elite-particle-3" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-0.5">
                {firstName && <p className="text-sm font-semibold text-foreground/90">Hey, {firstName}</p>}
                <span className="badge-elite badge-elite-glow inline-flex items-center gap-1 rounded-full border border-[hsl(45,80%,55%)]/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'hsl(45 80% 65%)' }}>
                  <Star className="h-2.5 w-2.5 fill-current" /> Elite
                </span>
              </div>
              {firstName && (
                <p className="text-[10px] font-medium tracking-wide mb-2" style={{ color: 'hsl(45 80% 55% / 0.4)' }}>Premium Member</p>
              )}
              {!firstName && <div className="mb-2" />}
              <p className="font-display text-4xl font-bold tracking-tight text-gradient-gold">
                <AnimatedNumber value={monthlyTotal} currency={currency} />
              </p>
              <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium" style={{ borderColor: 'hsl(45 80% 55% / 0.12)', color: 'hsl(45 80% 60%)', background: 'hsl(45 80% 55% / 0.05)' }}>
                  {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border" style={{ borderColor: 'hsl(45 80% 55% / 0.15)', color: 'hsl(45 80% 65%)', background: 'hsl(45 80% 55% / 0.06)', boxShadow: '0 0 12px -4px hsl(45 80% 55% / 0.15)' }}>
                  <TrendingUp className="h-3 w-3" />
                  {formatCurrency(monthlyTotal * 12, currency)}/yr
                </span>
                <Link to="/analytics" className="inline-flex items-center gap-1 text-[11px] transition-colors ml-auto" style={{ color: 'hsl(45 80% 65% / 0.6)' }}>
                  View insights <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick stats bar */}
      {quickStats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-card p-3 relative z-10">
              <div className="relative z-10">
                <ArrowDown className="h-3.5 w-3.5 text-success mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cheapest</p>
                <p className="text-xs font-semibold truncate mt-0.5">{quickStats.cheapest.name}</p>
              </div>
            </div>
            <div className="glass-card p-3">
              <div className="relative z-10">
                <ArrowUp className="h-3.5 w-3.5 text-warning mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Priciest</p>
                <p className="text-xs font-semibold truncate mt-0.5">{quickStats.priciest.name}</p>
              </div>
            </div>
            <div className="glass-card p-3">
              <div className="relative z-10">
                <Clock className="h-3.5 w-3.5 text-accent mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Next renewal</p>
                <p className="text-xs font-semibold mt-0.5">
                  {quickStats.daysToNext === 0 ? 'Today' : quickStats.daysToNext === 1 ? 'Tomorrow' : quickStats.daysToNext != null ? `${quickStats.daysToNext}d` : '—'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upcoming renewals - horizontal scroll widget */}
      {upcomingRenewals.length > 0 && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-warning/10">
              <Calendar className="h-3.5 w-3.5 text-warning" />
            </div>
            Upcoming renewals
          </h2>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {upcomingRenewals.map((sub) => {
              const daysLeft = differenceInDays(parseISO(sub.next_renewal), new Date());
              return (
                <Link key={sub.id} to={`/subscription/${sub.id}`} className="snap-start shrink-0">
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <div className="glass-card w-[140px] p-3">
                      <div className="relative z-10 flex flex-col items-center text-center gap-2">
                        <div className="icon-premium h-10 w-10">
                          <SubscriptionLogo name={sub.name} logoUrl={sub.logo_url} />
                        </div>
                        <p className="text-xs font-medium truncate w-full">{sub.name}</p>
                        <span className="text-[10px] font-semibold text-warning">
                          {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `Renew in ${daysLeft}d`}
                        </span>
                        <p className="text-xs font-bold">{formatCurrency(Number(sub.amount), currency)}<span className="text-muted-foreground font-normal">/{formatBillingCycle(sub.billing_cycle)}</span></p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Subscription limit warning */}
      {isAtLimit && !subscriptionPlan && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card border-warning/20 p-4">
            <div className="relative z-10 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                <Lock className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Subscription limit reached</p>
                <p className="text-xs text-muted-foreground mt-0.5">Free plan allows up to {FREE_SUBSCRIPTION_LIMIT} subscriptions. Upgrade to track unlimited.</p>
                <Button asChild size="sm" className="mt-2 h-7 text-xs glow-primary bg-gradient-to-r from-primary to-primary-glow">
                  <Link to="/plans">Upgrade Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* All subscriptions */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Your subscriptions</h2>
        {activeSubscriptions.length === 0 ? (
          <div className="glass-card p-8">
            <div className="flex flex-col items-center justify-center text-center relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                <Plus className="h-7 w-7 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">No subscriptions yet</p>
              <Button asChild>
                <Link to="/add">Add your first subscription</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {activeSubscriptions.map((sub) => (
              <div
                key={sub.id}
              >
                <SwipeableSubscriptionCard onDelete={() => handleSwipeDelete(sub.id, sub.name)}>
                  <Link to={`/subscription/${sub.id}`}>
                    <motion.div whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                      <Card className="group glass-card hover:border-primary/30 transition-all duration-300">
                        <CardContent className="flex items-center gap-3 p-3 relative z-10">
                          <div className="icon-premium h-10 w-10 shrink-0">
                            <SubscriptionLogo name={sub.name} logoUrl={sub.logo_url} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{sub.name}</p>
                              {sub.trial_end_date && new Date(sub.trial_end_date) > new Date() && (
                                <span className="shrink-0 rounded-full bg-accent/10 border border-accent/20 px-1.5 py-0.5 text-[9px] font-semibold text-accent uppercase">Trial</span>
                              )}
                              {sub.discount_percentage && sub.discount_end_date && new Date(sub.discount_end_date) > new Date() && (
                                <span className="shrink-0 rounded-full bg-success/10 border border-success/20 px-1.5 py-0.5 text-[9px] font-semibold text-success">{sub.discount_percentage}% off</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Next: {format(parseISO(sub.next_renewal), 'MMM d')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatCurrency(Number(sub.amount), currency)}</p>
                            <p className="text-xs text-muted-foreground">/{formatBillingCycle(sub.billing_cycle)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </SwipeableSubscriptionCard>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Index;
