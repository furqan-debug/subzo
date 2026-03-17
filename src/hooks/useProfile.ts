import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useProfile = () => {
  const { user } = useAuth();

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
      return data;
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
      } as any)
      .eq('user_id', user.id);
    if (error) throw error;
    await refetch();
  };

  const cancelPlan = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: null,
        plan_selected_at: null,
      } as any)
      .eq('user_id', user.id);
    if (error) throw error;
    await refetch();
  };

  const rawPlan = (profile as any)?.subscription_plan as string | null;
  const validPlans = ['monthly', 'annual'];
  const subscriptionPlan = rawPlan && validPlans.includes(rawPlan) ? rawPlan : null;

  return {
    profile,
    isLoading,
    subscriptionPlan,
    selectPlan,
    refetch,
  };
};
