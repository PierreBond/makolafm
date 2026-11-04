import { useState } from 'react';

interface PendingGem {
  id: string;
  label: string;
  category: string;
  description: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem('adminkey') ?? '');
  const [gems, setGems] = useState<PendingGem[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const res = await fetch('/api/admin/gems?status=pending', {
      headers: { 'x-admin-key': key },
    });
    if (!res.ok) {
      setMessage('Bad key');
      setGems([]);
      return;
    }
    sessionStorage.setItem('adminkey', key);
    const data = await res.json();
    setGems(data.gems ?? []);
    setMessage(`Loaded ${data.gems?.length ?? 0} pending`);
  };

  const act = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/gems/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setGems(gems.filter((g) => g.id !== id));
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-lg font-bold mb-3">Gem Moderation</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="password"
          placeholder="Admin key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm outline-none"
        />
        <button onClick={load} className="bg-blue-600 text-white px-4 rounded-lg text-sm font-medium">
          Load
        </button>
      </div>
      {message && <p className="text-xs text-gray-500 mb-2">{message}</p>}
      {gems.map((g) => (
        <div key={g.id} className="flex items-center gap-3 p-3 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{g.label}</div>
            <div className="text-xs text-gray-500 truncate">{g.description || '—'}</div>
            <div className="text-xs text-gray-400">
              {g.latitude.toFixed(5)}, {g.longitude.toFixed(5)} · {g.category}
            </div>
          </div>
          <button onClick={() => act(g.id, 'approve')} className="text-green-600 text-sm font-medium px-2">
            ✓
          </button>
          <button onClick={() => act(g.id, 'reject')} className="text-red-500 text-sm font-medium px-2">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
