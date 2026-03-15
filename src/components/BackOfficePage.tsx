import { useState } from 'react';
import { useInventory, useToggleLockdown } from '@/hooks/useInventory';
import { useTransactions } from '@/hooks/useTransactions';
import { useBookings } from '@/hooks/useBookings';
import { TrendingUp, Home, DollarSign, AlertTriangle, ShieldOff, Shield, Download } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'revenue' | 'channel' | 'tax' | 'audit' | 'templates' | 'lockdown';

export default function BackOfficePage() {
  const { data: inventory = [] } = useInventory();
  const { data: transactions = [] } = useTransactions();
  const { data: bookings = [] } = useBookings();
  const toggleLockdownMutation = useToggleLockdown();

  const [activeTab, setActiveTab] = useState<Tab>('revenue');
  const [vatRate, setVatRate] = useState('16');
  const [ledgerAccounts, setLedgerAccounts] = useState('Revenue\nExpenses\nAssets\nLiabilities');
  const [bookingTemplate, setBookingTemplate] = useState('Dear {guest_name},\n\nYour booking at Mileshi Horizon has been confirmed.\nRef: {ref}\n\nWe look forward to welcoming you.\n\nWarm regards,\nMileshi Horizon');
  const [dynamicPricing, setDynamicPricing] = useState('15');
  const [overrideScanning, setOverrideScanning] = useState(false);
  
  const isLockdown = inventory.some(i => i.status === 'lockdown');

  const totalRevenue = transactions.reduce((s, t: any) => s + t.amount, 0);
  const totalSuites = inventory.filter(i => i.category === 'suite').length;
  const occupied = inventory.filter(i => i.category === 'suite' && i.status === 'occupied').length;
  const occupancyRate = totalSuites > 0 ? Math.round((occupied / totalSuites) * 100) : 0;
  const popularRoom = transactions.length
    ? transactions.flatMap((t: any) => t.items).reduce((acc: any, item: string) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};
  const topRoom = Object.entries(popularRoom).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleRevenueReport = () => {
    if (transactions.length === 0) { toast.error('No transactions to export.'); return; }
    downloadCSV('revenue-report.csv',
      ['Ref', 'Guest', 'Amount (KES)', 'Method', 'Items', 'Date'],
      transactions.map((t: any) => [t.ref, t.guest_name, String(t.amount), t.method, t.items.join('; '), new Date(t.created_at).toLocaleDateString()])
    );
    toast.success('Revenue report downloaded.');
  };

  const handleOccupancyReport = () => {
    if (inventory.length === 0) { toast.error('No inventory data.'); return; }
    const suites = inventory.filter(i => i.category === 'suite');
    const occ = suites.filter(i => i.status === 'occupied').length;
    const avail = suites.filter(i => i.status === 'available').length;
    const maint = suites.filter(i => i.status === 'maintenance').length;
    const rows = [
      ['Total Suites', String(suites.length), '', '', ''],
      ['Occupied', String(occ), `${suites.length > 0 ? Math.round((occ / suites.length) * 100) : 0}%`, '', ''],
      ['Available', String(avail), '', '', ''],
      ['Maintenance', String(maint), '', '', ''],
      ['', '', '', '', ''],
      ['Suite Name', 'Status', 'Price (KES)', 'Guest', 'Booking Ref'],
      ...suites.map(s => {
        const booking: any = bookings.find((b: any) => b.item_id === s.id);
        return [s.name, s.status, String(s.price), booking?.guest_name || '—', booking?.transaction_ref || '—'];
      }),
    ];
    downloadCSV('occupancy-report.csv', ['Metric', 'Value', 'Rate', '', ''], rows);
    toast.success('Occupancy report downloaded.');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'revenue', label: 'Revenue' },
    { id: 'channel', label: 'Channel Mgr' },
    { id: 'tax', label: 'Tax & Ledger' },
    { id: 'audit', label: 'Audit Logs' },
    { id: 'templates', label: 'Templates' },
    { id: 'lockdown', label: 'Lockdown' },
  ];

  const auditLogs = [
    { time: '2026-03-08 09:15', user: 'admin', action: 'Logged in' },
    { time: '2026-03-08 09:20', user: 'admin', action: 'Updated dynamic pricing to 15%' },
    { time: '2026-03-07 18:30', user: 'staff', action: 'Checked in Lady Ashford — Royal Suite' },
    { time: '2026-03-07 14:00', user: 'admin', action: 'Created staff account "concierge1"' },
    { time: '2026-03-06 10:00', user: 'admin', action: 'System maintenance completed' },
  ];

  const handleLockdown = async () => {
    if (isLockdown) {
      setOverrideScanning(true);
      setTimeout(async () => {
        try {
          await toggleLockdownMutation.mutateAsync(false);
          toast.success('Lockdown lifted. Normal operations resumed.');
        } catch (error) {
          toast.error('Failed to lift lockdown.');
        }
        setOverrideScanning(false);
      }, 3000);
    } else {
      try {
        await toggleLockdownMutation.mutateAsync(true);
        toast.error('LOCKDOWN INITIATED — All areas secured.');
      } catch (error) {
        toast.error('Failed to initiate lockdown.');
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-display text-3xl font-bold text-gradient-gold">Back Office</h2>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded text-xs tracking-wider whitespace-nowrap transition-all ${
              activeTab === t.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Revenue */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="flex gap-2 justify-end">
            <button onClick={handleRevenueReport} className="flex items-center gap-1.5 px-3 py-1.5 border border-primary rounded text-xs text-primary tracking-wider hover:bg-primary/10 transition-all">
              <Download className="h-3.5 w-3.5" /> Revenue Report
            </button>
            <button onClick={handleOccupancyReport} className="flex items-center gap-1.5 px-3 py-1.5 border border-primary rounded text-xs text-primary tracking-wider hover:bg-primary/10 transition-all">
              <Download className="h-3.5 w-3.5" /> Occupancy Report
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs"><DollarSign className="h-4 w-4" /> Total Revenue</div>
              <p className="font-display text-2xl font-bold text-primary mt-1">KES {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs"><Home className="h-4 w-4" /> Occupancy Rate</div>
              <p className="font-display text-2xl font-bold text-primary mt-1">{occupancyRate}%</p>
            </div>
            <div className="bg-gradient-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs"><TrendingUp className="h-4 w-4" /> Most Popular</div>
              <p className="font-display text-lg font-bold text-primary mt-1">{topRoom}</p>
            </div>
          </div>

          <div className="bg-gradient-card border border-border rounded-lg p-4">
            <h4 className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Dynamic Pricing</h4>
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground">Increase rates by</span>
              <input value={dynamicPricing} onChange={e => setDynamicPricing(e.target.value)}
                className="w-16 bg-secondary border border-border rounded px-2 py-1 text-sm text-foreground text-center focus:outline-none focus:border-primary" />
              <span className="text-sm text-foreground">% when occupancy {'>'} 90%</span>
              <button onClick={() => toast.success('Pricing rule saved.')}
                className="ml-auto px-3 py-1 bg-gradient-gold text-primary-foreground text-xs rounded font-semibold">SAVE</button>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Transaction Ledger</h4>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-2 px-2">Ref</th><th className="text-left py-2">Guest</th><th className="text-right py-2">Amount</th><th className="text-left py-2 px-2">Method</th><th className="text-left py-2">Date</th>
                  </tr></thead>
                  <tbody>
                    {transactions.map((t: any) => (
                      <tr key={t.id} className="border-b border-border/50 text-foreground">
                        <td className="py-2 px-2 text-primary">{t.ref}</td>
                        <td className="py-2">{t.guest_name}</td>
                        <td className="py-2 text-right">KES {t.amount.toLocaleString()}</td>
                        <td className="py-2 px-2">{t.method}</td>
                        <td className="py-2 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Channel Manager */}
      {activeTab === 'channel' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Simulate syncing availability with external channels.</p>
          {['Airbnb', 'Expedia', 'Booking.com'].map(ch => (
            <div key={ch} className="flex items-center justify-between bg-gradient-card border border-border rounded-lg p-4">
              <span className="text-sm text-foreground font-semibold">{ch}</span>
              <button onClick={() => toast.success(`${ch} synced successfully.`)}
                className="px-3 py-1 border border-primary rounded text-xs text-primary tracking-wider hover:bg-primary/10 transition-all">
                SYNC NOW
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tax & Ledger */}
      {activeTab === 'tax' && (
        <div className="space-y-4">
          <div className="bg-gradient-card border border-border rounded-lg p-4 space-y-3">
            <h4 className="text-xs tracking-widest uppercase text-muted-foreground">VAT Rate</h4>
            <div className="flex items-center gap-2">
              <input value={vatRate} onChange={e => setVatRate(e.target.value)}
                className="w-20 bg-secondary border border-border rounded px-2 py-1 text-sm text-foreground text-center focus:outline-none focus:border-primary" />
              <span className="text-sm text-foreground">%</span>
              <button onClick={() => toast.success('VAT rate updated.')} className="ml-auto px-3 py-1 bg-gradient-gold text-primary-foreground text-xs rounded font-semibold">SAVE</button>
            </div>
          </div>
          <div className="bg-gradient-card border border-border rounded-lg p-4 space-y-3">
            <h4 className="text-xs tracking-widest uppercase text-muted-foreground">General Ledger Accounts</h4>
            <textarea value={ledgerAccounts} onChange={e => setLedgerAccounts(e.target.value)} rows={4}
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none" />
            <button onClick={() => toast.success('Ledger accounts updated.')} className="px-3 py-1 bg-gradient-gold text-primary-foreground text-xs rounded font-semibold">SAVE</button>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {auditLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-3 bg-gradient-card border border-border rounded p-3">
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{log.time}</span>
              <span className="text-xs text-primary font-semibold">{log.user}</span>
              <span className="text-xs text-foreground">{log.action}</span>
            </div>
          ))}
        </div>
      )}

      {/* Email Templates */}
      {activeTab === 'templates' && (
        <div className="bg-gradient-card border border-border rounded-lg p-4 space-y-3">
          <h4 className="text-xs tracking-widest uppercase text-muted-foreground">Booking Confirmation Template</h4>
          <textarea value={bookingTemplate} onChange={e => setBookingTemplate(e.target.value)} rows={8}
            className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary resize-none" />
          <button onClick={() => toast.success('Template saved.')} className="px-3 py-1 bg-gradient-gold text-primary-foreground text-xs rounded font-semibold">SAVE TEMPLATE</button>
        </div>
      )}

      {/* Lockdown */}
      {activeTab === 'lockdown' && (
        <div className="space-y-4">
          <div className={`bg-gradient-card border rounded-lg p-6 text-center space-y-4 ${isLockdown ? 'border-destructive' : 'border-border'}`}>
            {isLockdown ? (
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive animate-pulse" />
            ) : (
              <Shield className="mx-auto h-12 w-12 text-emerald" />
            )}
            <p className="font-display text-xl font-bold text-foreground">
              {isLockdown ? 'LOCKDOWN ACTIVE' : 'System Secure'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isLockdown ? 'All areas are currently secured. Only admin can lift the lockdown.' : 'No active emergencies. System operating normally.'}
            </p>
            {overrideScanning ? (
              <div className="space-y-2">
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)' }} />
                </div>
                <p className="text-xs text-primary tracking-widest">OVERRIDE SCANNER ACTIVE...</p>
              </div>
            ) : (
              <button onClick={handleLockdown}
                disabled={toggleLockdownMutation.isPending}
                className={`px-6 py-2 rounded text-sm tracking-wider font-semibold transition-all disabled:opacity-50 ${
                  isLockdown
                    ? 'bg-emerald text-foreground hover:opacity-90'
                    : 'bg-destructive text-destructive-foreground hover:opacity-90'
                }`}>
                {isLockdown ? 'LIFT LOCKDOWN' : 'INITIATE LOCKDOWN'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Evacuation Modal */}
      {isLockdown && !overrideScanning && activeTab !== 'lockdown' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="bg-card border-2 border-destructive rounded-lg p-8 max-w-sm mx-4 text-center space-y-4">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive animate-pulse" />
            <h3 className="font-display text-2xl font-bold text-destructive">EVACUATION</h3>
            <p className="text-sm text-foreground">Follow emergency procedures. Proceed to designated assembly points immediately.</p>
            <button onClick={() => setActiveTab('lockdown')} className="px-4 py-2 border border-destructive text-destructive rounded text-xs tracking-wider hover:bg-destructive/10">
              GO TO LOCKDOWN CONTROLS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
