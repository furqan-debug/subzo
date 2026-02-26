import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { playAddCelebration } from '@/lib/celebrations';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    id: 'monthly' as const,
    name: 'Monthly',
    price: '$0.99',
    period: '/mo',
    description: 'The "Trial" User',
    icon: Zap,
    features: ['Full access to all features', 'Track unlimited subscriptions', 'Smart reminders'],
  },
  {
    id: '6month' as const,
    name: '6-Month',
    price: '$4.99',
    period: '/6mo',
    description: 'The "Serious" Saver',
    icon: Crown,
    badge: 'Most Popular',
    savings: 'Save 16%',
    features: ['Everything in Monthly', 'Priority support', 'Advanced analytics', 'Export data'],
  },
  {
    id: 'annual' as const,
    name: 'Annual',
    price: '$8.99',
    period: '/yr',
    description: 'The "Power" User',
    icon: Sparkles,
    savings: 'Save 25%',
    features: ['Everything in 6-Month', 'Early access to new features', 'Custom categories', 'API access'],
  },
];

const Plans = () => {
  const navigate = useNavigate();
  const { selectPlan } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (planId: 'monthly' | '6month' | 'annual') => {
    setLoading(planId);
    try {
      await selectPlan(planId);
      playAddCelebration();
      toast({ title: '🎉 Welcome aboard!', description: 'Your plan is now active.' });
      setTimeout(() => navigate('/'), 600);
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Choose Your Plan
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Unlock the full power of subscription tracking
        </p>
      </motion.div>

      <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-3">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          const isPopular = plan.id === '6month';

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`relative flex flex-col rounded-2xl border p-6 backdrop-blur-sm transition-all hover:scale-[1.02] ${
                isPopular
                  ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border bg-card/80'
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  {plan.badge}
                </Badge>
              )}

              <div className="mb-4 flex items-center gap-2">
                <div className={`rounded-lg p-2 ${isPopular ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`h-5 w-5 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
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
                <span className="mb-4 text-xs font-medium text-primary">{plan.savings}</span>
              )}
              {!plan.savings && <div className="mb-4" />}

              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelect(plan.id)}
                disabled={loading !== null}
                variant={isPopular ? 'default' : 'outline'}
                className="w-full"
              >
                {loading === plan.id ? 'Activating…' : 'Get Started'}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Plans;
