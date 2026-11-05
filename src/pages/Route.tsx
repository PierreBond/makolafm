import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Map } from '../components/Map';
import { POIMarker } from '../components/POIMarker';
import { RoutePolyline } from '../components/RoutePolyline';
import { formatDistance, formatDuration } from '../lib/routing';
import type { RouteStep } from '../types';

interface RouteState {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number; name: string };
  route: {
    geometry: GeoJSON.LineString;
    distance: number;
    duration: number;
    steps: RouteStep[];
  };
  far?: boolean;
}

export default function Route() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSteps, setShowSteps] = useState(false);
  const state = location.state as RouteState | null;

  const back = () => {
    navigate('/');
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F8F9FC] px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-xl shadow-sm mx-auto mb-5">🧭</div>
          <h1 className="text-[17px] font-bold text-brand-charcoal tracking-tight font-display mb-1.5">No route selected</h1>
          <p className="text-[12px] text-slate-400 max-w-[240px] mx-auto mb-6 font-medium font-body">
            Pick a spot on the map or your pins and start directions from there.
          </p>
          <button
            type="button"
            onClick={back}
            className="bg-brand-charcoal text-white px-8 py-3 rounded-full text-xs font-bold tracking-wide active:scale-95 transition-all"
          >
            Go to Map
          </button>
        </div>
      </div>
    );
  }

  const { origin, destination, route } = state;
  const nextStep = route.steps[0];

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
          label={state.far ? 'Makola Market (center)' : 'You'}
          category={state.far ? 'custom' : 'you'}
        />
        <POIMarker
          coordinate={[destination.longitude, destination.latitude]}
          label={destination.name}
          category="custom"
        />
        <RoutePolyline geometry={route.geometry} />
      </Map>

      {/* Top floating exit capsule */}
      <header className="absolute top-14 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={back}
          className="pointer-events-auto h-11 px-4 bg-brand-charcoal text-white rounded-full shadow-nav-dock flex items-center gap-2.5 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[13px] font-bold tracking-tight">Makola Market</span>
        </button>
        <div className="pointer-events-auto h-8 px-3 bg-white/95 backdrop-blur-md rounded-full shadow-pill-soft border border-black/[0.04] flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-brand-charcoal">Navigating</span>
        </div>
      </header>

      {/* Far-from-market notice */}
      {state.far && (
        <div className="absolute top-28 left-5 right-5 z-20 max-w-md mx-auto">
          <div className="bg-[#FDF6D8] border border-black/[0.05] rounded-2xl px-4 py-2.5 shadow-pill-soft flex items-start gap-2.5">
            <svg className="w-4 h-4 text-brand-charcoal shrink-0 mt-0.5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-xs text-brand-charcoal font-medium font-body leading-relaxed">
              You're outside Makola — directions start from the market's center for this test. Stand inside the market and this route begins from your spot instead.
            </p>
          </div>
        </div>
      )}

      {/* Destination card */}
      <div className="absolute bottom-24 left-5 right-5 z-20 max-w-md mx-auto">
        <section
          aria-label={destination.name}
          className="bg-white rounded-3xl p-5 shadow-card-float border border-black/[0.04]"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-charcoal">
              <span>💎 Gem Spot</span>
            </div>
            <span className="text-[13px] font-bold text-brand-charcoal tracking-tight">{formatDistance(route.distance)}</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-brand-charcoal font-display truncate">{destination.name}</h1>
          <p className="text-xs text-brand-muted mt-0.5 mb-4">
            ~{formatDuration(route.duration)} walk • {route.steps.length} turns
          </p>

          {/* Next-step strip */}
          {nextStep && (
            <div className="flex items-center gap-2.5 bg-[#F4F5F8] rounded-2xl px-3.5 py-2.5 mb-3 border border-black/[0.03]">
              <svg className="w-4 h-4 text-brand-charcoal shrink-0 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 20V4m0 0-6 6m6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-brand-charcoal font-body flex-1 min-w-0 truncate">{nextStep.instruction}</span>
              <span className="text-xs font-bold text-brand-charcoal shrink-0">{formatDistance(nextStep.distance)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-12 gap-2.5">
            <button
              type="button"
              onClick={back}
              className="col-span-9 h-12 bg-brand-charcoal hover:bg-black active:scale-[0.98] text-white rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center transition-all"
            >
              End Route
            </button>
            <button
              type="button"
              aria-label="View all steps"
              onClick={() => setShowSteps(true)}
              className="col-span-3 h-12 bg-[#F4F5F8] hover:bg-[#EBEDF2] active:scale-[0.98] text-brand-charcoal rounded-2xl font-medium flex items-center justify-center transition-colors border border-black/[0.03]"
            >
              <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>
      </div>

      {/* Steps overlay sheet */}
      {showSteps && (
        <div className="absolute inset-0 z-40 bg-black/40 p-5" onClick={() => setShowSteps(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl p-5 pb-28 shadow-nav-dock max-h-[70%] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold tracking-tight text-brand-charcoal font-display">Directions</h2>
              <button
                aria-label="Close steps"
                type="button"
                onClick={() => setShowSteps(false)}
                className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-charcoal rounded-full active:bg-neutral-100"
              >
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <ol>
              {route.steps.map((step, i) => (
                <li
                  key={i}
                  className={`flex gap-3 py-2.5 ${i > 0 ? 'border-t border-black/[0.05]' : ''}`}
                >
                  <span className="text-xs font-bold text-brand-muted shrink-0 w-5 pt-0.5">{i + 1}</span>
                  <span className="text-sm text-brand-charcoal font-body flex-1 min-w-0">{step.instruction}</span>
                  {step.distance > 0 && (
                    <span className="text-xs text-brand-muted shrink-0 pt-0.5">{formatDistance(step.distance)}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
