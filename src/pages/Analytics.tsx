import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, DollarSign, TrendingUp, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  'hsl(250, 85%, 65%)', 'hsl(200, 90%, 55%)', 'hsl(155, 70%, 45%)',
  'hsl(40, 90%, 55%)', 'hsl(0, 72%, 55%)', 'hsl(280, 70%, 60%)',
  'hsl(170, 60%, 50%)', 'hsl(30, 80%, 55%)', 'hsl(220, 60%, 55%)',
];

const Analytics = () => {
  const { data: subscriptions, isLoading } = useSubscriptions();

  const active = useMemo(() => subscriptions?.filter((s) => s.status === 'active') ?? [], [subscriptions]);

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

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-semibold">Insights</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <DollarSign className="h-5 w-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Monthly</p>
              <p className="font-display text-xl font-bold">${monthlyTotal.toFixed(2)}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4">
              <TrendingUp className="h-5 w-5 text-accent mb-2" />
              <p className="text-xs text-muted-foreground">Yearly projection</p>
              <p className="font-display text-xl font-bold">${(monthlyTotal * 12).toFixed(0)}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Most expensive */}
      {mostExpensive && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-3 p-4">
              <Star className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Most expensive</p>
                <p className="font-semibold">{mostExpensive.name} — ${Number(mostExpensive.amount).toFixed(2)}/{mostExpensive.billing_cycle === 'monthly' ? 'mo' : mostExpensive.billing_cycle === 'yearly' ? 'yr' : 'wk'}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Category chart */}
      {byCategory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-display font-semibold mb-4">Spending by category</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(230, 20%, 10%)', border: '1px solid hsl(230, 15%, 18%)', borderRadius: '8px' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}/mo`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {byCategory.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{cat.name}</span>
                    </div>
                    <span className="text-muted-foreground">${cat.value.toFixed(2)}/mo</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
