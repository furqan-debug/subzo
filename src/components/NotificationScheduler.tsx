import { useEffect, useRef } from 'react';
import { useNotifications, createNotificationChannels, requestNotificationPermission, scheduleWelcomeNotification } from '@/hooks/useNotifications';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { canAccess } from '@/lib/planFeatures';
import { Capacitor } from '@capacitor/core';

const WELCOME_SENT_KEY = 'subzo_welcome_sent';

/** Invisible component that syncs local notifications with subscriptions */
const NotificationScheduler = () => {
  const { data: subscriptions } = useSubscriptions();
  const { profile, subscriptionPlan } = useProfile();
  const { user } = useAuth();
  const channelsCreated = useRef(false);
  const welcomeChecked = useRef(false);

  const reminderDays = (profile as any)?.reminder_days_before ?? 3;
  const currency = (profile as any)?.currency ?? 'USD';

  // Create notification channels once on mount
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || channelsCreated.current) return;
    channelsCreated.current = true;
    createNotificationChannels();
  }, []);

  // Send welcome notification on first login/install
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user || welcomeChecked.current) return;
    welcomeChecked.current = true;

    const alreadySent = localStorage.getItem(WELCOME_SENT_KEY);
    if (alreadySent) return;

    (async () => {
      const granted = await requestNotificationPermission();
      if (!granted) return;

      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
      await scheduleWelcomeNotification(name);
      localStorage.setItem(WELCOME_SENT_KEY, 'true');
    })();
  }, [user]);

  // Only schedule reminders for paid users
  const enabled = canAccess(subscriptionPlan, 'smart_reminders');
  useNotifications(enabled ? subscriptions : undefined, reminderDays, currency);

  return null;
};

export default NotificationScheduler;
