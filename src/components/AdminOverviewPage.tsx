import { useState } from 'react';
import { useInventory, useUpdateItemStatus } from '@/hooks/useInventory';
import { useBookings, useCancelBooking } from '@/hooks/useBookings';
import { useTransactions } from '@/hooks/useTransactions';
import { Check, X, Wrench, Lock, User, Crown, UtensilsCrossed, CalendarDays, Gem, Trash2, ChevronDown, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ItemCategory = Database['public']['Enums']['item_category'];
type ItemStatus = Database['public']['Enums']['item_status'];

const categoryConfig: Record<ItemCategory, { label: string; icon: typeof Crown }> = {
  suite: { label: 'Suites', icon: Crown },
  dining: { label: 'Dining', icon: UtensilsCrossed },
  event: { label: 'Events', icon: CalendarDays },
  amenities: { label: 'Amenities', icon: Gem },
};

const statusIcons = {
  available: Check,
  occupied: X,
  maintenance: Wrench,
  lockdown: Lock,
};

const statusColors: Record<string, string> = {
  available: 'text-emerald',
  occupied: 'text-destructive',
  maintenance: 'text-accent',
  lockdown: 'text-lockdown',
};

const allStatuses: ItemStatus[] = ['available', 'occupied', 'maintenance', 'lockdown'];

export default function AdminOverviewPage() {
  const { data: inventory = [], isLoading: inventoryLoading } = useInventory();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const updateStatusMutation = useUpdateItemStatus();
  const cancelBookingMutation = useCancelBooking();

  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);

  const handleRefund = async (transactionRef: string, amount: number) => {
    if (!confirm(`Process refund of KES ${amount.toLocaleString()} for ref ${transactionRef}?`)) return;
    setRefunding(transactionRef);
    try {
      // Simulate refund processing
      await new Promise(r => setTimeout(r, 1500));
      toast.success(`Refund of KES ${amount.toLocaleString()} processed for ${transactionRef}`);
    } catch (err: any) {
      toast.error(err.message || 'Refund failed');
    } finally {
      setRefunding(null);
    }
  };
  const categories: (ItemCategory | 'all')[] = ['all', 'suite', 'dining', 'event', 'amenities'];
  const filtered = activeCategory === 'all' ? inventory : inventory.filter(i => i.category === activeCategory);

  const getBookingForItem = (itemId: string) => bookings.find((b: any) => b.item_id === itemId);

  const totalBooked = inventory.filter(i => i.status === 'occupied').length;
  const totalAvailable = inventory.filter(i => i.status === 'available').length;
  const totalMaintenance = inventory.filter(i => i.status === 'maintenance').length;

  const handleStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ itemId, status: newStatus });
      setStatusDropdown(null);
      toast.success(`Status updated to ${newStatus}.`);
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const handleCancelBooking = async (bookingId: string, itemName: string) => {
    try {
      await cancelBookingMutation.mutateAsync(bookingId);
      toast.success(`Booking for ${itemName} cancelled. Item is now available.`);
    } catch (error) {
      toast.error('Failed to cancel booking.');
    }
  };

  if (inventoryLoading) {
    return <div className="animate-pulse text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-display text-3xl font-bold text-gradient-gold">Admin Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-display font-bold text-emerald">{totalAvailable}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Available</p>
        </div>
        <div className="bg-gradient-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-display font-bold text-destructive">{totalBooked}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Booked</p>
        </div>
        <div className="bg-gradient-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-display font-bold text-accent">{totalMaintenance}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Maintenance</p>
        </div>
        <div className="bg-gradient-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-display font-bold text-primary">{inventory.length}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Total Items</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded text-xs tracking-wider whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            {cat === 'all' ? 'All' : categoryConfig[cat].label}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-2 px-2">Item</th>
              <th className="text-left py-2 px-2">Category</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-right py-2 px-2">Price (KES)</th>
              <th className="text-left py-2 px-2">Guest</th>
              <th className="text-left py-2 px-2">Check In</th>
              <th className="text-left py-2 px-2">Check Out</th>
              <th className="text-left py-2 px-2">Ref</th>
              <th className="text-center py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const booking: any = getBookingForItem(item.id);
              const StatusIcon = statusIcons[item.status];
              const CatIcon = categoryConfig[item.category].icon;

              return (
                <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                      <span className="font-semibold text-foreground">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CatIcon className="h-3 w-3" />
                      {categoryConfig[item.category].label}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="relative">
                      <button
                        onClick={() => setStatusDropdown(statusDropdown === item.id ? null : item.id)}
                        className={`flex items-center gap-1 font-semibold ${statusColors[item.status]} hover:opacity-80 transition-opacity`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                      </button>
                      {statusDropdown === item.id && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[130px]">
                          {allStatuses.map(s => {
                            const SIcon = statusIcons[s];
                            return (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(item.id, s)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-secondary/50 transition-colors ${
                                  item.status === s ? 'text-primary font-bold' : 'text-foreground'
                                }`}
                              >
                                <SIcon className={`h-3 w-3 ${statusColors[s]}`} />
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right text-foreground">{item.price.toLocaleString()}</td>
                  <td className="py-3 px-2">
                    {booking ? (
                      <span className="flex items-center gap-1 text-primary font-semibold">
                        <User className="h-3 w-3" />
                        {booking.guest_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{booking?.check_in || '—'}</td>
                  <td className="py-3 px-2 text-muted-foreground">{booking?.check_out || '—'}</td>
                  <td className="py-3 px-2 text-primary">{booking?.transaction_ref || '—'}</td>
                  <td className="py-3 px-2 text-center">
                    {booking && (
                      <button
                        onClick={() => handleCancelBooking(booking.id, booking.inventory?.name || item.name)}
                        className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded hover:bg-destructive/10"
                        title="Cancel booking"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* All Bookings */}
      <div>
        <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">All Bookings</h3>
        {bookingsLoading ? (
          <div className="animate-pulse bg-gradient-card border border-border rounded-lg p-8" />
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b: any) => (
              <div key={b.id} className="bg-gradient-card border border-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.inventory?.name || 'Item'}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {b.inventory?.category ? categoryConfig[b.inventory.category as ItemCategory].label : 'Unknown'} • Ref: {b.transaction_ref}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary flex items-center gap-1 justify-end">
                      <User className="h-3 w-3" />
                      {b.guest_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {b.check_in && b.check_out ? `${b.check_in} → ${b.check_out}` : `Booked: ${new Date(b.created_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelBooking(b.id, b.inventory?.name || 'Item')}
                    className="text-destructive hover:text-destructive/80 transition-colors p-1.5 rounded hover:bg-destructive/10"
                    title="Cancel booking"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Summary */}
      <div>
        <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Transaction Summary</h3>
        {transactionsLoading ? (
          <div className="animate-pulse bg-gradient-card border border-border rounded-lg p-8" />
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-2">Ref</th>
                  <th className="text-left py-2">Guest</th>
                  <th className="text-left py-2">Items</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-left py-2 px-2">Method</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-center py-2 px-2">Refund</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => (
                  <tr key={t.id} className="border-b border-border/50 text-foreground">
                    <td className="py-2 px-2 text-primary">{t.ref}</td>
                    <td className="py-2">{t.guest_name}</td>
                    <td className="py-2 text-muted-foreground">{t.items.join(', ')}</td>
                    <td className="py-2 text-right">KES {t.amount.toLocaleString()}</td>
                    <td className="py-2 px-2">{t.method}</td>
                    <td className="py-2 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleRefund(t.ref, t.amount)}
                        disabled={refunding === t.ref}
                        className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded hover:bg-destructive/10 disabled:opacity-50"
                        title="Process refund"
                      >
                        <RotateCcw className={`h-3.5 w-3.5 ${refunding === t.ref ? 'animate-spin' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
