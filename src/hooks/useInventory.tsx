import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type InventoryItem = Database['public']['Tables']['inventory']['Row'];
type ItemStatus = Database['public']['Enums']['item_status'];

// Map database images to local assets
import suiteImg from '@/assets/suite-royal.jpg';
import diningImg from '@/assets/dining.jpg';
import eventsImg from '@/assets/events.jpg';
import amenitiesImg from '@/assets/amenities.jpg';

const imageMap: Record<string, string> = {
  '/assets/suite-royal.jpg': suiteImg,
  '/assets/dining.jpg': diningImg,
  '/assets/events.jpg': eventsImg,
  '/assets/amenities.jpg': amenitiesImg,
};

const mapImage = (item: InventoryItem): InventoryItem => ({
  ...item,
  image: imageMap[item.image] || item.image,
});

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data || []).map(mapImage);
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
      const newStatus: ItemStatus = lockdown ? 'lockdown' : 'available';
      const { error } = await supabase
        .from('inventory')
        .update({ status: newStatus });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
