import { useRef, useCallback, type ReactNode } from 'react';
import { Map as MapGL } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, MAKOLA_CENTER, MAKOLA_BOUNDS, DEFAULT_ZOOM } from '../lib/constants';

interface MapProps {
  children?: ReactNode;
  onClick?: (e: any) => void;
  ViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

export function Map({ children, onClick, ViewState }: MapProps) {
  const mapRef = useRef<any>(null);

  const zoom = useCallback((delta: number) => {
    mapRef.current?.zoomTo(mapRef.current.getZoom() + delta, { duration: 200 });
  }, []);

  const recenter = useCallback(() => {
    mapRef.current?.flyTo({ center: MAKOLA_CENTER, zoom: DEFAULT_ZOOM, duration: 600 });
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapGL
        ref={mapRef}
        mapLib={mapboxgl}
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        initialViewState={ViewState ?? {
          longitude: MAKOLA_CENTER[0],
          latitude: MAKOLA_CENTER[1],
          zoom: DEFAULT_ZOOM,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={onClick}
        maxBounds={[MAKOLA_BOUNDS.west, MAKOLA_BOUNDS.south, MAKOLA_BOUNDS.east, MAKOLA_BOUNDS.north]}
        minZoom={14}
        maxZoom={20}
        attributionControl={false}
        onLoad={() => window.dispatchEvent(new Event('makola:map-ready'))}
      >
        {children}
      </MapGL>

      {/* Floating map control stack — top right */}
      <nav
        aria-label="Map Controls"
        className="absolute top-14 right-5 z-20 flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-pill-soft border border-black/[0.04] overflow-hidden divide-y divide-black/[0.05]"
      >
        <button
          aria-label="Zoom in"
          type="button"
          onClick={() => zoom(1)}
          className="w-10 h-10 flex items-center justify-center text-brand-charcoal active:bg-neutral-100 transition-colors"
        >
          <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          aria-label="Zoom out"
          type="button"
          onClick={() => zoom(-1)}
          className="w-10 h-10 flex items-center justify-center text-brand-charcoal active:bg-neutral-100 transition-colors"
        >
          <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M19.5 12h-15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          aria-label="Recenter on Makola"
          type="button"
          onClick={recenter}
          className="w-10 h-10 flex items-center justify-center text-brand-charcoal active:bg-neutral-100 transition-colors"
        >
          <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="7" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
