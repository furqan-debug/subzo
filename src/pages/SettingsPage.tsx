import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { LogOut, User, Loader2, Settings, Bell, Globe, Crown } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'];

const planLabels: Record<string, string> = {
  monthly: 'Monthly — $0.99/mo',
  '6month': '6-Month — $4.99/6mo',
  annual: 'Annual — $8.99/yr',
};

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { subscriptionPlan } = useProfile();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USD');
  const [reminderDays, setReminderDays] = useState('3');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('currency, reminder_days_before')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setCurrency(data.currency);
          setReminderDays(String(data.reminder_days_before));
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ currency, reminder_days_before: parseInt(reminderDays) })
      .eq('user_id', user.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Settings saved!' });
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h1 className="font-display text-xl font-semibold">Settings</h1>
      </div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card p-5">
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Signed in
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="glass-card p-5 space-y-5">
          <div className="relative z-10 space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-accent" />
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Currency</Label>
              </div>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="h-px bg-border/50" />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-warning" />
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Reminder (days before renewal)</Label>
              </div>
              <Select value={reminderDays} onValueChange={setReminderDays}>
                <SelectTrigger className="bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '5', '7'].map((d) => <SelectItem key={d} value={d}>{d} day{d !== '1' ? 's' : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary glow-primary transition-all"
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Settings
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Current Plan */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card p-5">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Current Plan</Label>
            </div>
            <p className="font-medium text-foreground">
              {subscriptionPlan ? planLabels[subscriptionPlan] || subscriptionPlan : 'No plan selected'}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/plans')}
            >
              Change Plan
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Sign out */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 transition-all"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
