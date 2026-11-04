import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { POI, Pin, UserLocation, RouteResult } from '../types';
import { getAllPOIs, getAllPins, addPin as dbAddPin, deletePin as dbDeletePin, getDeviceId } from '../lib/db';
import { watchPosition, getCurrentLocation } from '../lib/location';
import { syncOnce } from '../lib/sync';
import { inBounds } from '../lib/db';

interface AppContextValue {
  pois: POI[];
  pins: Pin[];
  gems: Pin[];
  userLocation: UserLocation | null;
  currentRoute: RouteResult | null;
  selectedPOI: POI | null;
  addPin: (pin: Pin) => void;
  deletePin: (id: string) => void;
  setUserLocation: (loc: UserLocation | null) => void;
  setCurrentRoute: (route: RouteResult | null) => void;
  setSelectedPOI: (poi: POI | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [pois] = useState<POI[]>(getAllPOIs);
  const [pins, setPins] = useState<Pin[]>(getAllPins);
  const [gems, setGems] = useState<Pin[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [currentRoute, setCurrentRoute] = useState<RouteResult | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const deviceId = getDeviceId();

  const refresh = useCallback(async () => {
    const remote = await syncOnce();
    if (remote) {
      setPins(getAllPins());
      setGems(remote);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation().then(setUserLocation);
    const watcher = watchPosition(setUserLocation);
    refresh();
    const onOnline = () => refresh();
    window.addEventListener('online', onOnline);
    return () => {
      watcher.remove();
      window.removeEventListener('online', onOnline);
    };
  }, [refresh]);

  const addPin = useCallback((pin: Pin) => {
    dbAddPin(pin, deviceId);
    setPins(getAllPins());
    // fire-and-forget upload; stays queued locally if offline
    syncOnce();
  }, [deviceId]);

  const deletePin = useCallback((id: string) => {
    dbDeletePin(id);
    setPins(getAllPins());
  }, []);

  return (
    <AppContext.Provider
      value={{
        pois,
        pins,
        gems: gems.filter((g) => inBounds(g)),
        userLocation,
        currentRoute,
        selectedPOI,
        addPin,
        deletePin,
        setUserLocation,
        setCurrentRoute,
        setSelectedPOI,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
