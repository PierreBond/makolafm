import { formatDistance, formatDuration } from '../lib/routing';
import type { POI, RouteResult } from '../types';
import { getDistance } from '../lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  transit: 'Transit Stop',
  restroom: 'Restroom',
  custom: 'Gem Spot',
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
    <div className="absolute bottom-24 left-5 right-5 z-20 max-w-md mx-auto">
      <section
        aria-label={poi.name}
        className="bg-white rounded-3xl p-5 shadow-card-float border border-black/[0.04]"
      >
        {/* Tag & distance row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-charcoal">
            <span>{CATEGORY_LABELS[poi.category] ?? 'Gem Spot'}</span>
            {route && (
              <>
                <span className="text-brand-muted">•</span>
                <span className="font-bold">{formatDuration(route.duration)}</span>
              </>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            {distance !== null && (
              <>
                <span className="text-[13px] font-bold text-brand-charcoal tracking-tight">
                  {formatDistance(distance)}
                </span>
                <span className="text-[11px] text-brand-muted font-normal ml-1">away</span>
              </>
            )}
            <button
              aria-label="Close"
              type="button"
              onClick={onClose}
              className="w-7 h-7 -mr-1 flex items-center justify-center text-brand-muted hover:text-brand-charcoal rounded-full active:bg-neutral-100"
            >
              <svg className="w-3.5 h-3.5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Title & meta */}
        <div className="mb-4">
          <h1 className="text-lg font-bold tracking-tight text-brand-charcoal font-display">{poi.name}</h1>
          <p className="text-xs text-brand-muted mt-0.5">{poi.description}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-12 gap-2.5">
          <button
            type="button"
            onClick={onGetRoute}
            className="col-span-9 h-12 bg-brand-charcoal hover:bg-black active:scale-[0.98] text-white rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Start Directions</span>
          </button>
          <button
            aria-label="Save this spot as a pin"
            type="button"
            onClick={onSavePin}
            className="col-span-3 h-12 bg-[#F4F5F8] hover:bg-[#EBEDF2] active:scale-[0.98] text-brand-charcoal rounded-2xl flex items-center justify-center transition-colors border border-black/[0.03]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}
