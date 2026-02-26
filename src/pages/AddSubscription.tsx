import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addMonths, addWeeks, addYears } from 'date-fns';
import { useCatalog, useAddSubscription, type CatalogItem } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Search, ArrowLeft, Loader2, PenLine, Sparkles } from 'lucide-react';
import { playAddCelebration } from '@/lib/celebrations';

const categories = ['Entertainment', 'Music', 'Productivity', 'Cloud', 'Fitness', 'Health', 'Security', 'Education', 'News', 'Gaming', 'Shopping', 'Professional', 'Other'];

const AddSubscription = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const { data: catalog, isLoading: catalogLoading } = useCatalog(search || undefined);
  const addMutation = useAddSubscription();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState('monthly');
  const [category, setCategory] = useState('Other');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [logoFallbackStep, setLogoFallbackStep] = useState<Record<string, number>>({});

  const getWebsiteFavicon = (websiteUrl: string | null) => {
    if (!websiteUrl) return null;
    try {
      const domain = new URL(websiteUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const getLogoSrc = (item: CatalogItem) => {
    const step = logoFallbackStep[item.id] ?? 0;
    if (step === 0) return item.logo_url;
    if (step === 1) return getWebsiteFavicon(item.website_url);
    return null;
  };

  const handleLogoError = (item: CatalogItem) => {
    setLogoFallbackStep((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }));
  };

  const getNextRenewal = (start: string, billing: string) => {
    const d = new Date(start);
    if (billing === 'weekly') return format(addWeeks(d, 1), 'yyyy-MM-dd');
    if (billing === 'yearly') return format(addYears(d, 1), 'yyyy-MM-dd');
    return format(addMonths(d, 1), 'yyyy-MM-dd');
  };

  const handleCatalogSelect = async (item: CatalogItem) => {
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
      });
      playAddCelebration();
      toast({ title: `${item.name} added! 🎉` });
      setTimeout(() => navigate('/'), 600);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMutation.mutateAsync({
        catalog_id: null,
        name,
        logo_url: null,
        amount: parseFloat(amount),
        billing_cycle: cycle,
        next_renewal: getNextRenewal(startDate, cycle),
        category,
        status: 'active',
        cancel_url: null,
        cancellation_steps: null,
        notes: null,
      });
      playAddCelebration();
      toast({ title: `${name} added! 🎉` });
      setTimeout(() => navigate('/'), 600);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => (showCustom ? setShowCustom(false) : navigate(-1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-semibold">
          {showCustom ? 'Custom subscription' : 'Add subscription'}
        </h1>
      </div>

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
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {catalog?.map((item, i) => {
                const logoSrc = getLogoSrc(item);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <Card
                      className="group glass-card cursor-pointer hover:border-primary/30 transition-all duration-300"
                      onClick={() => handleCatalogSelect(item)}
                    >
                      <CardContent className="flex items-center gap-3 p-3 relative z-10">
                        <div className="icon-premium h-10 w-10 shrink-0 group-hover:shadow-[0_0_12px_-2px_hsl(var(--primary)/0.3)] transition-shadow duration-300">
                          {logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={`${item.name} logo`}
                              className="h-5 w-5 object-contain"
                              loading="lazy"
                              onError={() => handleLogoError(item)}
                            />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">{item.name?.[0] ?? '?'}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.name}</p>
                          <p className="text-xs text-muted-foreground">${item.default_price?.toFixed(2)}/mo</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
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
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., My gym" required className="bg-secondary/30 border-border/50 focus:border-primary/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Amount ($)</Label>
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
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-secondary/30 border-border/50 focus:border-primary/50" />
            </div>
          </div>

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
