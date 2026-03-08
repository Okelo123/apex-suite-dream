import { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !message.trim()) {
      toast.error('Name and message are required.');
      return;
    }
    toast.success('Message sent. Our concierge will respond shortly.');
    setName(''); setEmail(''); setMessage('');
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <h2 className="font-display text-3xl font-bold text-gradient-gold mb-2">Contact</h2>
      <p className="text-sm text-muted-foreground mb-6">Reach our concierge team for any inquiries.</p>

      <div className="bg-gradient-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="mt-1 w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
            className="mt-1 w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>
        <button onClick={handleSubmit}
          className="w-full py-2.5 bg-gradient-gold text-primary-foreground font-semibold text-sm tracking-wider rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <Send className="h-4 w-4" /> SEND MESSAGE
        </button>
      </div>
    </div>
  );
}
