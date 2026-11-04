import { useLocation, useNavigate } from 'react-router-dom';
import { Map } from '../components/Map';
import { POIMarker } from '../components/POIMarker';
import { RoutePolyline } from '../components/RoutePolyline';
import { formatDistance, formatDuration } from '../lib/routing';

interface RouteState {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number; name: string };
  route: {
    geometry: GeoJSON.LineString;
    distance: number;
    duration: number;
    steps: string[];
  };
}

export default function Route() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as RouteState | null;

  if (!state) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">No route selected</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 text-sm font-medium"
          >
            Go to Map
          </button>
        </div>
      </div>
    );
  }

  const { origin, destination, route } = state;

  return (
    <div className="relative w-full h-full">
      <Map
        ViewState={{
          longitude: (origin.longitude + destination.longitude) / 2,
          latitude: (origin.latitude + destination.latitude) / 2,
          zoom: 15,
        }}
      >
        <POIMarker
          coordinate={[origin.longitude, origin.latitude]}
          label="You"
          category="custom"
        />
        <POIMarker
          coordinate={[destination.longitude, destination.latitude]}
          label={destination.name}
          category="transit"
        />
        <RoutePolyline geometry={route.geometry} />
      </Map>

      <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 z-20 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{destination.name}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="font-medium">{formatDistance(route.distance)}</span>
          <span>~{formatDuration(route.duration)} walk</span>
        </div>

        {route.steps.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <p className="text-xs font-medium text-gray-400 uppercase mb-2">Directions</p>
            <ol className="space-y-1">
              {route.steps.map((step, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-gray-300 shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full mt-3 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          Back to Map
        </button>
      </div>
    </div>
  );
}
