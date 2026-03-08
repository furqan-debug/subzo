import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, parseISO, differenceInMonths } from 'date-fns';
import { useSubscriptions, useDeleteSubscription, useUpdateSubscription } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ExternalLink, Trash2, XCircle, DollarSign, CalendarDays, Tag, BarChart3, Clock, Percent } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { playDeleteFeedback } from '@/lib/celebrations';
import { DetailSkeleton } from '@/components/SkeletonLoaders';
import SubscriptionLogo from '@/components/SubscriptionLogo';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SubscriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: subscriptions, isLoading } = useSubscriptions();
  const deleteMutation = useDeleteSubscription();
  const updateMutation = useUpdateSubscription();

  const sub = subscriptions?.find((s) => s.id === id);

  const totalSpent = useMemo(() => {
    if (!sub) return 0;
    const months = Math.max(1, differenceInMonths(new Date(), parseISO(sub.created_at)));
    const monthly = sub.billing_cycle === 'yearly' ? Number(sub.amount) / 12 : sub.billing_cycle === 'weekly' ? Number(sub.amount) * 4.33 : Number(sub.amount);
    return monthly * months;
  }, [sub]);

  if (isLoading) return <DetailSkeleton />;
  if (!sub) return <div className="text-center py-20 text-muted-foreground">Subscription not found</div>;

  const handleDelete = async () => {
    playDeleteFeedback();
    await deleteMutation.mutateAsync(sub.id);
    toast({ title: 'Subscription deleted' });
    setTimeout(() => navigate('/'), 500);
  };

  const handleCancel = async () => {
    playDeleteFeedback();
    await updateMutation.mutateAsync({ id: sub.id, status: 'cancelled' });
    toast({ title: 'Marked as cancelled' });
  };

  const detailItems = [
    { label: 'Amount', value: `$${Number(sub.amount).toFixed(2)}/${sub.billing_cycle === 'monthly' ? 'mo' : sub.billing_cycle === 'yearly' ? 'yr' : 'wk'}`, icon: DollarSign, color: 'text-primary' },
    { label: 'Next renewal', value: format(parseISO(sub.next_renewal), 'MMM d, yyyy'), icon: CalendarDays, color: 'text-accent' },
    { label: 'Category', value: sub.category, icon: Tag, color: 'text-warning' },
    { label: 'Total spent (est.)', value: `$${totalSpent.toFixed(2)}`, icon: BarChart3, color: 'text-success' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="glass-card p-5">
          <div className="flex items-center gap-4 relative z-10">
            <div className="icon-premium h-16 w-16 shrink-0">
              <SubscriptionLogo name={sub.name} logoUrl={sub.logo_url} size="lg" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{sub.name}</h1>
              <span className={`inline-flex items-center gap-1 mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                sub.status === 'active'
                  ? 'bg-success/10 text-success border-success/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sub.status === 'active' ? 'bg-success' : 'bg-destructive'}`} />
                {sub.status}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trial / Discount info cards */}
      {sub.trial_end_date && new Date(sub.trial_end_date) > new Date() && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="glass-card border-accent/20 p-4">
            <div className="relative z-10 flex items-center gap-3">
              <Clock className="h-4 w-4 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Free trial</p>
                <p className="text-sm font-semibold text-accent">
                  Ends in {differenceInDays(new Date(sub.trial_end_date), new Date())} days
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {sub.discount_percentage && sub.discount_end_date && new Date(sub.discount_end_date) > new Date() && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="glass-card border-success/20 p-4">
            <div className="relative z-10 flex items-center gap-3">
              <Percent className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Discount active</p>
                <p className="text-sm font-semibold text-success">
                  {sub.discount_percentage}% off until {format(parseISO(sub.discount_end_date), 'MMM d')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        {detailItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card className="glass-card">
              <CardContent className="p-4 relative z-10">
                <item.icon className={`h-4 w-4 ${item.color} mb-2`} />
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-bold mt-0.5">{item.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Cancellation guide */}
      {sub.status === 'active' && (sub.cancel_url || sub.cancellation_steps) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="glass-card border-warning/20 p-5">
            <div className="relative z-10 space-y-3">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-warning/10">
                  <XCircle className="h-3.5 w-3.5 text-warning" />
                </div>
                How to cancel
              </h3>
              {sub.cancellation_steps && (
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  {sub.cancellation_steps.map((step, i) => (
                    <li key={i} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              )}
              {sub.cancel_url && (
                <Button variant="outline" size="sm" className="gap-2 border-warning/30 hover:bg-warning/10 text-warning" asChild>
                  <a href={sub.cancel_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Go to cancellation page
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-2 pt-2">
        {sub.status === 'active' && (
          <Button variant="outline" className="w-full text-warning border-warning/30 hover:bg-warning/10" onClick={handleCancel}>
            <XCircle className="h-4 w-4 mr-2" />
            Mark as Cancelled
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Subscription
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card border-destructive/20">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {sub.name}?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently remove this subscription from your list.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionDetail;
