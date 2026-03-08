import { create } from 'zustand';
import type { Database } from '@/integrations/supabase/types';

type InventoryItem = Database['public']['Tables']['inventory']['Row'];

export interface CartItem {
  item: InventoryItem;
  checkIn?: string;
  checkOut?: string;
}

interface CartState {
  cart: CartItem[];
  addToCart: (cartItem: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>((set) => ({
  cart: [],
  addToCart: (cartItem) => set((s) => ({ cart: [...s.cart, cartItem] })),
  removeFromCart: (itemId) => set((s) => ({ cart: s.cart.filter((c) => c.item.id !== itemId) })),
  clearCart: () => set({ cart: [] }),
}));
