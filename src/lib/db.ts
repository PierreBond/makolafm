import { MAKOLA_BOUNDS } from './constants';
import type { POI, Pin } from '../types';
import MAKOLA_POIS from '../data/makola-pois.json';

const PINS_KEY = 'makolafm_pins';
const DEVICE_KEY = 'makolafm_device';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function inBounds(p: { latitude: number; longitude: number }): boolean {
  return (
    p.latitude <= MAKOLA_BOUNDS.north &&
    p.latitude >= MAKOLA_BOUNDS.south &&
    p.longitude <= MAKOLA_BOUNDS.east &&
    p.longitude >= MAKOLA_BOUNDS.west
  );
}

const pois = MAKOLA_POIS as POI[];

export function getAllPOIs(): POI[] {
  return pois.filter(inBounds);
}

export function searchPOIs(query: string): POI[] {
  const base = getAllPOIs();
  if (!query.trim()) return base;
  const q = query.toLowerCase();
  return base.filter(
    (poi) =>
      poi.name.toLowerCase().includes(q) ||
      poi.description.toLowerCase().includes(q) ||
      poi.category.toLowerCase().includes(q)
  );
}

function readPins(): Pin[] {
  try {
    const pins = JSON.parse(localStorage.getItem(PINS_KEY) ?? '[]') as Pin[];
    return pins.filter(inBounds);
  } catch {
    return [];
  }
}

function writePins(pins: Pin[]): void {
  localStorage.setItem(PINS_KEY, JSON.stringify(pins));
}

export function getAllPins(): Pin[] {
  return readPins();
}

export function getUnsyncedPins(): Pin[] {
  return readPins().filter((p) => !p.synced);
}

export function markSynced(ids: string[]): void {
  const pins = readPins().map((p) => (ids.includes(p.id) ? { ...p, synced: true } : p));
  writePins(pins);
}

export function addPin(pin: Pin, deviceId: string): void {
  const pins = readPins();
  pins.push({ ...pin, deviceId, synced: false });
  writePins(pins);
}

export function deletePin(id: string): void {
  writePins(readPins().filter((p) => p.id !== id));
}
