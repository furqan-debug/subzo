import { useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { differenceInDays, subDays, setHours, setMinutes, setSeconds, addDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { Subscription } from './useSubscriptions';

const isNative = Capacitor.isNativePlatform();

/**
 * Generate a stable numeric ID from a UUID (first 8 hex chars → int32).
 * Uses *3 multiplier so that offset variants (+1, +2) never collide with
 * the base ID of another subscription.
 * Offsets: 0 = early reminder, 1 = day-of, 2 = trial expiry
 */
const uuidToNotifId = (uuid: string, offset = 0): number => {
  const base = parseInt(uuid.replace(/-/g, '').substring(0, 8), 16) % 715_827_882; // MAX_INT / 3
  return base * 3 + offset;
};

const WEEKLY_SUMMARY_ID = 999_999;

// ── Channel IDs ──
const CHANNEL_RENEWALS = 'renewal_reminders';
const CHANNEL_INSIGHTS = 'spending_insights';
const CHANNEL_TRIALS = 'trial_alerts';

/** Create Android notification channels (idempotent) */
export const createNotificationChannels = async () => {
  if (!isNative) return;

  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_RENEWALS,
      name: 'Renewal Reminders',
      description: 'Alerts before your subscriptions renew',
      importance: 4, // HIGH
      sound: 'default',
      vibration: true,
    });

    await LocalNotifications.createChannel({
      id: CHANNEL_INSIGHTS,
      name: 'Spending Insights',
      description: 'Weekly spending summaries and tips',
      importance: 3, // DEFAULT
      sound: 'default',
      vibration: false,
    });

    await LocalNotifications.createChannel({
      id: CHANNEL_TRIALS,
      name: 'Trial Expiry Alerts',
      description: 'Urgent alerts before free trials end',
      importance: 4, // HIGH
      sound: 'default',
      vibration: true,
    });
  } catch (e) {
    console.warn('Failed to create notification channels:', e);
  }
};

/** Format currency amount using locale-aware formatter */
const fmt = (currency: string, amount: number) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const scheduleRenewalNotifications = async (
  subscriptions: Subscription[],
  reminderDays: number,
  currency = 'USD',
) => {
  if (!isNative) return;

  try {
    // Cancel all existing scheduled notifications
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    const now = new Date();
    const notifications: Parameters<typeof LocalNotifications.schedule>[0]['notifications'] = [];

    const activeSubs = subscriptions.filter((s) => s.status === 'active');

    for (const sub of activeSubs) {
      const renewalDate = new Date(sub.next_renewal);

      // ── Early reminder (X days before) ──
      const earlyDate = subDays(renewalDate, reminderDays);
      const earlyAt = setSeconds(setMinutes(setHours(earlyDate, 9), 0), 0);
      if (earlyAt > now) {
        const daysUntil = differenceInDays(renewalDate, earlyDate);
        notifications.push({
          id: uuidToNotifId(sub.id, 0),
          title: '📅 Upcoming Renewal',
          body: `${sub.name} renews in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} — ${fmt(currency, sub.amount)}`,
          schedule: { at: earlyAt },
          channelId: CHANNEL_RENEWALS,
          sound: 'default',
          smallIcon: 'ic_launcher',
          iconColor: '#6366f1',
          extra: { subscriptionId: sub.id, type: 'renewal_early' },
        });
      }

      // ── Day-of reminder ──
      const dayOfAt = setSeconds(setMinutes(setHours(renewalDate, 9), 0), 0);
      if (dayOfAt > now) {
        notifications.push({
          id: uuidToNotifId(sub.id, 1),
          title: '🔔 Renewing Today',
          body: `${sub.name} renews today — ${fmt(currency, sub.amount)}`,
          schedule: { at: dayOfAt },
          channelId: CHANNEL_RENEWALS,
          sound: 'default',
          smallIcon: 'ic_launcher',
          iconColor: '#6366f1',
          extra: { subscriptionId: sub.id, type: 'renewal_today' },
        });
      }

      // ── Trial expiry alert (1 day before trial ends) ──
      if (sub.trial_end_date) {
        const trialEnd = new Date(sub.trial_end_date);
        const trialAlertDate = subDays(trialEnd, 1);
        const trialAt = setSeconds(setMinutes(setHours(trialAlertDate, 9), 0), 0);
        if (trialAt > now) {
          notifications.push({
            id: uuidToNotifId(sub.id, 2),
            title: '⚠️ Trial Ending Tomorrow',
            body: `Your ${sub.name} trial ends tomorrow — cancel before you're charged ${fmt(currency, sub.amount)}`,
            schedule: { at: trialAt },
            channelId: CHANNEL_TRIALS,
            sound: 'default',
            smallIcon: 'ic_launcher',
            iconColor: '#ef4444',
            extra: { subscriptionId: sub.id, type: 'trial_expiry' },
          });
        }
      }
    }

    // ── Weekly spending summary (next Monday at 10 AM) ──
    const nextMonday = startOfWeek(addDays(now, 7), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(nextMonday, { weekStartsOn: 1 });
    const weekRenewals = activeSubs.filter((s) => {
      const d = new Date(s.next_renewal);
      return isWithinInterval(d, { start: nextMonday, end: weekEnd });
    });

    if (weekRenewals.length > 0) {
      const weekTotal = weekRenewals.reduce((sum, s) => sum + s.amount, 0);
      const summaryAt = setSeconds(setMinutes(setHours(nextMonday, 10), 0), 0);
      if (summaryAt > now) {
        notifications.push({
          id: WEEKLY_SUMMARY_ID,
          title: '💰 Weekly Summary',
          body: `You have ${weekRenewals.length} renewal${weekRenewals.length !== 1 ? 's' : ''} this week totaling ${fmt(currency, weekTotal)}`,
          schedule: { at: summaryAt, every: 'week' as const },
          channelId: CHANNEL_INSIGHTS,
          sound: 'default',
          smallIcon: 'ic_launcher',
          iconColor: '#10b981',
          extra: { type: 'weekly_summary' },
        });
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.warn('Failed to schedule notifications:', e);
  }
};

const WELCOME_NOTIF_ID = 888_888;

/** Schedule a premium welcome notification 3s after call */
export const scheduleWelcomeNotification = async (userName: string) => {
  if (!isNative) return;

  try {
    const fireAt = new Date(Date.now() + 3000);
    const displayName = userName || 'there';

    await LocalNotifications.schedule({
      notifications: [
        {
          id: WELCOME_NOTIF_ID,
          title: `Hey ${displayName} 👋`,
          body: `You're all set! We'll keep your subscriptions in check. 💎`,
          schedule: { at: fireAt },
          channelId: CHANNEL_INSIGHTS,
          sound: 'default',
          smallIcon: 'ic_launcher',
          iconColor: '#6366f1',
          extra: { type: 'welcome' },
        },
      ],
    });
  } catch (e) {
    console.warn('Failed to schedule welcome notification:', e);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNative) return false;

  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display === 'granted') return true;

    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (e) {
    console.warn('Notification permission error:', e);
    return false;
  }
};

/** Set up listener for notification taps — returns cleanup function */
export const addNotificationTapListener = (
  navigate: (path: string) => void,
) => {
  if (!isNative) return () => {};

  const listener = LocalNotifications.addListener(
    'localNotificationActionPerformed',
    (event) => {
      const extra = event.notification.extra;
      if (extra?.subscriptionId) {
        navigate(`/subscription/${extra.subscriptionId}`);
      } else if (extra?.type === 'weekly_summary') {
        navigate('/analytics');
      }
    },
  );

  return () => {
    listener.then((l) => l.remove());
  };
};

export const useNotifications = (
  subscriptions: Subscription[] | undefined,
  reminderDays: number,
  currency: string,
) => {
  const hasRequested = useRef(false);

  const reschedule = useCallback(async () => {
    if (!subscriptions || subscriptions.length === 0) return;
    await scheduleRenewalNotifications(subscriptions, reminderDays, currency);
  }, [subscriptions, reminderDays, currency]);

  // Request permission once & schedule on app open
  useEffect(() => {
    if (!isNative || hasRequested.current) return;
    hasRequested.current = true;

    (async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        await reschedule();
      }
    })();
  }, [reschedule]);

  // Re-schedule whenever subscriptions or settings change
  useEffect(() => {
    if (!isNative) return;
    reschedule();
  }, [reschedule]);

  return { reschedule };
};
