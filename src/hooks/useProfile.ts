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
    staleTime: 30000,
  });

  const selectPlan = async (plan: 'monthly' | '6month' | 'annual') => {
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

  return {
    profile,
    isLoading,
    subscriptionPlan: (profile as any)?.subscription_plan as string | null,
    selectPlan,
    refetch,
  };
};
