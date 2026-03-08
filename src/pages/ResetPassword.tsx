import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import heroImg from '@/assets/hero-estate.jpg';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery type in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecovery(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      toast.error('Please fill in both fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      navigate('/');
    }
  };

  if (!isRecovery) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Mileshi Horizon Estate" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 text-center">
          <p className="text-muted-foreground text-sm">Loading recovery session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Mileshi Horizon Estate" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold tracking-wider">
            MILESHI HORIZON
          </h1>
          <p className="mt-2 text-sm tracking-[0.3em] uppercase text-muted-foreground font-body">
            Sovereign Apex Estate
          </p>
        </div>

        <div className="bg-gradient-card border border-border rounded-lg p-6 space-y-4">
          <div className="text-center mb-2">
            <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">SET NEW PASSWORD</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">New Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors pr-10"
                placeholder="Enter new password"
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="mt-1 w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Confirm new password"
              onKeyDown={e => e.key === 'Enter' && handleReset()}
            />
          </div>
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-gold text-primary-foreground font-semibold text-sm tracking-wider rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </div>
      </div>
    </div>
  );
}
