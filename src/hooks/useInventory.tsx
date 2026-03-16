import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type InventoryItem = Database['public']['Tables']['inventory']['Row'];
type ItemStatus = Database['public']['Enums']['item_status'];

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: ItemStatus }) => {
      const { error } = await supabase
        .from('inventory')
        .update({ status })
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useToggleLockdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lockdown: boolean) => {
      if (lockdown) {
        // Set all non-maintenance items to lockdown
        const { error } = await supabase
          .from('inventory')
          .update({ status: 'lockdown' as ItemStatus })
          .neq('status', 'maintenance');
        if (error) throw error;
      } else {
        // Restore all lockdown items to available
        const { error } = await supabase
          .from('inventory')
          .update({ status: 'available' as ItemStatus })
          .eq('status', 'lockdown');
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
