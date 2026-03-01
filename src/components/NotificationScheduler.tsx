import { useNotifications } from '@/hooks/useNotifications';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';

/** Invisible component that syncs local notifications with subscriptions */
const NotificationScheduler = () => {
  const { data: subscriptions } = useSubscriptions();
  const { profile } = useProfile();

  const reminderDays = (profile as any)?.reminder_days_before ?? 3;
  const currency = (profile as any)?.currency ?? 'USD';

  useNotifications(subscriptions, reminderDays, currency);

  return null;
};

export default NotificationScheduler;
