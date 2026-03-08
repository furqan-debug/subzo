import { useNotifications } from '@/hooks/useNotifications';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
import { canAccess } from '@/lib/planFeatures';

/** Invisible component that syncs local notifications with subscriptions */
const NotificationScheduler = () => {
  const { data: subscriptions } = useSubscriptions();
  const { profile, subscriptionPlan } = useProfile();

  const reminderDays = (profile as any)?.reminder_days_before ?? 3;
  const currency = (profile as any)?.currency ?? 'USD';

  // Only schedule reminders for paid users
  const enabled = canAccess(subscriptionPlan, 'smart_reminders');
  useNotifications(enabled ? subscriptions : undefined, reminderDays, currency);

  return null;
};

export default NotificationScheduler;
