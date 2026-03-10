import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Users, Shield, User, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ManagedUser {
  user_id: string;
  email: string;
  role: AppRole;
  created_at: string;
}

export default function UserManagementPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('staff');

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (error) {
      toast.error('Failed to load users');
      setLoading(false);
      return;
    }

    // We can't query auth.users from client, so we show role data
    setUsers(
      (data || []).map((r) => ({
        user_id: r.user_id,
        email: '',
        role: r.role,
        created_at: '',
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) {
      toast.error('Email and password are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { email: newEmail, password: newPassword, role: newRole },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`${newRole} account created: ${newEmail}`);
      setNewEmail('');
      setNewPassword('');
      setNewRole('staff');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const roleIcon = (role: AppRole) => {
    switch (role) {
      case 'admin': return <Shield className="h-3.5 w-3.5 text-primary" />;
      case 'staff': return <Users className="h-3.5 w-3.5 text-accent" />;
      default: return <User className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const roleColor = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'text-primary';
      case 'staff': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-display text-3xl font-bold text-gradient-gold">User Management</h2>

      {/* Create User Form */}
      <div className="bg-gradient-card border border-border rounded-lg p-5 space-y-4">
        <h3 className="text-xs tracking-widest uppercase text-muted-foreground flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Create New Account
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="email"
            placeholder="Email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as AppRole)}
            className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            <option value="guest">Guest</option>
          </select>
          <button
            onClick={handleCreateUser}
            disabled={creating}
            className="px-4 py-2 bg-gradient-gold text-primary-foreground rounded text-sm font-semibold tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            CREATE
          </button>
        </div>
      </div>

      {/* User List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs tracking-widest uppercase text-muted-foreground">All Users</h3>
          <button onClick={fetchUsers} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse bg-gradient-card border border-border rounded-lg p-8" />
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.user_id}
                className="bg-gradient-card border border-border rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {roleIcon(u.role)}
                  <div>
                    <p className="text-sm font-mono text-muted-foreground">{u.user_id.slice(0, 8)}...</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${roleColor(u.role)}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
