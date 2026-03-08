import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useSubscriptions, useDeleteSubscription } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Calendar, ArrowUpRight, ArrowDown, ArrowUp, Clock, Crown, X, Lock, Star } from 'lucide-react';
import { IndexSkeleton } from '@/components/SkeletonLoaders';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import AnimatedNumber from '@/components/AnimatedNumber';
import SwipeableSubscriptionCard from '@/components/SwipeableSubscriptionCard';
import { playDeleteFeedback } from '@/lib/celebrations';
import { toast } from '@/hooks/use-toast';
import { getSubscriptionLimit, FREE_SUBSCRIPTION_LIMIT } from '@/lib/planFeatures';

const Index = () => {
  const { data: subscriptions, isLoading } = useSubscriptions();
  const deleteMutation = useDeleteSubscription();
  const { subscriptionPlan } = useProfile();
  const { user } = useAuth();
  const [bannerDismissed, setBannerDismissed] = useState(false);
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
    return activeSubscriptions.reduce((sum, s) => {
      const amount = Number(s.amount);
      if (s.billing_cycle === 'yearly') return sum + amount / 12;
      if (s.billing_cycle === 'weekly') return sum + amount * 4.33;
      return sum + amount;
    }, 0);
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
    const toMonthly = (s: typeof activeSubscriptions[0]) => {
      const a = Number(s.amount);
      return s.billing_cycle === 'yearly' ? a / 12 : s.billing_cycle === 'weekly' ? a * 4.33 : a;
    };
    const sorted = [...activeSubscriptions].sort((a, b) => toMonthly(a) - toMonthly(b));
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
    playDeleteFeedback();
    await deleteMutation.mutateAsync(id);
    toast({ title: `${name} deleted` });
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
              <button onClick={() => setBannerDismissed(true)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero spending card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="hero-spending-card relative overflow-hidden rounded-2xl border border-primary/20 p-6">
          {/* Ambient glow layers */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="relative z-10">
            <div className="mb-4">
              <p className="text-[10px] text-muted-foreground font-medium tracking-[0.2em] uppercase">Monthly spending</p>
            </div>
            <p className="font-display text-5xl font-bold tracking-tight text-gradient">
              <AnimatedNumber value={monthlyTotal} prefix="$" />
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 border border-primary/15 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
                <TrendingUp className="h-3 w-3" />
                ${(monthlyTotal * 12).toFixed(0)}/yr
              </span>
              <Link to="/analytics" className="inline-flex items-center gap-1 text-xs text-accent/80 hover:text-accent transition-colors">
                View insights <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
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
                          {sub.logo_url ? (
                            <img src={sub.logo_url} alt="" className="h-6 w-6 object-contain" loading="lazy" decoding="async" />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">{sub.name?.[0] ?? '?'}</span>
                          )}
                        </div>
                        <p className="text-xs font-medium truncate w-full">{sub.name}</p>
                        <span className="text-[10px] font-semibold text-warning">
                          {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `Renew in ${daysLeft}d`}
                        </span>
                        <p className="text-xs font-bold">${Number(sub.amount).toFixed(2)}<span className="text-muted-foreground font-normal">/{sub.billing_cycle === 'monthly' ? 'mo' : sub.billing_cycle === 'yearly' ? 'yr' : 'wk'}</span></p>
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
            {activeSubscriptions.map((sub, i) => (
              <div
                key={sub.id}
              >
                <SwipeableSubscriptionCard onDelete={() => handleSwipeDelete(sub.id, sub.name)}>
                  <Link to={`/subscription/${sub.id}`}>
                    <motion.div whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                      <Card className="group glass-card hover:border-primary/30 transition-all duration-300">
                        <CardContent className="flex items-center gap-3 p-3 relative z-10">
                          <div className="icon-premium h-10 w-10 shrink-0">
                            {sub.logo_url ? (
                              <img src={sub.logo_url} alt="" className="h-6 w-6 object-contain" loading="lazy" decoding="async" />
                            ) : (
                              <span className="text-sm font-semibold text-muted-foreground">{sub.name?.[0] ?? '?'}</span>
                            )}
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
                            <p className="text-sm font-bold">${Number(sub.amount).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">/{sub.billing_cycle === 'monthly' ? 'mo' : sub.billing_cycle === 'yearly' ? 'yr' : 'wk'}</p>
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
