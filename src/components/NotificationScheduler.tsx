import { useEffect, useRef } from 'react';
import { useNotifications, createNotificationChannels } from '@/hooks/useNotifications';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
import { canAccess } from '@/lib/planFeatures';
import { Capacitor } from '@capacitor/core';

/** Invisible component that syncs local notifications with subscriptions */
const NotificationScheduler = () => {
  const { data: subscriptions } = useSubscriptions();
  const { profile, subscriptionPlan } = useProfile();
  const channelsCreated = useRef(false);

  const reminderDays = (profile as any)?.reminder_days_before ?? 3;
  const currency = (profile as any)?.currency ?? 'USD';

  // Create notification channels once on mount
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || channelsCreated.current) return;
    channelsCreated.current = true;
    createNotificationChannels();
  }, []);

  // Only schedule reminders for paid users
  const enabled = canAccess(subscriptionPlan, 'smart_reminders');
  useNotifications(enabled ? subscriptions : undefined, reminderDays, currency);

  return null;
};

export default NotificationScheduler;
