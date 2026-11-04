import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map } from '../components/Map';
import { POIMarker } from '../components/POIMarker';
import { InfoCard } from '../components/InfoCard';
import { RoutePolyline } from '../components/RoutePolyline';
import { useApp } from '../context/AppContext';
import { getWalkingRoute } from '../lib/routing';

export default function MapView() {
  const { pois, pins, userLocation, currentRoute, selectedPOI, addPin, setCurrentRoute, setSelectedPOI } = useApp();
  const [loadingRoute, setLoadingRoute] = useState(false);
  const navigate = useNavigate();

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
    const pin = {
      id: `pin-${Date.now()}`,
      label: selectedPOI.name,
      latitude: selectedPOI.latitude,
      longitude: selectedPOI.longitude,
      category: 'custom' as const,
      created_at: new Date().toISOString(),
    };
    addPin(pin);
  }, [selectedPOI, addPin]);

  return (
    <div className="relative w-full h-full">
      <Map>
        {pois.map((poi) => (
          <POIMarker
            key={poi.id}
            coordinate={[poi.longitude, poi.latitude]}
            label={poi.name}
            category={poi.category}
            onClick={() => setSelectedPOI(poi)}
          />
        ))}
        {pins.map((pin) => (
          <POIMarker
            key={pin.id}
            coordinate={[pin.longitude, pin.latitude]}
            label={pin.label}
            category="custom"
          />
        ))}
        {userLocation && (
          <POIMarker
            coordinate={[userLocation.longitude, userLocation.latitude]}
            label="You are here"
            category="custom"
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

      {loadingRoute && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl px-4 py-2 shadow-lg z-30">
          <span className="text-sm text-gray-600">Calculating route...</span>
        </div>
      )}
    </div>
  );
}
