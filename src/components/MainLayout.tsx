import { ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Crown, UtensilsCrossed, CalendarDays, Gem, MessageSquare, ShoppingBag, Users, Shield, LogOut, Menu, X, Landmark, LayoutDashboard, UserCog } from 'lucide-react';

type Page = 'legacy' | 'suites' | 'dining' | 'events' | 'amenities' | 'contact' | 'folio' | 'frontoffice' | 'backoffice' | 'adminoverview' | 'users';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

const guestNav: { page: Page; label: string; icon: typeof Crown }[] = [
  { page: 'legacy', label: 'Legacy', icon: Landmark },
  { page: 'suites', label: 'Suites', icon: Crown },
  { page: 'dining', label: 'Dining', icon: UtensilsCrossed },
  { page: 'events', label: 'Events', icon: CalendarDays },
  { page: 'amenities', label: 'Amenities', icon: Gem },
  { page: 'contact', label: 'Contact', icon: MessageSquare },
  { page: 'folio', label: 'Folio', icon: ShoppingBag },
];

export default function MainLayout({ currentPage, onNavigate, children }: Props) {
  const { user, signOut } = useAuth();
  const { cart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-logout after 10 minutes of inactivity
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      signOut();
    }, INACTIVITY_TIMEOUT);
  }, [signOut]);

  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);

  if (!user) return null;

  const navItems = [...guestNav];
  if (user.role === 'staff' || user.role === 'admin') {
    navItems.push({ page: 'frontoffice', label: 'Front Office', icon: Users });
  }
  if (user.role === 'admin') {
    navItems.push({ page: 'adminoverview', label: 'Overview', icon: LayoutDashboard });
    navItems.push({ page: 'backoffice', label: 'Back Office', icon: Shield });
    navItems.push({ page: 'users', label: 'Users', icon: UserCog });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <button onClick={() => onNavigate('legacy')} className="font-display text-lg font-bold text-gradient-gold tracking-wider">
            MILESHI HORIZON
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs tracking-wider transition-all ${
                  currentPage === page
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {page === 'folio' && cart.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-muted-foreground">
              {user.email} <span className="text-primary">({user.role})</span>
            </span>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card p-4 space-y-1">
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                onClick={() => { onNavigate(page); setMobileOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm tracking-wider transition-all ${
                  currentPage === page ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {page === 'folio' && cart.length > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
