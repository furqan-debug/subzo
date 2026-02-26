import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';

const Index = () => {
  const { data: subscriptions, isLoading } = useSubscriptions();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly spending card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-primary/15 via-card to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Monthly spending</p>
            <p className="font-display text-4xl font-bold">${monthlyTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                <TrendingUp className="h-3 w-3" />
                ${(monthlyTotal * 12).toFixed(0)}/yr
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming renewals */}
      {upcomingRenewals.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-warning" />
            Upcoming renewals
          </h2>
          <div className="space-y-2">
            {upcomingRenewals.map((sub, i) => {
              const daysLeft = differenceInDays(parseISO(sub.next_renewal), new Date());
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/subscription/${sub.id}`}>
                    <Card className="hover:border-primary/30 transition-colors">
                      <CardContent className="flex items-center gap-3 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary overflow-hidden">
                          {sub.logo_url ? (
                            <img src={sub.logo_url} alt="" className="h-6 w-6 object-contain" />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">{sub.name[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">${Number(sub.amount).toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* All subscriptions */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Your subscriptions</h2>
        {activeSubscriptions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <PlusCircle className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No subscriptions yet</p>
              <Button asChild>
                <Link to="/add">Add your first subscription</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeSubscriptions.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/subscription/${sub.id}`}>
                  <Card className="hover:border-primary/30 transition-colors">
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary overflow-hidden">
                        {sub.logo_url ? (
                          <img src={sub.logo_url} alt="" className="h-6 w-6 object-contain" />
                        ) : (
                          <span className="text-sm font-semibold text-muted-foreground">{sub.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Next: {format(parseISO(sub.next_renewal), 'MMM d')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${Number(sub.amount).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">/{sub.billing_cycle === 'monthly' ? 'mo' : sub.billing_cycle === 'yearly' ? 'yr' : 'wk'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* FAB */}
      {activeSubscriptions.length > 0 && (
        <Link to="/add" className="fixed bottom-20 right-4 z-30 sm:right-[calc(50%-224px+16px)]">
          <Button size="lg" className="h-14 w-14 rounded-full shadow-lg shadow-primary/25">
            <PlusCircle className="h-6 w-6" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export default Index;
