import type { Pin } from '../types';
import { getUnsyncedPins, markSynced } from './db';

const PENDING_KEY = 'makolafm_pending_upserts';

function queueUpsert(pin: Pin): void {
  const q: string[] = JSON.parse(localStorage.getItem(PENDING_KEY) ?? '[]');
  if (!q.includes(pin.id)) q.push(pin.id);
  localStorage.setItem(PENDING_KEY, JSON.stringify(q));
}

// Push unsynced pins up, pull approved gems down. Returns remote gems or null when offline.
export async function syncOnce(): Promise<Pin[] | null> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;

  try {
    const unsynced = getUnsyncedPins();
    const payload = unsynced.map((p) => ({
      id: p.id,
      label: p.label,
      category: p.category,
      description: p.description,
      latitude: p.latitude,
      longitude: p.longitude,
      created_at: p.created_at,
      deviceId: p.deviceId,
    }));

    const response = await fetch('/api/gems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upserts: payload }),
    });
    if (!response.ok) return null;

    const data = await response.json();
    markSynced(unsynced.map((p) => p.id));

    const remote: Pin[] = (data.gems ?? []).map((g: any) => ({
      id: g.id,
      label: g.label,
      latitude: g.latitude,
      longitude: g.longitude,
      category: g.category,
      description: g.description ?? undefined,
      created_at: g.created_at,
    }));
    return remote;
  } catch {
    return null;
  }
}

export { queueUpsert };
