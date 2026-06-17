import { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useCatalog, useAddSubscription, useSubscriptions, type CatalogItem } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from '@/hooks/useToast';
import { Search, ArrowLeft, Loader2, PenLine, Sparkles, ChevronDown, Lock, Crown } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import { playAddCelebration } from '@/lib/celebrations';
import { useProfile } from '@/hooks/useProfile';
import { getSubscriptionLimit, FREE_SUBSCRIPTION_LIMIT } from '@/lib/planFeatures';
import SubscriptionLogo from '@/components/SubscriptionLogo';
import { formatCurrency, formatBillingCycle, getNextRenewal } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

const AddSubscription = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const { data: catalog, isLoading: catalogLoading } = useCatalog(search || undefined);
  const { data: subscriptions } = useSubscriptions();
  const { subscriptionPlan, currency } = useProfile();
  const addMutation = useAddSubscription();

  const activeCount = useMemo(() => subscriptions?.filter(s => s.status === 'active').length ?? 0, [subscriptions]);
  const limit = useMemo(() => getSubscriptionLimit(subscriptionPlan), [subscriptionPlan]);
  const isAtLimit = activeCount >= limit;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState('monthly');
  const [category, setCategory] = useState('Other');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hasTrial, setHasTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');

  const checkLimit = useCallback(() => {
    if (isAtLimit) {
      toast({ title: '🔒 Subscription limit reached', description: `Free plan allows ${FREE_SUBSCRIPTION_LIMIT} subscriptions. Upgrade to add more.` });
      return false;
    }
    return true;
  }, [isAtLimit]);

  const handleCatalogSelect = useCallback(async (item: CatalogItem) => {
    if (!checkLimit()) return;
    if (addMutation.isPending) return;
    try {
      await addMutation.mutateAsync({
        catalog_id: item.id,
        name: item.name,
        logo_url: item.logo_url,
        amount: item.default_price ?? 0,
        billing_cycle: item.billing_cycle ?? 'monthly',
        next_renewal: getNextRenewal(format(new Date(), 'yyyy-MM-dd'), item.billing_cycle ?? 'monthly'),
        category: item.category,
        status: 'active',
        cancel_url: item.cancel_url,
        cancellation_steps: item.cancellation_steps,
        notes: null,
        trial_end_date: null,
        discount_percentage: null,
        discount_end_date: null,
      });
      playAddCelebration();
      toast({ title: `${item.name} added! 🎉` });
      setTimeout(() => navigate('/'), 600);
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Something went wrong', variant: 'destructive' });
    }
  }, [checkLimit, addMutation, navigate]);

  const handleCustomSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkLimit()) return;
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || !amount || isNaN(parsedAmount) || parsedAmount < 0) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    try {
      await addMutation.mutateAsync({
        catalog_id: null,
        name: name.trim(),
        logo_url: null,
        amount: parsedAmount,
        billing_cycle: cycle,
        next_renewal: getNextRenewal(startDate, cycle),
        category,
        status: 'active',
        cancel_url: null,
        cancellation_steps: null,
        notes: null,
        trial_end_date: hasTrial && trialEndDate ? trialEndDate : null,
        discount_percentage: hasDiscount && discountPercentage ? parseFloat(discountPercentage) : null,
        discount_end_date: hasDiscount && discountEndDate ? discountEndDate : null,
      });
      playAddCelebration();
      toast({ title: `${name} added! 🎉` });
      setTimeout(() => navigate('/'), 600);
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Something went wrong', variant: 'destructive' });
    }
  }, [checkLimit, amount, name, addMutation, cycle, startDate, category, hasTrial, trialEndDate, hasDiscount, discountPercentage, discountEndDate, navigate]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => showCustom ? setShowCustom(false) : navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-semibold">
          {showCustom ? 'Custom subscription' : 'Add subscription'}
        </h1>
      </div>

      {isAtLimit && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card border-warning/20 p-4">
            <div className="relative z-10 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                <Lock className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Limit reached ({activeCount}/{FREE_SUBSCRIPTION_LIMIT})</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upgrade to add unlimited subscriptions.</p>
                <Button asChild size="sm" className="mt-2 h-7 text-xs glow-primary bg-gradient-to-r from-primary to-primary-glow">
                  <Link to="/plans"><Crown className="h-3 w-3 mr-1" />Upgrade</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {!showCustom ? (
        <>
          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/30 border-border/50 focus:border-primary/50 transition-colors"
            />
          </motion.div>

          {/* Custom entry button */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => setShowCustom(true)}
            >
              <PenLine className="h-4 w-4 text-primary" />
              Add custom subscription
            </Button>
          </motion.div>

          {/* Catalog grid */}
          {catalogLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : catalog && catalog.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground text-sm mb-3">No services found for "{search}"</p>
              <Button variant="outline" size="sm" onClick={() => setShowCustom(true)} className="gap-2">
                <PenLine className="h-4 w-4" />
                Add it manually
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {catalog?.map((item) => (
                <div key={item.id}>
                  <Card
                    className="group glass-card cursor-pointer hover:border-primary/30 transition-all duration-300"
                    onClick={() => handleCatalogSelect(item)}
                  >
                    <CardContent className="flex items-center gap-3 p-3 relative z-10">
                      <div className="icon-premium h-10 w-10 shrink-0 group-hover:shadow-[0_0_12px_-2px_hsl(var(--primary)/0.3)] transition-shadow duration-300">
                        <SubscriptionLogo name={item.name} logoUrl={item.logo_url} size="sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.default_price ? formatCurrency(item.default_price, currency) : 'Free'}/{item.billing_cycle ? formatBillingCycle(item.billing_cycle) : 'mo'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Custom form */
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCustomSubmit}
          className="space-y-4"
        >
          <div className="glass-card p-5 space-y-4 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Subscription details</span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., My gym" required className="bg-secondary/30 border-border/50 focus:border-primary/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Amount ($) *</Label>
              <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="9.99" required className="bg-secondary/30 border-border/50 focus:border-primary/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Billing cycle</Label>
                <Select value={cycle} onValueChange={setCycle}>
                  <SelectTrigger className="bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-secondary/30 border-border/50 focus:border-primary/50" />
            </div>
          </div>

          {/* Trial / Discount section */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
              <ChevronDown className="h-3.5 w-3.5" />
              Trial &amp; Discount (optional)
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="glass-card p-4 space-y-4 relative z-10">
                {/* Free trial toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Free trial</Label>
                    <Switch checked={hasTrial} onCheckedChange={setHasTrial} />
                  </div>
                  {hasTrial && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Trial ends on</Label>
                      <Input type="date" value={trialEndDate} onChange={(e) => setTrialEndDate(e.target.value)} className="bg-secondary/30 border-border/50 focus:border-primary/50" />
                    </div>
                  )}
                </div>

                {/* Discount toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Discounted price</Label>
                    <Switch checked={hasDiscount} onCheckedChange={setHasDiscount} />
                  </div>
                  {hasDiscount && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Discount %</Label>
                        <Input type="number" min="1" max="100" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} placeholder="50" className="bg-secondary/30 border-border/50 focus:border-primary/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Ends on</Label>
                        <Input type="date" value={discountEndDate} onChange={(e) => setDiscountEndDate(e.target.value)} className="bg-secondary/30 border-border/50 focus:border-primary/50" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button type="submit" className="w-full glow-primary bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all" disabled={addMutation.isPending}>
            {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Add Subscription
          </Button>
        </motion.form>
      )}
    </div>
  );
};

export default AddSubscription;
