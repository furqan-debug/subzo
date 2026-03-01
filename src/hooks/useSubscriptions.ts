import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Subscription {
  id: string;
  user_id: string;
  catalog_id: string | null;
  name: string;
  logo_url: string | null;
  amount: number;
  billing_cycle: string;
  next_renewal: string;
  category: string;
  status: string;
  cancel_url: string | null;
  cancellation_steps: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
  default_price: number | null;
  billing_cycle: string | null;
  cancel_url: string | null;
  cancellation_steps: string[] | null;
  website_url: string | null;
}

export const useSubscriptions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('next_renewal', { ascending: true });
      if (error) throw error;
      return data as Subscription[];
    },
    enabled: !!user,
    staleTime: 30000,
  });
};

export const useCatalog = (search?: string) => {
  return useQuery({
    queryKey: ['catalog', search],
    queryFn: async () => {
      let query = supabase.from('subscription_catalog').select('*').order('name');
      if (search) query = query.ilike('name', `%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data as CatalogItem[];
    },
    staleTime: 30000,
  });
};

export const useAddSubscription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sub: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({ ...sub, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Subscription> & { id: string }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
};
