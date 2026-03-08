export type PlanId = 'monthly' | '6month' | 'annual';

export type Feature =
  | 'unlimited_subscriptions'
  | 'smart_reminders'
  | 'full_analytics'
  | 'calendar_view'
  | 'export_csv'
  | 'custom_categories'
  | 'priority_support'
  | 'early_access';

const FEATURE_ACCESS: Record<Feature, PlanId[]> = {
  unlimited_subscriptions: ['monthly', '6month', 'annual'],
  smart_reminders: ['monthly', '6month', 'annual'],
  full_analytics: ['monthly', '6month', 'annual'],
  calendar_view: ['monthly', '6month', 'annual'],
  export_csv: ['6month', 'annual'],
  custom_categories: ['annual'],
  priority_support: ['6month', 'annual'],
  early_access: ['annual'],
};

export const FREE_SUBSCRIPTION_LIMIT = 3;

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
  if (canAccess(plan, 'priority_support')) badges.push({ label: 'Priority Support', color: 'primary' });
  if (canAccess(plan, 'early_access')) badges.push({ label: 'Early Access', color: 'accent' });
  return badges;
}

export function getPlanTier(plan: string | null | undefined): number {
  if (!plan) return 0;
  if (plan === 'monthly') return 1;
  if (plan === '6month') return 2;
  if (plan === 'annual') return 3;
  return 0;
}
