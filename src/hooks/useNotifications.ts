import { useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { differenceInDays, subDays, setHours, setMinutes, setSeconds } from 'date-fns';
import type { Subscription } from './useSubscriptions';

const isNative = Capacitor.isNativePlatform();

/** Generate a stable numeric ID from a UUID (first 8 hex chars → int32) */
const uuidToNotifId = (uuid: string): number => {
  return parseInt(uuid.replace(/-/g, '').substring(0, 8), 16) % 2147483647;
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
    const notifications = subscriptions
      .filter((s) => s.status === 'active')
      .map((sub) => {
        const renewalDate = new Date(sub.next_renewal);
        const notifyDate = subDays(renewalDate, reminderDays);
        // Set to 9:00 AM
        const scheduledAt = setSeconds(setMinutes(setHours(notifyDate, 9), 0), 0);

        if (scheduledAt <= now) return null;

        const daysUntil = differenceInDays(renewalDate, notifyDate);

        return {
          id: uuidToNotifId(sub.id),
          title: 'Subscription Renewal',
          body: `${sub.name} renews in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} — ${currency}${sub.amount}`,
          schedule: { at: scheduledAt },
          sound: 'default' as const,
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: '#6366f1',
        };
      })
      .filter(Boolean) as any[];

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.warn('Failed to schedule notifications:', e);
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
