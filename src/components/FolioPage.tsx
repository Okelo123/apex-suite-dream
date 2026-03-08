import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useMyBookings, useCancelBooking, useCreateBooking } from '@/hooks/useBookings';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useCreateReview } from '@/hooks/useReviews';
import { Trash2, CreditCard, Banknote, Smartphone, Star, X, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type PaymentMethod = Database['public']['Enums']['payment_method'];

export default function FolioPage() {
  const { user } = useAuth();
  const { cart, removeFromCart, clearCart } = useCart();
  const { data: myBookings = [], isLoading: bookingsLoading } = useMyBookings();
  const cancelBookingMutation = useCancelBooking();
  const createBookingMutation = useCreateBooking();
  const createTransactionMutation = useCreateTransaction();
  const createReviewMutation = useCreateReview();

  const [showPayment, setShowPayment] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('MPESA');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ ref: string; total: number; method: string } | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const total = cart.reduce((sum, c) => sum + c.item.price, 0);

  const handlePayment = async () => {
    if (!user) return;
    setProcessing(true);
    
    try {
      // Create transaction
      const tx = await createTransactionMutation.mutateAsync({
        amount: total,
        method: payMethod,
        items: cart.map(c => c.item.name),
      });

      // Create bookings
      await createBookingMutation.mutateAsync(
        cart.map(c => ({
          item_id: c.item.id,
          check_in: c.checkIn,
          check_out: c.checkOut,
          transaction_ref: tx.ref,
        }))
      );

      setReceipt({ ref: tx.ref, total: tx.amount, method: tx.method });
      clearCart();
      toast.success('Payment authorized successfully!');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
      setShowPayment(false);
    }
  };

  const handleReview = async () => {
    try {
      await createReviewMutation.mutateAsync({ rating, text: reviewText });
      setShowReview(false);
      setReceipt(null);
      setReviewText('');
      toast.success('Thank you for your review!');
    } catch (error) {
      toast.error('Failed to submit review.');
    }
  };

  const handleCancelBooking = async (bookingId: string, itemName: string) => {
    try {
      await cancelBookingMutation.mutateAsync(bookingId);
      toast.success(`Booking for ${itemName} cancelled.`);
    } catch (error) {
      toast.error('Failed to cancel booking.');
    }
  };

  const fmt = (n: number) => `KES ${n.toLocaleString()}`;

  const methods: { m: PaymentMethod; icon: typeof Smartphone; label: string }[] = [
    { m: 'MPESA', icon: Smartphone, label: 'M-PESA' },
    { m: 'CASH', icon: Banknote, label: 'Cash' },
    { m: 'VISA', icon: CreditCard, label: 'VISA' },
  ];

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h2 className="font-display text-3xl font-bold text-gradient-gold mb-2">Your Folio</h2>
      <p className="text-sm text-muted-foreground mb-6">Selected items for your stay.</p>

      {cart.length === 0 && !receipt ? (
        <div className="bg-gradient-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-sm">Your folio is empty. Explore our offerings to begin.</p>
        </div>
      ) : (
        <>
          {cart.map(c => (
            <div key={c.item.id} className="flex items-center gap-4 bg-gradient-card border border-border rounded-lg p-3 mb-3">
              <img src={c.item.image} alt={c.item.name} className="w-16 h-16 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-semibold text-foreground">{c.item.name}</p>
                <p className="text-xs text-muted-foreground">{c.item.category}</p>
                {c.checkIn && <p className="text-[10px] text-muted-foreground">{c.checkIn} → {c.checkOut}</p>}
              </div>
              <span className="text-primary font-semibold text-sm">{fmt(c.item.price)}</span>
              <button onClick={() => removeFromCart(c.item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {cart.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="font-display text-lg font-bold text-foreground">Total</span>
              <span className="font-display text-xl font-bold text-primary">{fmt(total)}</span>
            </div>
          )}

          {cart.length > 0 && (
            <button onClick={() => setShowPayment(true)}
              className="w-full mt-4 py-3 bg-gradient-gold text-primary-foreground font-semibold text-sm tracking-wider rounded hover:opacity-90 transition-opacity">
              PROCEED TO CHECKOUT
            </button>
          )}
        </>
      )}

      {/* My Bookings */}
      {user && myBookings.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3 flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" /> My Bookings
          </h3>
          {bookingsLoading ? (
            <div className="animate-pulse bg-gradient-card border border-border rounded-lg p-8" />
          ) : (
            <div className="space-y-2">
              {myBookings.map((b: any) => (
                <div key={b.id} className="flex items-center gap-4 bg-gradient-card border border-border rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-semibold text-foreground">{b.inventory?.name || 'Item'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {b.inventory?.category || 'Unknown'} • Ref: {b.transaction_ref}
                    </p>
                    {b.check_in && b.check_out && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{b.check_in} → {b.check_out}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCancelBooking(b.id, b.inventory?.name || 'Item')}
                    disabled={cancelBookingMutation.isPending}
                    className="px-3 py-1.5 text-xs tracking-wider border border-destructive text-destructive rounded hover:bg-destructive/10 transition-colors font-semibold disabled:opacity-50"
                  >
                    {cancelBookingMutation.isPending ? 'CANCELLING...' : 'CANCEL'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {receipt && !showReview && (
        <div className="mt-6 bg-gradient-card border border-primary/30 rounded-lg p-6 text-center space-y-3">
          <p className="text-xs text-primary tracking-widest">PAYMENT CONFIRMED</p>
          <p className="font-display text-2xl font-bold text-foreground">{fmt(receipt.total)}</p>
          <p className="text-xs text-muted-foreground">Ref: {receipt.ref} • Method: {receipt.method}</p>
          <button onClick={() => setShowReview(true)}
            className="mt-2 px-4 py-2 border border-primary rounded text-xs text-primary tracking-wider hover:bg-primary/10 transition-all">
            LEAVE A REVIEW
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">Payment</h3>
              <button onClick={() => setShowPayment(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground">Total: <span className="text-primary font-semibold">{fmt(total)}</span></p>
            <div className="grid grid-cols-3 gap-2">
              {methods.map(({ m, icon: Icon, label }) => (
                <button key={m} onClick={() => setPayMethod(m)}
                  className={`py-3 rounded border text-xs tracking-wider flex flex-col items-center gap-1 transition-all ${
                    payMethod === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                  }`}>
                  <Icon className="h-5 w-5" /> {label}
                </button>
              ))}
            </div>
            <button onClick={handlePayment} disabled={processing}
              className="w-full py-2.5 bg-gradient-gold text-primary-foreground font-semibold text-sm tracking-wider rounded hover:opacity-90 disabled:opacity-50 transition-opacity">
              {processing ? 'AUTHORIZING...' : 'AUTHORIZE PAYMENT'}
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">Your Review</h3>
              <button onClick={() => { setShowReview(false); setReceipt(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex gap-1 justify-center">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)}>
                  <Star className={`h-6 w-6 transition-colors ${s <= rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3} placeholder="Share your experience..."
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none" />
            <button onClick={handleReview}
              disabled={createReviewMutation.isPending}
              className="w-full py-2.5 bg-gradient-gold text-primary-foreground font-semibold text-sm tracking-wider rounded hover:opacity-90 disabled:opacity-50 transition-opacity">
              {createReviewMutation.isPending ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
