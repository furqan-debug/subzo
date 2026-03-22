import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/** Extended profile shape including runtime-only columns not yet in generated types */
interface Profile {
  user_id: string;
  subscription_plan?: string | null;
  plan_selected_at?: string | null;
  currency?: string;
  reminder_days_before?: number;
  [key: string]: unknown;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  const selectPlan = async (plan: 'monthly' | 'annual') => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        plan_selected_at: new Date().toISOString(),
      } as never)
      .eq('user_id', user.id);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
  };

  const cancelPlan = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: null,
        plan_selected_at: null,
      } as never)
      .eq('user_id', user.id);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
  };

  const rawPlan = profile?.subscription_plan as string | null | undefined;
  const validPlans = ['monthly', 'annual'];
  const subscriptionPlan = rawPlan && validPlans.includes(rawPlan) ? rawPlan : null;

  /** ISO 4217 currency code from the user's settings, defaults to USD */
  const currency = profile?.currency ?? 'USD';

  return {
    profile,
    isLoading,
    subscriptionPlan,
    currency,
    selectPlan,
    cancelPlan,
    refetch,
  };
};
