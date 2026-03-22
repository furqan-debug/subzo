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
  discount_percentage: number | null;
  discount_end_date: string | null;
  trial_end_date: string | null;
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
  });
};

// Popularity sort priority — higher = shown first in catalog
const POPULARITY_RANK: Record<string, number> = {
  'Netflix': 1, 'Spotify': 2, 'YouTube Premium': 3, 'Amazon Prime': 4,
  'Disney+': 5, 'Apple Music': 6, 'HBO Max': 7, 'ChatGPT Plus': 8,
  'Claude Pro': 9, 'Google One': 10, 'iCloud+': 11, 'Adobe Creative Cloud': 12,
  'Microsoft 365': 13, 'Hulu': 14, 'Paramount+': 15, 'Apple TV+': 16,
  'Notion': 17, 'Slack': 18, 'Zoom': 19, 'GitHub': 20,
  'Figma': 21, 'Dropbox': 22, 'NordVPN': 23, 'Crunchyroll': 24,
  'PlayStation Plus': 25,
};

export const useCatalog = (search?: string) => {
  return useQuery({
    queryKey: ['catalog', search],
    queryFn: async () => {
      // No server-side order needed; we sort client-side by popularity rank
      let query = supabase.from('subscription_catalog').select('*');
      if (search) query = query.ilike('name', `%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      const items = data as CatalogItem[];
      return items.sort((a, b) => {
        const rankA = POPULARITY_RANK[a.name] ?? 999;
        const rankB = POPULARITY_RANK[b.name] ?? 999;
        if (rankA !== rankB) return rankA - rankB;
        return a.name.localeCompare(b.name);
      });
    },
    staleTime: 5 * 60 * 1000,
    gcTime: Infinity, // catalog data is static — keep it forever
  });
};

export const useAddSubscription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sub: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({ ...sub, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, _vars, _ctx) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
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
