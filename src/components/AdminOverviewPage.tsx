import { useState } from 'react';
import { useAppStore, ItemCategory } from '@/lib/store';
import { Check, X, Wrench, Lock, User, Crown, UtensilsCrossed, CalendarDays, Gem } from 'lucide-react';

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

export default function AdminOverviewPage() {
  const { inventory, bookings, transactions } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');

  const categories: (ItemCategory | 'all')[] = ['all', 'suite', 'dining', 'event', 'amenities'];
  const filtered = activeCategory === 'all' ? inventory : inventory.filter(i => i.category === activeCategory);

  const getBookingForItem = (itemId: string) => bookings.find(b => b.itemId === itemId);

  const totalBooked = inventory.filter(i => i.status === 'occupied').length;
  const totalAvailable = inventory.filter(i => i.status === 'available').length;
  const totalMaintenance = inventory.filter(i => i.status === 'maintenance').length;

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
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const booking = getBookingForItem(item.id);
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
                    <span className={`flex items-center gap-1 font-semibold ${statusColors[item.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-foreground">{item.price.toLocaleString()}</td>
                  <td className="py-3 px-2">
                    {booking ? (
                      <span className="flex items-center gap-1 text-primary font-semibold">
                        <User className="h-3 w-3" />
                        {booking.guestName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{booking?.checkIn || '—'}</td>
                  <td className="py-3 px-2 text-muted-foreground">{booking?.checkOut || '—'}</td>
                  <td className="py-3 px-2 text-primary">{booking?.transactionRef || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent Bookings */}
      <div>
        <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">All Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {bookings.map(b => (
              <div key={b.id} className="bg-gradient-card border border-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.itemName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {categoryConfig[b.category].label} • Ref: {b.transactionRef}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary flex items-center gap-1 justify-end">
                    <User className="h-3 w-3" />
                    {b.guestName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {b.checkIn && b.checkOut ? `${b.checkIn} → ${b.checkOut}` : `Booked: ${b.date}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Summary */}
      <div>
        <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Transaction Summary</h3>
        {transactions.length === 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="border-b border-border/50 text-foreground">
                    <td className="py-2 px-2 text-primary">{t.ref}</td>
                    <td className="py-2">{t.guestName}</td>
                    <td className="py-2 text-muted-foreground">{t.items.join(', ')}</td>
                    <td className="py-2 text-right">KES {t.amount.toLocaleString()}</td>
                    <td className="py-2 px-2">{t.method}</td>
                    <td className="py-2 text-muted-foreground">{new Date(t.date).toLocaleDateString()}</td>
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
