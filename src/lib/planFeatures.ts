export type PlanId = 'monthly' | 'annual';

export type Feature =
  | 'unlimited_subscriptions'
  | 'smart_reminders'
  | 'full_analytics'
  | 'calendar_view'
  | 'export_csv'
  | 'priority_support';

const FEATURE_ACCESS: Record<Feature, PlanId[]> = {
  unlimited_subscriptions: ['monthly', 'annual'],
  smart_reminders: ['monthly', 'annual'],
  full_analytics: ['monthly', 'annual'],
  calendar_view: ['monthly', 'annual'],
  export_csv: ['monthly', 'annual'],
  priority_support: ['monthly', 'annual'],
};

export const FREE_SUBSCRIPTION_LIMIT = 2;

export function canAccess(plan: string | null | undefined, feature: Feature): boolean {
  if (!plan) return false;
  return FEATURE_ACCESS[feature]?.includes(plan as PlanId) ?? false;
}

export function getSubscriptionLimit(plan: string | null | undefined): number {
  if (!plan) return FREE_SUBSCRIPTION_LIMIT;
  return Infinity;
}

export function getPlanBadges(plan: string | null | undefined): { label: string; color: string }[] {
  const badges: { label: string; color: string }[] = [];
  if (canAccess(plan, 'priority_support')) badges.push({ label: '⭐ Priority Support', color: 'primary' });
  return badges;
}

export function getPlanTier(plan: string | null | undefined): number {
  if (!plan) return 0;
  if (plan === 'monthly') return 1;
  if (plan === 'annual') return 2;
  return 0;
}
