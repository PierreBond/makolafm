import { Source, Layer } from 'react-map-gl/mapbox';
import type { LineString } from 'geojson';

interface RoutePolylineProps {
  geometry: LineString;
}

export function RoutePolyline({ geometry }: RoutePolylineProps) {
  return (
    <Source id="route-source" type="geojson" data={geometry}>
      <Layer
        id="route-line-casing"
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{ 'line-color': '#121316', 'line-width': 5 }}
      />
      <Layer
        id="route-line"
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{
          'line-color': '#FFFFFF',
          'line-width': 2,
          'line-dasharray': [1, 2],
        }}
      />
    </Source>
  );
}
