import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { LogOut, User, Bell, Globe, Crown, Loader2, Sparkles, ChevronRight, Trash2, Info, Download, Lock, FileText } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { scheduleRenewalNotifications } from '@/hooks/useNotifications';
import { SettingsSkeleton } from '@/components/SkeletonLoaders';
import { canAccess } from '@/lib/planFeatures';
import FeatureGate from '@/components/FeatureGate';
import { exportSubscriptionsPdf } from '@/lib/exportPdf';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Badge } from '@/components/ui/badge';
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
import { format } from 'date-fns';

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'];

const planLabels: Record<string, string> = {
  monthly: 'Pro Monthly',
  annual: 'Pro Annual',
  '6month': 'Pro',
};

const planPrices: Record<string, string> = {
  monthly: '$1.99/mo',
  annual: '$14.99/yr',
  '6month': '',
};

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading: loading, subscriptionPlan } = useProfile();
  const { data: subscriptions } = useSubscriptions();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USD');
  const [reminderDays, setReminderDays] = useState('3');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Track original values for dirty state
  const [originalCurrency, setOriginalCurrency] = useState('USD');
  const [originalReminderDays, setOriginalReminderDays] = useState('3');

  const isDirty = currency !== originalCurrency || reminderDays !== originalReminderDays;

  useEffect(() => {
    if (profile) {
      const c = (profile as any).currency ?? 'USD';
      const r = String((profile as any).reminder_days_before ?? 3);
      setCurrency(c);
      setReminderDays(r);
      setOriginalCurrency(c);
      setOriginalReminderDays(r);
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
      setOriginalCurrency(currency);
      setOriginalReminderDays(reminderDays);
      if (subscriptions) {
        scheduleRenewalNotifications(subscriptions, parseInt(reminderDays), currency);
      }
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Delete user's data first, then sign out
      // Note: Full account deletion requires a server-side function
      // For now, we clear data and sign out
      if (user) {
        await supabase.from('subscriptions').delete().eq('user_id', user.id);
        await supabase.from('reminders').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('user_id', user.id);
      }
      await signOut();
      toast({ title: 'Account deleted', description: 'Your data has been removed.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete account. Please try again.', variant: 'destructive' });
    }
    setDeleting(false);
  };

  const isPro = !!subscriptionPlan;
  const canReminders = canAccess(subscriptionPlan, 'smart_reminders');
  const memberSince = user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : null;

  const handleExportCSV = async () => {
    if (!subscriptions?.length) {
      toast({ title: 'No data', description: 'You have no subscriptions to export.' });
      return;
    }
    const headers = ['Name', 'Amount', 'Billing Cycle', 'Category', 'Status', 'Next Renewal'];
    const rows = subscriptions.map((s) => [
      s.name,
      s.amount,
      s.billing_cycle,
      s.category,
      s.status,
      s.next_renewal,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const fileName = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;

    if (Capacitor.isNativePlatform()) {
      const { shareFileNative } = await import('@/lib/nativeShare');
      const { Encoding } = await import('@capacitor/filesystem');
      await shareFileNative(fileName, csv, 'text/csv', Encoding.UTF8);
    } else {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
    toast({ title: 'Exported!', description: `${subscriptions.length} subscriptions exported.` });
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6 pb-8">
      {/* ─── Profile Hero ─── */}
      <div className="glass-card p-6 relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-20 ${isPro ? 'bg-primary' : 'bg-muted-foreground'}`} />

        <div className="relative z-10 flex items-center gap-5">
          {/* Avatar with gradient ring */}
          <div className={`h-[72px] w-[72px] shrink-0 rounded-full p-[3px] ${
            isPro
              ? 'bg-gradient-to-br from-primary to-primary-glow'
              : 'bg-gradient-to-br from-muted-foreground/40 to-muted-foreground/20'
          }`}>
            <div className="h-full w-full rounded-full overflow-hidden bg-secondary flex items-center justify-center">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {user?.user_metadata?.full_name && (
                <p className="font-display font-semibold text-lg truncate text-foreground">
                  {user.user_metadata.full_name}
                </p>
              )}
              <Badge
                className={`shrink-0 text-[10px] px-2 py-0 ${
                  isPro
                    ? 'bg-primary/15 text-primary border-primary/25'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {isPro ? 'Pro' : 'Free'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            {memberSince && (
              <p className="text-xs text-muted-foreground/60">Member since {memberSince}</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Subscription Plan Card ─── */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 px-1">
          Your Plan
        </p>
        {isPro ? (
          <div className="glass-card p-5 border-success/20 relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-10 bg-success" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-success" />
                  <span className="font-display font-semibold text-foreground">
                    {planLabels[subscriptionPlan] || subscriptionPlan}
                  </span>
                </div>
                <span className="text-sm font-medium text-success">
                  {planPrices[subscriptionPlan] || ''}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Unlimited', 'Reminders', 'Analytics', 'Calendar', 'CSV Export', '⭐ Support'].map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-success/8 border border-success/15 px-2.5 py-0.5 text-[10px] font-medium text-success"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full border-success/20 text-success hover:bg-success/10"
                onClick={() => navigate('/plans')}
              >
                Change Plan
                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass-card p-5 border-warning/20 relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-10 bg-warning" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-warning" />
                <span className="font-display font-semibold text-foreground">Free Plan</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Limited to 2 subscriptions. Upgrade to unlock reminders, analytics, and more.
              </p>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                onClick={() => navigate('/plans')}
              >
                Upgrade to Pro
                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Preferences ─── */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 px-1">
          Preferences
        </p>
        <div className="glass-card divide-y divide-border/50 overflow-hidden">
          {/* Currency row */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Currency</span>
            </div>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24 h-8 text-xs bg-secondary/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reminder row */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">Reminder before renewal</span>
              {!canReminders && (
                <Badge className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                  <Lock className="h-2.5 w-2.5 mr-0.5" />
                  Pro
                </Badge>
              )}
            </div>
            <Select value={reminderDays} onValueChange={setReminderDays} disabled={!canReminders}>
              <SelectTrigger className={`w-24 h-8 text-xs bg-secondary/30 border-border/50 ${!canReminders ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['1', '2', '3', '5', '7'].map((d) => (
                  <SelectItem key={d} value={d}>{d} day{d !== '1' ? 's' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Save — only when dirty */}
        {isDirty && (
          <Button
            onClick={handleSave}
            size="sm"
            className="w-full mt-3 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        )}
      </div>

      {/* ─── Data ─── */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 px-1">
          Data
        </p>
        <FeatureGate feature="export_csv" blur title="Export your data" description="Data export is available on Pro plans.">
          <div className="glass-card divide-y divide-border/50 overflow-hidden">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4 text-accent" />
                <div>
                  <span className="text-sm font-medium text-foreground">Export CSV</span>
                  <p className="text-xs text-muted-foreground">Raw data as a spreadsheet</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
            <button
              onClick={async () => {
                if (!subscriptions?.length) {
                  toast({ title: 'No data', description: 'You have no subscriptions to export.' });
                  return;
                }
                await exportSubscriptionsPdf(subscriptions, currency);
                toast({ title: 'PDF exported!', description: `${subscriptions.length} subscriptions exported.` });
              }}
              className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-sm font-medium text-foreground">Export PDF</span>
                  <p className="text-xs text-muted-foreground">Designed report with summary & table</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
          </div>
        </FeatureGate>
      </div>


      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 px-1">
          Account
        </p>
        <div className="glass-card divide-y divide-border/50 overflow-hidden">
          {/* Sign out */}
          <button
            onClick={signOut}
            className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Sign Out</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </button>

          {/* Delete account */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-destructive/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-4 w-4 text-destructive/70" />
                  <span className="text-sm font-medium text-destructive/70">Delete Account</span>
                </div>
                <ChevronRight className="h-4 w-4 text-destructive/30" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your subscriptions, reminders, and profile data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleting}
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* App version */}
      <div className="flex items-center justify-center gap-1.5 pt-2">
        <Info className="h-3 w-3 text-muted-foreground/40" />
        <p className="text-[11px] text-muted-foreground/40">Subzo v1.0.0</p>
      </div>
    </div>
  );
};

export default SettingsPage;
