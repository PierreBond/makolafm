import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Pins() {
  const { pins, gems, userLocation, deletePin, setCurrentRoute } = useApp();
  const navigate = useNavigate();

  const handleDelete = (id: string, label: string) => {
    if (window.confirm(`Delete "${label}"? This removes it from the shared map too.`)) {
      deletePin(id);
    }
  };

  const navigateToGem = async (gem: typeof gems[number]) => {
    if (!userLocation) return;
    const { getWalkingRoute } = await import('../lib/routing');
    const route = await getWalkingRoute(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: gem.latitude, longitude: gem.longitude }
    );
    if (route) {
      setCurrentRoute(route);
      navigate('/route', {
        state: {
          origin: userLocation,
          destination: { latitude: gem.latitude, longitude: gem.longitude, name: gem.label },
          route,
        },
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">Pins</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {pins.length} mine{gems.length ? ` · ${gems.length} shared by others` : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {pins.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm border-b border-gray-100">
            No saved pins yet. Click the map to add your first gem.
          </div>
        ) : (
          pins.map((pin) => (
            <div key={pin.id} className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
              <span className="text-lg">📍</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{pin.label}</div>
                {pin.description && (
                  <div className="text-xs text-gray-500 truncate">{pin.description}</div>
                )}
                <div className="text-xs text-gray-400">
                  {pin.synced ? '✓ shared for approval' : 'on device only'}
                </div>
              </div>
              <button
                onClick={() => handleDelete(pin.id, pin.label)}
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
              >
                Delete
              </button>
            </div>
          ))
        )}

        {gems.length > 0 && (
          <>
            <div className="p-3 bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Shared Gems (approved)
            </div>
            {gems.map((gem) => (
              <div key={gem.id} className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
                <span className="text-lg">
                  {gem.category === 'transit' ? '🚌' : gem.category === 'restroom' ? '🚻' : '💎'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{gem.label}</div>
                  <div className="text-xs text-gray-400">
                    {gem.latitude.toFixed(4)}, {gem.longitude.toFixed(4)}
                  </div>
                </div>
                <button
                  onClick={() => navigateToGem(gem)}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1"
                >
                  Directions
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
