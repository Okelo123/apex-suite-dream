import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Search, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  available: 'bg-emerald border-emerald',
  occupied: 'bg-destructive/80 border-destructive',
  maintenance: 'bg-accent border-accent',
  lockdown: 'bg-lockdown border-lockdown',
};

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default function FrontOfficePage() {
  const { data: inventory = [] } = useInventory();
  const suites = inventory.filter(i => i.category === 'suite');
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Deep clean Royal Suite', done: false },
    { id: '2', text: 'Restock minibar — Imperial Suite', done: true },
    { id: '3', text: 'Replace towels — Garden Suite', done: false },
  ]);
  const [newTask, setNewTask] = useState('');
  const [notes, setNotes] = useState('');

  const mockGuests = [
    { name: 'Lady Ashford', conf: 'MH-001', phone: '+254 700 000 001', suite: 'Royal Suite' },
    { name: 'Mr. Nakamura', conf: 'MH-002', phone: '+254 700 000 002', suite: 'Imperial Suite' },
  ];

  const filteredGuests = searchQuery
    ? mockGuests.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.conf.includes(searchQuery) || g.phone.includes(searchQuery))
    : [];

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(t => [...t, { id: Date.now().toString(), text: newTask, done: false }]);
    setNewTask('');
  };

  const selected = suites.find(s => s.id === selectedSuite);

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-display text-3xl font-bold text-gradient-gold">Front Office</h2>

      {/* Room Grid */}
      <div>
        <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Room Grid</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {suites.map(suite => (
            <button
              key={suite.id}
              onClick={() => setSelectedSuite(suite.id)}
              className={`p-4 rounded-lg border-2 transition-all text-center ${statusColors[suite.status]} ${
                selectedSuite === suite.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
              }`}
            >
              <p className="font-display text-sm font-semibold text-foreground">{suite.name}</p>
              <p className="text-[10px] text-foreground/70 uppercase tracking-wider mt-1">{suite.status}</p>
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-3 bg-gradient-card border border-border rounded-lg p-4">
            <h4 className="font-display text-lg font-semibold text-foreground">{selected.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">{selected.description}</p>
            <p className="text-xs text-primary mt-1">Status: {selected.status} • Price: KES {selected.price.toLocaleString()}/night</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Guest Search */}
        <div className="space-y-3">
          <h3 className="text-xs tracking-widest uppercase text-muted-foreground">Quick Guest Search</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Name, confirmation #, or phone"
              className="w-full bg-secondary border border-border rounded pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
          </div>
          {filteredGuests.map(g => (
            <div key={g.conf} className="bg-gradient-card border border-border rounded p-3">
              <p className="text-sm font-semibold text-foreground">{g.name}</p>
              <p className="text-xs text-muted-foreground">{g.conf} • {g.phone} • {g.suite}</p>
            </div>
          ))}
        </div>

        {/* Task Management */}
        <div className="space-y-3">
          <h3 className="text-xs tracking-widest uppercase text-muted-foreground">Tasks</h3>
          <div className="flex gap-2">
            <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add task..."
              className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              onKeyDown={e => e.key === 'Enter' && addTask()} />
            <button onClick={addTask} className="px-3 bg-gradient-gold text-primary-foreground rounded"><Plus className="h-4 w-4" /></button>
          </div>
          {tasks.map(t => (
            <div key={t.id} className="flex items-center gap-2 bg-gradient-card border border-border rounded p-2">
              <button onClick={() => setTasks(ts => ts.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}>
                <CheckCircle2 className={`h-4 w-4 ${t.done ? 'text-emerald' : 'text-muted-foreground'}`} />
              </button>
              <span className={`text-sm flex-1 ${t.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Notes */}
      <div>
        <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Internal Notes</h3>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add notes about guest preferences, requests..."
          className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none" />
        <button onClick={() => toast.success('Notes saved.')}
          className="mt-2 px-4 py-2 bg-gradient-gold text-primary-foreground text-xs tracking-wider rounded hover:opacity-90 transition-opacity font-semibold">
          SAVE NOTES
        </button>
      </div>
    </div>
  );
}
