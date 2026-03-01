import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useSubscriptions, useDeleteSubscription } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Calendar, ArrowUpRight, ArrowDown, ArrowUp, Clock } from 'lucide-react';
import { IndexSkeleton } from '@/components/SkeletonLoaders';
import AnimatedNumber from '@/components/AnimatedNumber';
import SwipeableSubscriptionCard from '@/components/SwipeableSubscriptionCard';
import { playDeleteFeedback } from '@/lib/celebrations';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { data: subscriptions, isLoading } = useSubscriptions();
  const deleteMutation = useDeleteSubscription();

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
        return days >= 0 && days <= 7;
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
      {/* Hero spending card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="glass-card p-6">
          <div className="relative z-10">
            <div className="mb-3">
              <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Monthly spending</p>
            </div>
            <p className="font-display text-5xl font-bold tracking-tight text-gradient">
              <AnimatedNumber value={monthlyTotal} prefix="$" />
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
                <TrendingUp className="h-3 w-3" />
                ${(monthlyTotal * 12).toFixed(0)}/yr
              </span>
              <Link to="/analytics" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-glow transition-colors">
                View insights <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick stats bar */}
      {quickStats && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
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

      {/* Upcoming renewals */}
      {upcomingRenewals.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-warning/10">
              <Calendar className="h-3.5 w-3.5 text-warning" />
            </div>
            Upcoming renewals
          </h2>
          <div className="space-y-2">
            {upcomingRenewals.map((sub, i) => {
              const daysLeft = differenceInDays(parseISO(sub.next_renewal), new Date());
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <Link to={`/subscription/${sub.id}`}>
                    <motion.div whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                      <Card className="group glass-card transition-all duration-300 hover:border-primary/30">
                        <CardContent className="flex items-center gap-3 p-3 relative z-10">
                          <div className="icon-premium h-10 w-10 shrink-0">
                            {sub.logo_url ? (
                              <img src={sub.logo_url} alt="" className="h-6 w-6 object-contain" />
                            ) : (
                              <span className="text-sm font-semibold text-muted-foreground">{sub.name?.[0] ?? '?'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{sub.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {daysLeft === 0 ? 'Renews today' : daysLeft === 1 ? 'Renews tomorrow' : `In ${daysLeft} days`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">${Number(sub.amount).toFixed(2)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* All subscriptions */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.03 }}
              >
                <SwipeableSubscriptionCard onDelete={() => handleSwipeDelete(sub.id, sub.name)}>
                  <Link to={`/subscription/${sub.id}`}>
                    <motion.div whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                      <Card className="group glass-card hover:border-primary/30 transition-all duration-300">
                        <CardContent className="flex items-center gap-3 p-3 relative z-10">
                          <div className="icon-premium h-10 w-10 shrink-0">
                            {sub.logo_url ? (
                              <img src={sub.logo_url} alt="" className="h-6 w-6 object-contain" />
                            ) : (
                              <span className="text-sm font-semibold text-muted-foreground">{sub.name?.[0] ?? '?'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{sub.name}</p>
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
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* FAB */}
      {activeSubscriptions.length > 0 && (
        <Link to="/add" className="fixed bottom-20 right-4 z-30 sm:right-[calc(50%-224px+16px)]">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90">
              <Plus className="h-6 w-6" />
            </Button>
          </motion.div>
        </Link>
      )}
    </div>
  );
};

export default Index;
