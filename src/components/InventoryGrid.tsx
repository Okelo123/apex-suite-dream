import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Check, X, Wrench, Lock, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ItemCategory = Database['public']['Enums']['item_category'];
type ItemStatus = Database['public']['Enums']['item_status'];
type InventoryItem = Database['public']['Tables']['inventory']['Row'];

const statusConfig: Record<ItemStatus, { label: string; color: string; icon: typeof Check }> = {
  available: { label: 'Available', color: 'bg-emerald', icon: Check },
  occupied: { label: 'Occupied', color: 'bg-destructive', icon: X },
  maintenance: { label: 'Maintenance', color: 'bg-accent', icon: Wrench },
  lockdown: { label: 'Lockdown', color: 'bg-lockdown', icon: Lock },
};

interface Props {
  category: ItemCategory;
  title: string;
  subtitle: string;
}

export default function InventoryGrid({ category, title, subtitle }: Props) {
  const { data: inventory = [], isLoading } = useInventory();
  const { cart, addToCart } = useCart();
  const { user } = useAuth();
  const items = inventory.filter(i => i.category === category);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const needsDates = category === 'suite' || category === 'event';

  const handleAcquire = (item: InventoryItem) => {
    if (item.status !== 'available') {
      toast.error(`${item.name} is currently ${item.status}.`);
      return;
    }
    if (cart.some(c => c.item.id === item.id)) {
      toast.info('Already in your folio.');
      return;
    }
    if (needsDates && (!checkIn || !checkOut)) {
      toast.error('Please select check-in and check-out dates.');
      return;
    }
    addToCart({ item, checkIn: checkIn || undefined, checkOut: checkOut || undefined });
    toast.success(`${item.name} added to your folio.`);
    setSelectedItem(null);
    setCheckIn('');
    setCheckOut('');
  };

  const formatPrice = (price: number) =>
    `KES ${price.toLocaleString()}`;

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="font-display text-3xl font-bold text-gradient-gold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gradient-card border border-border rounded-lg h-72 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="font-display text-3xl font-bold text-gradient-gold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const status = statusConfig[item.status];
          const StatusIcon = status.icon;
          const inCart = cart.some(c => c.item.id === item.id);

          return (
            <div
              key={item.id}
              className="group bg-gradient-card border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-gold"
            >
              <div className="relative h-44 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2">
                  <span className={`${status.color} text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-foreground`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>
                {inCart && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3" /> In Folio
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">{item.name}</h3>
                  <span className="text-primary font-semibold text-sm whitespace-nowrap ml-2">{formatPrice(item.price)}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>

                {selectedItem?.id === item.id && needsDates && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase">Check In</label>
                      <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                        className="w-full bg-secondary border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase">Check Out</label>
                      <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                        className="w-full bg-secondary border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                )}

                {user && (
                  <button
                    onClick={() => {
                      if (needsDates && selectedItem?.id !== item.id) {
                        setSelectedItem(item);
                      } else {
                        handleAcquire(item);
                      }
                    }}
                    disabled={item.status !== 'available' || inCart}
                    className="w-full mt-2 py-2 text-xs tracking-widest font-semibold rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-gold text-primary-foreground hover:opacity-90"
                  >
                    {inCart ? 'IN FOLIO' : item.status !== 'available' ? item.status.toUpperCase() : needsDates && selectedItem?.id !== item.id ? 'SELECT DATES' : 'ACQUIRE'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
