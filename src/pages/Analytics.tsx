import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { DollarSign, TrendingUp, Star, BarChart3, BadgeCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AnalyticsSkeleton } from '@/components/SkeletonLoaders';
import AnimatedNumber from '@/components/AnimatedNumber';
import { differenceInMonths, parseISO } from 'date-fns';

const COLORS = [
  'hsl(250, 85%, 65%)', 'hsl(200, 90%, 55%)', 'hsl(155, 70%, 45%)',
  'hsl(40, 90%, 55%)', 'hsl(0, 72%, 55%)', 'hsl(280, 70%, 60%)',
  'hsl(170, 60%, 50%)', 'hsl(30, 80%, 55%)', 'hsl(220, 60%, 55%)',
];

const Analytics = () => {
  const { data: subscriptions, isLoading } = useSubscriptions();
  const active = useMemo(() => subscriptions?.filter((s) => s.status === 'active') ?? [], [subscriptions]);
  const cancelled = useMemo(() => subscriptions?.filter((s) => s.status === 'cancelled') ?? [], [subscriptions]);

  const monthlyTotal = useMemo(() => {
    return active.reduce((sum, s) => {
      const a = Number(s.amount);
      if (s.billing_cycle === 'yearly') return sum + a / 12;
      if (s.billing_cycle === 'weekly') return sum + a * 4.33;
      return sum + a;
    }, 0);
  }, [active]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach((s) => {
      const a = Number(s.amount);
      const monthly = s.billing_cycle === 'yearly' ? a / 12 : s.billing_cycle === 'weekly' ? a * 4.33 : a;
      map[s.category] = (map[s.category] || 0) + monthly;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [active]);

  const mostExpensive = useMemo(() => {
    if (!active.length) return null;
    return active.reduce((max, s) => {
      const a = Number(s.amount);
      const monthly = s.billing_cycle === 'yearly' ? a / 12 : s.billing_cycle === 'weekly' ? a * 4.33 : a;
      const maxMonthly = max.billing_cycle === 'yearly' ? Number(max.amount) / 12 : max.billing_cycle === 'weekly' ? Number(max.amount) * 4.33 : Number(max.amount);
      return monthly > maxMonthly ? s : max;
    });
  }, [active]);

  // Money saved from cancelled subs
  const moneySaved = useMemo(() => {
    return cancelled.reduce((sum, s) => {
      const a = Number(s.amount);
      const monthly = s.billing_cycle === 'yearly' ? a / 12 : s.billing_cycle === 'weekly' ? a * 4.33 : a;
      const monthsSinceCancelled = Math.max(1, differenceInMonths(new Date(), parseISO(s.updated_at)));
      return sum + monthly * monthsSinceCancelled;
    }, 0);
  }, [cancelled]);

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="font-display text-xl font-semibold">Insights</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.97 }}>
          <div className="glass-card p-4">
            <div className="relative z-10">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 mb-3">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly</p>
              <p className="font-display text-2xl font-bold mt-0.5 text-gradient">
                <AnimatedNumber value={monthlyTotal} prefix="$" />
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.97 }}>
          <div className="glass-card p-4">
            <div className="relative z-10">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 mb-3">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Yearly</p>
              <p className="font-display text-2xl font-bold mt-0.5">
                <AnimatedNumber value={monthlyTotal * 12} prefix="$" decimals={0} />
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Money saved */}
      {moneySaved > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card border-success/20 p-4">
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 border border-success/20">
                <BadgeCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Money saved</p>
                <p className="font-semibold">
                  <AnimatedNumber value={moneySaved} prefix="$" className="text-success" />
                  <span className="text-muted-foreground text-xs ml-1">from {cancelled.length} cancelled</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Most expensive */}
      {mostExpensive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.97 }}>
          <div className="glass-card glow-primary border-primary/20 p-4">
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Most expensive</p>
                <p className="font-semibold">{mostExpensive.name} — <span className="text-primary">${Number(mostExpensive.amount).toFixed(2)}</span>/{mostExpensive.billing_cycle === 'monthly' ? 'mo' : mostExpensive.billing_cycle === 'yearly' ? 'yr' : 'wk'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category chart */}
      {byCategory.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card p-5">
            <div className="relative z-10">
              <h3 className="font-display font-semibold mb-4">Spending by category</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(230, 20%, 10%)',
                        border: '1px solid hsl(230, 15%, 20%)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px hsl(0 0% 0% / 0.4)',
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}/mo`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2.5">
                {byCategory.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="h-3 w-3 rounded-full ring-2 ring-offset-1 ring-offset-card" style={{ backgroundColor: COLORS[i % COLORS.length], boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}40` }} />
                      <span className="text-foreground/80">{cat.name}</span>
                    </div>
                    <span className="font-medium">${cat.value.toFixed(2)}<span className="text-muted-foreground text-xs">/mo</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
