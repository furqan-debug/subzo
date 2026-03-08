import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { LogOut, User, Settings, Bell, Globe, Crown, Loader2, Shield, Sparkles } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { scheduleRenewalNotifications } from '@/hooks/useNotifications';
import { SettingsSkeleton } from '@/components/SkeletonLoaders';
import { useNavigate } from 'react-router-dom';
import { getPlanBadges, canAccess } from '@/lib/planFeatures';
import { Badge } from '@/components/ui/badge';

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'];

const planLabels: Record<string, string> = {
  monthly: 'Monthly — $0.99/mo',
  '6month': '6-Month — $4.99/6mo',
  annual: 'Annual — $8.99/yr',
};

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading: loading, subscriptionPlan } = useProfile();
  const { data: subscriptions } = useSubscriptions();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USD');
  const [reminderDays, setReminderDays] = useState('3');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setCurrency((profile as any).currency ?? 'USD');
      setReminderDays(String((profile as any).reminder_days_before ?? 3));
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ currency, reminder_days_before: parseInt(reminderDays) })
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Settings saved!' });
      // Re-schedule notifications with new reminder days
      if (subscriptions) {
        scheduleRenewalNotifications(subscriptions, parseInt(reminderDays), currency);
      }
    }
    setSaving(false);
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h1 className="font-display text-xl font-semibold">Settings</h1>
      </div>

      {/* Profile card */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-14 w-14 shrink-0 rounded-full border-2 border-primary/30 overflow-hidden bg-secondary flex items-center justify-center">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {user?.user_metadata?.full_name && (
              <p className="font-display font-semibold text-base truncate">{user.user_metadata.full_name}</p>
            )}
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Signed in
            </p>
          </div>
        </div>
      </div>

      {/* Preferences */}
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
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all"
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Current Plan */}
      <div className="glass-card p-5">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Current Plan</Label>
          </div>
          <p className="font-medium text-foreground">
            {subscriptionPlan ? planLabels[subscriptionPlan] || subscriptionPlan : 'Free — Limited features'}
          </p>
          {/* Plan badges */}
          {subscriptionPlan && getPlanBadges(subscriptionPlan).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {getPlanBadges(subscriptionPlan).map((badge) => (
                <Badge key={badge.label} className={`${badge.color === 'accent' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-primary/10 text-primary border-primary/20'} border`}>
                  {badge.color === 'accent' ? <Sparkles className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
          {/* Active features summary */}
          {subscriptionPlan && (
            <div className="space-y-1 pt-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unlocked features</p>
              <div className="flex flex-wrap gap-1.5">
                {['Unlimited subs', 'Smart reminders', 'Full analytics', 'Calendar'].map((f) => (
                  <span key={f} className="rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] font-medium text-success">{f}</span>
                ))}
                {canAccess(subscriptionPlan, 'export_csv') && (
                  <span className="rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] font-medium text-success">CSV Export</span>
                )}
                {canAccess(subscriptionPlan, 'custom_categories') && (
                  <span className="rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] font-medium text-success">Custom Categories</span>
                )}
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/plans')}
          >
            {subscriptionPlan ? 'Change Plan' : 'Upgrade'}
          </Button>
        </div>
      </div>

      {/* Sign out */}
      <Button
        variant="outline"
        className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 transition-all"
        onClick={signOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default SettingsPage;
