import { create } from 'zustand';

export type UserRole = 'guest' | 'staff' | 'admin';
export type ItemStatus = 'available' | 'occupied' | 'maintenance' | 'lockdown';
export type ItemCategory = 'suite' | 'dining' | 'event' | 'amenities';
export type PaymentMethod = 'MPESA' | 'CASH' | 'VISA';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  status: ItemStatus;
  image: string;
  description: string;
}

export interface CartItem {
  item: InventoryItem;
  checkIn?: string;
  checkOut?: string;
}

export interface Booking {
  id: string;
  itemId: string;
  itemName: string;
  category: ItemCategory;
  guestName: string;
  checkIn?: string;
  checkOut?: string;
  date: string;
  transactionRef: string;
}

export interface Transaction {
  id: string;
  ref: string;
  guestName: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  items: string[];
}

export interface Review {
  id: string;
  guestName: string;
  rating: number;
  text: string;
  createdAt: string;
}

interface AppState {
  user: User | null;
  isLockdown: boolean;
  cart: CartItem[];
  transactions: Transaction[];
  reviews: Review[];
  inventory: InventoryItem[];
  bookings: Booking[];
  
  login: (username: string, pin: string, role: UserRole) => boolean;
  register: (username: string, pin: string) => boolean;
  logout: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  processPayment: (method: PaymentMethod) => Transaction | null;
  addReview: (rating: number, text: string) => void;
  toggleLockdown: () => void;
  bookItem: (itemId: string) => void;
  setItemStatus: (itemId: string, status: ItemStatus) => void;
  cancelBooking: (bookingId: string) => void;
}

// Mock users
const mockUsers: Array<{ username: string; pin: string; role: UserRole }> = [
  { username: 'admin', pin: 'SUPER-LOGS', role: 'admin' },
  { username: 'staff', pin: '1234', role: 'staff' },
  { username: 'guest', pin: '0000', role: 'guest' },
];

const registeredUsers: Array<{ username: string; pin: string; role: UserRole }> = [...mockUsers];

import suiteImg from '@/assets/suite-royal.jpg';
import diningImg from '@/assets/dining.jpg';
import eventsImg from '@/assets/events.jpg';
import amenitiesImg from '@/assets/amenities.jpg';

const initialInventory: InventoryItem[] = [
  { id: 's1', name: 'Royal Suite', category: 'suite', price: 45000, status: 'available', image: suiteImg, description: 'Opulent suite with panoramic views, king bed, marble bathroom, and private balcony.' },
  { id: 's2', name: 'Imperial Suite', category: 'suite', price: 65000, status: 'available', image: suiteImg, description: 'The crown jewel — two bedrooms, grand salon, dining area, and butler service.' },
  { id: 's3', name: 'Garden Suite', category: 'suite', price: 35000, status: 'occupied', image: suiteImg, description: 'Ground-floor retreat opening onto private manicured gardens.' },
  { id: 's4', name: 'Terrace Suite', category: 'suite', price: 40000, status: 'maintenance', image: suiteImg, description: 'Elevated suite with wraparound terrace and sunset views.' },
  { id: 'd1', name: 'Sovereign Dinner', category: 'dining', price: 12000, status: 'available', image: diningImg, description: 'Seven-course fine dining experience with wine pairing.' },
  { id: 'd2', name: 'Champagne Brunch', category: 'dining', price: 8000, status: 'available', image: diningImg, description: 'Weekend brunch with unlimited champagne and live music.' },
  { id: 'd3', name: 'Private Chef Experience', category: 'dining', price: 25000, status: 'available', image: diningImg, description: 'Personal chef prepares a bespoke menu in your suite.' },
  { id: 'e1', name: 'Gala Evening', category: 'event', price: 150000, status: 'available', image: eventsImg, description: 'Black-tie gala in the Grand Ballroom for up to 200 guests.' },
  { id: 'e2', name: 'Garden Wedding', category: 'event', price: 250000, status: 'available', image: eventsImg, description: 'Intimate outdoor ceremony and reception in the estate gardens.' },
  { id: 'e3', name: 'Corporate Retreat', category: 'event', price: 100000, status: 'occupied', image: eventsImg, description: 'Full-day boardroom and team-building package.' },
  { id: 'a1', name: 'Spa & Wellness', category: 'amenities', price: 15000, status: 'available', image: amenitiesImg, description: 'Full-day spa access with massage, facial, and hydrotherapy.' },
  { id: 'a2', name: 'Infinity Pool', category: 'amenities', price: 5000, status: 'available', image: amenitiesImg, description: 'Heated infinity pool with panoramic estate views.' },
  { id: 'a3', name: 'Golf Course', category: 'amenities', price: 10000, status: 'available', image: amenitiesImg, description: '18-hole championship course with caddy service.' },
];

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLockdown: false,
  cart: [],
  transactions: [],
  reviews: [
    { id: 'r1', guestName: 'Lady Ashford', rating: 5, text: 'An unparalleled experience. The Royal Suite exceeded every expectation.', createdAt: '2026-02-15' },
    { id: 'r2', guestName: 'Mr. Nakamura', rating: 4, text: 'Exquisite dining. The private chef experience was unforgettable.', createdAt: '2026-02-20' },
  ],
  inventory: initialInventory,
  bookings: [
    { id: 'b1', itemId: 's3', itemName: 'Garden Suite', category: 'suite', guestName: 'Lady Ashford', checkIn: '2026-03-05', checkOut: '2026-03-10', date: '2026-03-04', transactionRef: 'MH-001' },
    { id: 'b2', itemId: 'e3', itemName: 'Corporate Retreat', category: 'event', guestName: 'Mr. Nakamura', checkIn: '2026-03-08', checkOut: '2026-03-08', date: '2026-03-01', transactionRef: 'MH-002' },
  ],

  login: (username, pin, role) => {
    const found = registeredUsers.find(u => u.username === username && u.pin === pin && u.role === role);
    if (found) {
      set({ user: { id: found.username, username: found.username, role: found.role } });
      return true;
    }
    return false;
  },

  register: (username, pin) => {
    if (registeredUsers.some(u => u.username === username)) return false;
    registeredUsers.push({ username, pin, role: 'guest' });
    set({ user: { id: username, username, role: 'guest' } });
    return true;
  },

  logout: () => set({ user: null, cart: [] }),

  addToCart: (cartItem) => set(s => ({ cart: [...s.cart, cartItem] })),
  
  removeFromCart: (itemId) => set(s => ({ cart: s.cart.filter(c => c.item.id !== itemId) })),
  
  clearCart: () => set({ cart: [] }),

  processPayment: (method) => {
    const { cart, user } = get();
    if (!cart.length || !user) return null;
    const total = cart.reduce((sum, c) => sum + c.item.price, 0);
    const ref = `MH-${Date.now().toString(36).toUpperCase()}`;
    const tx: Transaction = {
      id: ref,
      ref,
      guestName: user.username,
      amount: total,
      method,
      date: new Date().toISOString(),
      items: cart.map(c => c.item.name),
    };
    // Mark items as occupied and create bookings
    const newBookings: Booking[] = cart.map(c => ({
      id: `b${Date.now()}-${c.item.id}`,
      itemId: c.item.id,
      itemName: c.item.name,
      category: c.item.category,
      guestName: user.username,
      checkIn: c.checkIn,
      checkOut: c.checkOut,
      date: new Date().toISOString().split('T')[0],
      transactionRef: ref,
    }));
    set(s => ({
      transactions: [...s.transactions, tx],
      bookings: [...s.bookings, ...newBookings],
      cart: [],
      inventory: s.inventory.map(item =>
        cart.some(c => c.item.id === item.id) ? { ...item, status: 'occupied' as ItemStatus } : item
      ),
    }));
    return tx;
  },

  addReview: (rating, text) => {
    const { user } = get();
    if (!user) return;
    set(s => ({
      reviews: [...s.reviews, {
        id: `r${Date.now()}`,
        guestName: user.username,
        rating,
        text,
        createdAt: new Date().toISOString().split('T')[0],
      }],
    }));
  },

  toggleLockdown: () => set(s => {
    const newState = !s.isLockdown;
    return {
      isLockdown: newState,
      inventory: s.inventory.map(item => ({
        ...item,
        status: newState ? 'lockdown' as ItemStatus : 'available' as ItemStatus,
      })),
    };
  }),

  bookItem: (itemId) => set(s => ({
    inventory: s.inventory.map(item =>
      item.id === itemId ? { ...item, status: 'occupied' as ItemStatus } : item
    ),
  })),

  setItemStatus: (itemId, status) => set(s => ({
    inventory: s.inventory.map(item =>
      item.id === itemId ? { ...item, status } : item
    ),
  })),

  cancelBooking: (bookingId) => set(s => {
    const booking = s.bookings.find(b => b.id === bookingId);
    return {
      bookings: s.bookings.filter(b => b.id !== bookingId),
      inventory: booking
        ? s.inventory.map(item =>
            item.id === booking.itemId ? { ...item, status: 'available' as ItemStatus } : item
          )
        : s.inventory,
    };
  }),
}));
