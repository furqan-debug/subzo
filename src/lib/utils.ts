import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { format, addMonths, addWeeks, addYears, parseISO } from 'date-fns';

export const getNextRenewal = (start: string, billing: string) => {
  const d = parseISO(start);
  if (billing === 'weekly') return format(addWeeks(d, 1), 'yyyy-MM-dd');
  if (billing === 'yearly') return format(addYears(d, 1), 'yyyy-MM-dd');
  return format(addMonths(d, 1), 'yyyy-MM-dd');
};

// ─── Subscription Utilities ─────────────────────────────────────────────────

/** Exact weeks per month (52/12). Use instead of the approximated 4.33. */
export const WEEKS_PER_MONTH = 52 / 12;

/**
 * Normalise any billing cycle amount to a monthly equivalent.
 * Yearly  → divide by 12
 * Weekly  → multiply by WEEKS_PER_MONTH
 * Monthly → unchanged
 */
export const toMonthlyAmount = (amount: number, cycle: string): number => {
  const n = Number(amount);
  if (cycle === 'yearly') return n / 12;
  if (cycle === 'weekly') return n * WEEKS_PER_MONTH;
  return n;
};

/**
 * Short label for a billing cycle: 'mo' | 'yr' | 'wk'
 */
export const formatBillingCycle = (cycle: string): string => {
  if (cycle === 'monthly') return 'mo';
  if (cycle === 'yearly') return 'yr';
  return 'wk';
};

/**
 * Locale-aware currency formatter.
 * Falls back to a simple `currency amount` string if the locale API doesn't
 * recognise the currency code.
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};
