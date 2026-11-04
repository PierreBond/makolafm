import { useRef, type ReactNode } from 'react';
import { Map as MapGL, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import { MAPBOX_ACCESS_TOKEN, MAKOLA_CENTER, MAKOLA_BOUNDS, DEFAULT_ZOOM } from '../lib/constants';

interface MapProps {
  children?: ReactNode;
  onClick?: (e: mapboxgl.MapMouseEvent) => void;
 ViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

export function Map({ children, onClick, ViewState }: MapProps) {
  const mapRef = useRef<any>(null);

  const viewState = ViewState ?? {
    longitude: MAKOLA_CENTER[0],
    latitude: MAKOLA_CENTER[1],
    zoom: DEFAULT_ZOOM,
  };

  return (
    <MapGL
      ref={mapRef}
      mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
      initialViewState={viewState}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onClick={onClick}
      maxBounds={[MAKOLA_BOUNDS.west, MAKOLA_BOUNDS.south, MAKOLA_BOUNDS.east, MAKOLA_BOUNDS.north]}
      minZoom={14}
      maxZoom={20}
      attributionControl={false}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl position="top-right" />
      {children}
    </MapGL>
  );
}
