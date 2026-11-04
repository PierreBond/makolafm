import { MAPBOX_ACCESS_TOKEN } from './constants';
import type { RouteResult } from '../types';

export async function getWalkingRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<RouteResult | null> {
  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson&steps=true&overview=full`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return null;
    const route = data.routes[0];
    return {
      geometry: route.geometry,
      distance: route.distance,
      duration: route.duration,
      steps: extractSteps(route),
    };
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
}

function extractSteps(route: any): string[] {
  const steps: string[] = [];
  if (!route.legs) return steps;
  for (const leg of route.legs) {
    if (!leg.steps) continue;
    for (const step of leg.steps) {
      if (step.maneuver?.instruction) {
        steps.push(step.maneuver.instruction);
      }
    }
  }
  return steps;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 1) return 'Under 1 min';
  if (mins === 1) return '1 min';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
}
