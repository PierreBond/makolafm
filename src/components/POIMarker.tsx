import { useState } from 'react';
import { Marker, Popup } from 'react-map-gl/mapbox';

const CATEGORY_COLORS: Record<string, string> = {
  transit: '#1E88E5',
  restroom: '#43A047',
  custom: '#F4511E',
};

const CATEGORY_ICONS: Record<string, string> = {
  transit: '🚌',
  restroom: '🚻',
  custom: '📍',
};

interface POIMarkerProps {
  coordinate: [number, number];
  label: string;
  category: string;
  onClick?: () => void;
}

export function POIMarker({ coordinate, label, category, onClick }: POIMarkerProps) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <Marker
        longitude={coordinate[0]}
        latitude={coordinate[1]}
        onClick={() => {
          setShowPopup(true);
          onClick?.();
        }}
        anchor="bottom"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm cursor-pointer border-2 border-white shadow-md hover:scale-110 transition-transform"
          style={{ backgroundColor: CATEGORY_COLORS[category] ?? '#999' }}
        >
          {CATEGORY_ICONS[category] ?? '📍'}
        </div>
      </Marker>
      {showPopup && (
        <Popup
          longitude={coordinate[0]}
          latitude={coordinate[1]}
          onClose={() => setShowPopup(false)}
          anchor="bottom"
          offset={20}
        >
          <div className="text-sm font-medium px-1">{label}</div>
        </Popup>
      )}
    </>
  );
}
