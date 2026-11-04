import { Source, Layer } from 'react-map-gl/mapbox';
import type { LineString } from 'geojson';

interface RoutePolylineProps {
  geometry: LineString;
}

export function RoutePolyline({ geometry }: RoutePolylineProps) {
  return (
    <Source id="route-source" type="geojson" data={geometry}>
      <Layer
        id="route-line"
        type="line"
        layout={{
          'line-cap': 'round',
          'line-join': 'round',
        }}
        paint={{
          'line-color': '#1E88E5',
          'line-width': 4,
        }}
      />
    </Source>
  );
}
