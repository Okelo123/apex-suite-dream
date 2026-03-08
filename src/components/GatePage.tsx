import { useState } from 'react';
import { Crown, Users, Shield, UserPlus, Eye, EyeOff, Fingerprint, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import heroImg from '@/assets/hero-estate.jpg';
import { toast } from 'sonner';

type GateView = 'select' | 'login' | 'register' | 'biometric' | 'forgot' | 'resetSent';

const roles = [
  { role: 'guest' as const, label: 'GUEST', icon: Crown, desc: 'Explore & book our exclusive offerings' },
  { role: 'staff' as const, label: 'STAFF', icon: Users, desc: 'Front office operations' },
  { role: 'admin' as const, label: 'ADMIN', icon: Shield, desc: 'Back office management' },
];

export default function GatePage() {
  const [view, setView] = useState<GateView>('select');
  const [selectedRole, setSelectedRole] = useState<'guest' | 'staff' | 'admin'>('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [bioLoading, setBioLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }
    
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    
    if (error) {
      setError(error.message || 'Invalid credentials. Please try again.');
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);
    
    if (error) {
      setError(error.message || 'Registration failed.');
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      setView('resetSent');
    }
  };

  const handleBiometric = (role: 'guest' | 'staff' | 'admin') => {
    setSelectedRole(role);
    setView('biometric');
    setBioLoading(true);
    setTimeout(() => {
      setBioLoading(false);
      setView('login');
    }, 2000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="Mileshi Horizon Estate" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold tracking-wider">
            MILESHI HORIZON
          </h1>
          <p className="mt-2 text-sm tracking-[0.3em] uppercase text-muted-foreground font-body">
            Sovereign Apex Estate
          </p>
        </div>

        {/* Role Selection */}
        {view === 'select' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {roles.map(({ role, label, icon: Icon, desc }) => (
                <button
                  key={role}
                  onClick={() => { setSelectedRole(role); setView('login'); setError(''); }}
                  className="group bg-gradient-card border border-border rounded-lg p-4 text-center hover:border-primary transition-all duration-300 hover:shadow-gold"
                >
                  <Icon className="mx-auto h-8 w-8 text-primary group-hover:text-gold-light transition-colors" />
                  <p className="mt-2 text-xs font-semibold tracking-widest text-foreground">{label}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => { setView('register'); setError(''); }}
              className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span className="tracking-wider">ENROLL AS GUEST</span>
            </button>
          </div>
        )}

        {/* Biometric Simulation */}
        {view === 'biometric' && (
          <div className="bg-gradient-card border border-border rounded-lg p-8 text-center">
            <Fingerprint className="mx-auto h-16 w-16 text-primary animate-pulse-gold" />
            <p className="mt-4 text-sm text-muted-foreground tracking-wider">SCANNING BIOMETRICS...</p>
          </div>
        )}

        {/* Login Form */}
        {view === 'login' && (
          <div className="bg-gradient-card border border-border rounded-lg p-6 space-y-4">
            <div className="text-center mb-2">
              <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">
                {selectedRole.toUpperCase()} ACCESS
              </p>
            </div>
            {error && <p className="text-destructive text-xs text-center">{error}</p>}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors pr-10"
                  placeholder="Enter password"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-gold text-primary-foreground font-semibold text-sm tracking-wider rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'AUTHORIZING...' : 'AUTHORIZE'}
            </button>
            <div className="flex gap-2">
              <button onClick={() => handleBiometric(selectedRole)} className="flex-1 py-2 border border-border rounded text-xs text-muted-foreground hover:text-foreground hover:border-primary transition-all flex items-center justify-center gap-1">
                <Fingerprint className="h-3 w-3" /> BIOMETRIC
              </button>
              <button onClick={() => { setView('select'); setError(''); }} className="flex-1 py-2 border border-border rounded text-xs text-muted-foreground hover:text-foreground hover:border-primary transition-all">
                BACK
              </button>
            </div>
            <button
              onClick={() => { setView('forgot'); setError(''); }}
              className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors tracking-wider"
            >
              FORGOT PASSWORD?
            </button>
          </div>
        )}

        {/* Forgot Password Form */}
        {view === 'forgot' && (
          <div className="bg-gradient-card border border-border rounded-lg p-6 space-y-4">
            <div className="text-center mb-2">
              <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">PASSWORD RECOVERY</p>
              <p className="text-[10px] text-muted-foreground mt-1">Enter your email to receive a reset link.</p>
            </div>
            {error && <p className="text-destructive text-xs text-center">{error}</p>}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter your email"
                onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
              />
            </div>
            <button
              onClick={handleForgotPassword}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-gold text-primary-foreground font-semibold text-sm tracking-wider rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
            <button onClick={() => { setView('login'); setError(''); }} className="w-full py-2 border border-border rounded text-xs text-muted-foreground hover:text-foreground hover:border-primary transition-all flex items-center justify-center gap-1">
              <ArrowLeft className="h-3 w-3" /> BACK TO LOGIN
            </button>
          </div>
        )}

        {/* Reset Email Sent */}
        {view === 'resetSent' && (
          <div className="bg-gradient-card border border-border rounded-lg p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-foreground">Password reset link sent to</p>
            <p className="text-primary font-semibold text-sm">{email}</p>
            <p className="text-[10px] text-muted-foreground">Check your email and follow the link to reset your password.</p>
            <button onClick={() => { setView('login'); setError(''); }} className="w-full py-2 border border-border rounded text-xs text-muted-foreground hover:text-foreground hover:border-primary transition-all">
              BACK TO LOGIN
            </button>
          </div>
        )}

        {/* Register Form */}
        {view === 'register' && (
          <div className="bg-gradient-card border border-border rounded-lg p-6 space-y-4">
            <div className="text-center mb-2">
              <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">GUEST ENROLLMENT</p>
              <p className="text-[10px] text-muted-foreground mt-1">Staff & Admin accounts are created by management only.</p>
            </div>
            {error && <p className="text-destructive text-xs text-center">{error}</p>}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors pr-10"
                  placeholder="Create a password (min 6 chars)"
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-gold text-primary-foreground font-semibold text-sm tracking-wider rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'ENROLLING...' : 'ENROLL'}
            </button>
            <button onClick={() => { setView('select'); setError(''); }} className="w-full py-2 border border-border rounded text-xs text-muted-foreground hover:text-foreground hover:border-primary transition-all">
              BACK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
