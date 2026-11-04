import { formatDistance, formatDuration } from '../lib/routing';
import type { POI, RouteResult } from '../types';
import { getDistance } from '../lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  transit: '#1E88E5',
  restroom: '#43A047',
  custom: '#F4511E',
};

const CATEGORY_LABELS: Record<string, string> = {
  transit: 'Transit',
  restroom: 'Restroom',
  custom: 'Custom Pin',
};

interface InfoCardProps {
  poi: POI;
  userLocation: { latitude: number; longitude: number } | null;
  route: RouteResult | null;
  onGetRoute: () => void;
  onSavePin: () => void;
  onClose: () => void;
}

export function InfoCard({ poi, userLocation, route, onGetRoute, onSavePin, onClose }: InfoCardProps) {
  const distance = userLocation
    ? getDistance(userLocation, { latitude: poi.latitude, longitude: poi.longitude })
    : null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 z-20 max-w-md mx-auto">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[poi.category] ?? '#999' }}
            />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {CATEGORY_LABELS[poi.category] ?? poi.category}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{poi.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{poi.description}</p>
          {distance !== null && (
            <p className="text-sm text-gray-400 mt-1">
              {formatDistance(distance)} away
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
        >
          ✕
        </button>
      </div>

      {route && (
        <div className="mt-3 p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-blue-900">
              {formatDistance(route.distance)} walk
            </span>
            <span className="text-blue-600">~{formatDuration(route.duration)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={onGetRoute}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          {route ? 'Recalculate Route' : 'Get Route'}
        </button>
        <button
          onClick={onSavePin}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          Save Pin
        </button>
      </div>
    </div>
  );
}
