import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, parseISO, differenceInMonths } from 'date-fns';
import { useSubscriptions, useDeleteSubscription, useUpdateSubscription } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ExternalLink, Trash2, XCircle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!sub) return <div className="text-center py-20 text-muted-foreground">Subscription not found</div>;

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(sub.id);
    toast({ title: 'Subscription deleted' });
    navigate('/');
  };

  const handleCancel = async () => {
    await updateMutation.mutateAsync({ id: sub.id, status: 'cancelled' });
    toast({ title: 'Marked as cancelled' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary overflow-hidden">
          {sub.logo_url ? (
            <img src={sub.logo_url} alt="" className="h-8 w-8 object-contain" />
          ) : (
            <span className="text-xl font-bold text-muted-foreground">{sub.name[0]}</span>
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{sub.name}</h1>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${sub.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            {sub.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Amount', value: `$${Number(sub.amount).toFixed(2)}/${sub.billing_cycle === 'monthly' ? 'mo' : sub.billing_cycle === 'yearly' ? 'yr' : 'wk'}` },
          { label: 'Next renewal', value: format(parseISO(sub.next_renewal), 'MMM d, yyyy') },
          { label: 'Category', value: sub.category },
          { label: 'Total spent (est.)', value: `$${totalSpent.toFixed(2)}` },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold mt-0.5">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cancellation guide */}
      {sub.status === 'active' && (sub.cancel_url || sub.cancellation_steps) && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <XCircle className="h-4 w-4 text-warning" />
              How to cancel
            </h3>
            {sub.cancellation_steps && (
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                {sub.cancellation_steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
            {sub.cancel_url && (
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={sub.cancel_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Go to cancellation page
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2">
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {sub.name}?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently remove this subscription from your list.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

export default SubscriptionDetail;
