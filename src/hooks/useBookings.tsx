import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          inventory:item_id (
            name,
            category,
            price
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useMyBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          inventory:item_id (
            name,
            category,
            price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bookings: Array<{
      item_id: string;
      check_in?: string;
      check_out?: string;
      transaction_ref: string;
    }>) => {
      if (!user) throw new Error('Not authenticated');

      const bookingsWithUser = bookings.map(b => ({
        ...b,
        user_id: user.id,
        guest_name: user.email,
      }));

      const { error } = await supabase.from('bookings').insert(bookingsWithUser);
      if (error) throw error;

      // Update inventory status to occupied
      for (const booking of bookings) {
        await supabase
          .from('inventory')
          .update({ status: 'occupied' })
          .eq('id', booking.item_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      // Get the booking first to know which item to free up
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('item_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the booking
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (deleteError) throw deleteError;

      // Set inventory item back to available
      if (booking) {
        await supabase
          .from('inventory')
          .update({ status: 'available' })
          .eq('id', booking.item_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
