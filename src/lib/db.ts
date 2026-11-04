import { MAKOLA_BOUNDS } from './constants';
import type { POI, Pin } from '../types';
import MAKOLA_POIS from '../data/makola-pois.json';

export function inBounds(poi: { latitude: number; longitude: number }): boolean {
  return (
    poi.latitude <= MAKOLA_BOUNDS.north &&
    poi.latitude >= MAKOLA_BOUNDS.south &&
    poi.longitude <= MAKOLA_BOUNDS.east &&
    poi.longitude >= MAKOLA_BOUNDS.west
  );
}

export function getAllPOIs(): POI[] {
  return (MAKOLA_POIS as POI[]).filter(inBounds);
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

const PINS_KEY = 'makolafm_pins';

export function getAllPins(): Pin[] {
  try {
    return JSON.parse(localStorage.getItem(PINS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function addPin(pin: Pin): void {
  const pins = getAllPins();
  pins.push(pin);
  localStorage.setItem(PINS_KEY, JSON.stringify(pins));
}

export function deletePin(id: string): void {
  const pins = getAllPins().filter((p) => p.id !== id);
  localStorage.setItem(PINS_KEY, JSON.stringify(pins));
}
