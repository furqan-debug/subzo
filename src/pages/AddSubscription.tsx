import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, addMonths, addWeeks, addYears } from 'date-fns';
import { useCatalog, useAddSubscription } from '@/hooks/useSubscriptions';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Search, ArrowLeft, Loader2, PenLine } from 'lucide-react';

const categories = ['Entertainment', 'Music', 'Productivity', 'Cloud', 'Fitness', 'Health', 'Security', 'Education', 'News', 'Gaming', 'Shopping', 'Professional', 'Other'];

const AddSubscription = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const { data: catalog, isLoading: catalogLoading } = useCatalog(search || undefined);
  const addMutation = useAddSubscription();

  // Custom form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState('monthly');
  const [category, setCategory] = useState('Other');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const getNextRenewal = (start: string, billing: string) => {
    const d = new Date(start);
    if (billing === 'weekly') return format(addWeeks(d, 1), 'yyyy-MM-dd');
    if (billing === 'yearly') return format(addYears(d, 1), 'yyyy-MM-dd');
    return format(addMonths(d, 1), 'yyyy-MM-dd');
  };

  const handleCatalogSelect = async (item: any) => {
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
      toast({ title: `${item.name} added!` });
      navigate('/');
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
      toast({ title: `${name} added!` });
      navigate('/');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => (showCustom ? setShowCustom(false) : navigate(-1))} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-semibold">{showCustom ? 'Custom subscription' : 'Add subscription'}</h1>
      </div>

      {!showCustom ? (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>

          {/* Custom entry button */}
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowCustom(true)}>
            <PenLine className="h-4 w-4" />
            Add custom subscription
          </Button>

          {/* Catalog grid */}
          {catalogLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {catalog?.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <Card
                    className="cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => handleCatalogSelect(item)}
                  >
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary overflow-hidden shrink-0">
                        {item.logo_url ? (
                          <img src={item.logo_url} alt="" className="h-5 w-5 object-contain" />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">{item.name[0]}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.default_price?.toFixed(2)}/mo</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Custom form */
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., My gym" required className="bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="9.99" required className="bg-secondary/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Billing cycle</Label>
              <Select value={cycle} onValueChange={setCycle}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-secondary/50" />
          </div>
          <Button type="submit" className="w-full" disabled={addMutation.isPending}>
            {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Add Subscription
          </Button>
        </form>
      )}
    </div>
  );
};

export default AddSubscription;
