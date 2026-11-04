import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map } from '../components/Map';
import { POIMarker } from '../components/POIMarker';
import { InfoCard } from '../components/InfoCard';
import { AddPinDialog } from '../components/AddPinDialog';
import { RoutePolyline } from '../components/RoutePolyline';
import { useApp } from '../context/AppContext';
import { getWalkingRoute } from '../lib/routing';
import { getDistance } from '../lib/utils';
import type { Pin } from '../types';
import type { POI } from '../types';

export default function MapView() {
  const { pois, pins, gems, userLocation, currentRoute, selectedPOI, addPin, setCurrentRoute, setSelectedPOI } = useApp();
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const navigate = useNavigate();

  // Mapbox-level click decides between "marker hit" and "empty canvas add".
  // Marker DOM events proved unreliable through the mapbox overlay; distance is not.
  const handleMapClick = useCallback((e: any) => {
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;

    const candidates: Pin[] = [
      ...pois.map((p) => ({ id: p.id, label: p.name, latitude: p.latitude, longitude: p.longitude, category: p.category, description: p.description, created_at: '' })),
      ...gems,
      ...pins,
    ];
    let best: Pin | null = null;
    let bestDist = Infinity;
    for (const c of candidates) {
      const d = getDistance({ latitude: lat, longitude: lng }, { latitude: c.latitude, longitude: c.longitude });
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }

    if (best && bestDist < 25) {
      // Marker hit → InfoCard
      setSelectedPOI({
        id: best.id,
        name: best.label,
        category: best.category as POI['category'],
        latitude: best.latitude,
        longitude: best.longitude,
        description: best.description ?? '',
      });
      setPendingPin(null);
    } else {
      // Empty map → Add dialog
      setPendingPin({ latitude: lat, longitude: lng });
      setSelectedPOI(null);
    }
  }, [pois, gems, pins, setSelectedPOI]);

  const handleGetRoute = useCallback(async () => {
    if (!selectedPOI || !userLocation) return;
    setLoadingRoute(true);
    const route = await getWalkingRoute(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: selectedPOI.latitude, longitude: selectedPOI.longitude }
    );
    setCurrentRoute(route);
    setLoadingRoute(false);

    if (route) {
      navigate('/route', {
        state: {
          origin: userLocation,
          destination: selectedPOI,
          route,
        },
      });
    }
  }, [selectedPOI, userLocation, setCurrentRoute, navigate]);

  const handleSavePin = useCallback(() => {
    if (!selectedPOI) return;
    addPin({
      id: `pin-${Date.now()}`,
      label: selectedPOI.name,
      latitude: selectedPOI.latitude,
      longitude: selectedPOI.longitude,
      category: 'custom',
      created_at: new Date().toISOString(),
    });
  }, [selectedPOI, addPin]);

  return (
    <div className="relative w-full h-full">
      <Map onClick={handleMapClick}>
        {pois.map((poi) => (
          <POIMarker key={poi.id} coordinate={[poi.longitude, poi.latitude]} label={poi.name} category={poi.category} />
        ))}        {gems.map((gem) => (
          <POIMarker key={gem.id} coordinate={[gem.longitude, gem.latitude]} label={gem.label} category={gem.category} />
        ))}
        {pins.map((pin) => (
          <POIMarker key={pin.id} coordinate={[pin.longitude, pin.latitude]} label={pin.label} category="custom" />
        ))}
        {userLocation && (
          <POIMarker
            coordinate={[userLocation.longitude, userLocation.latitude]}
            label="You are here"
            category="you"
          />
        )}
        {currentRoute && <RoutePolyline geometry={currentRoute.geometry} />}
      </Map>

      {selectedPOI && (
        <InfoCard
          poi={selectedPOI}
          userLocation={userLocation}
          route={currentRoute}
          onGetRoute={handleGetRoute}
          onSavePin={handleSavePin}
          onClose={() => {
            setSelectedPOI(null);
            setCurrentRoute(null);
          }}
        />
      )}

      {pendingPin && !selectedPOI && (
        <AddPinDialog
          latitude={pendingPin.latitude}
          longitude={pendingPin.longitude}
          onSave={(label, category, description) => {
            addPin({
              id: `pin-${Date.now()}`,
              label,
              latitude: pendingPin.latitude,
              longitude: pendingPin.longitude,
              category: category as Pin['category'],
              description: description || undefined,
              created_at: new Date().toISOString(),
            });
            setPendingPin(null);
          }}
          onCancel={() => setPendingPin(null)}
        />
      )}

      {loadingRoute && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl px-4 py-2 shadow-card-float z-30 text-xs font-semibold text-brand-charcoal">
          Calculating route…
        </div>
      )}
    </div>
  );
}
