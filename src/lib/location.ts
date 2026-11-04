import type { UserLocation } from '../types';

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
