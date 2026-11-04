export interface POI {
  id: string;
  name: string;
  category: 'transit' | 'restroom';
  latitude: number;
  longitude: number;
  description: string;
}

export interface Pin {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  category: string;
  description?: string;
  created_at: string;
  synced?: boolean;
  deviceId?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

import type { LineString } from 'geojson';

export interface RouteResult {
  geometry: LineString;
  distance: number;
  duration: number;
  steps: string[];
}
