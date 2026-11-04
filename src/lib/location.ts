import type { UserLocation } from '../types';
import { getDistance } from './utils';
import { MAKOLA_CENTER } from './constants';

export function getCurrentLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function watchPosition(callback: (loc: UserLocation) => void): { remove: () => void } {
  const id = navigator.geolocation.watchPosition(
    (pos) => callback({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
    () => {},
      { enableHighAccuracy: true }
  );
  return { remove: () => navigator.geolocation.clearWatch(id) };
}

// Route origin falls back to market center when the tester is far away,
// e.g. demoing from abroad — Mapbox 422s on walks of many km.
// >2km from the market center → Mapbox 422s on long walks, so we reroute
// from the market center and tell the user.
export function isFarFromMarket(loc: UserLocation): boolean {
  return getDistance(loc, { latitude: MAKOLA_CENTER[1], longitude: MAKOLA_CENTER[0] }) > 2000;
}

export function effectiveOrigin(loc: UserLocation): UserLocation {
  return isFarFromMarket(loc)
    ? { latitude: MAKOLA_CENTER[1], longitude: MAKOLA_CENTER[0] }
    : loc;
}
