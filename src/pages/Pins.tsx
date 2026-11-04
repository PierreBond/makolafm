import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDistance } from '../lib/utils';
import { getWalkingRoute, formatDistance } from '../lib/routing';
import { effectiveOrigin } from '../lib/location';
import type { Pin } from '../types';

type Chip = 'all' | 'custom';
const CHIPS: { key: Chip; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'custom', label: '💎 Gems' },
];

const CATEGORY_LABELS: Record<string, string> = {
  custom: '💎 Gem Spot',
  transit: 'Transit Stop',
  restroom: 'Restroom',
};

export default function Pins() {
  const { pins, gems, userLocation, deletePin, setCurrentRoute } = useApp();
  const [chip, setChip] = useState<Chip>('all');
  const [routingTo, setRoutingTo] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = (id: string, label: string) => {
    if (window.confirm(`Delete "${label}"? This removes it from the shared map too.`)) {
      deletePin(id);
    }
  };

  const handleRoute = async (target: { latitude: number; longitude: number; label: string }, id: string) => {
    if (!userLocation) return;
    setRoutingTo(id);
    const origin = effectiveOrigin(userLocation);
    const route = await getWalkingRoute(
      { latitude: origin.latitude, longitude: origin.longitude },
      { latitude: target.latitude, longitude: target.longitude }
    );
    setRoutingTo(null);
    if (route) {
      setCurrentRoute(route);
      navigate('/route', {
        state: {
          origin,
          destination: { latitude: target.latitude, longitude: target.longitude, name: target.label },
          route,
        },
      });
    }
  };

  const distanceOf = (p: { latitude: number; longitude: number }) =>
    userLocation ? formatDistance(getDistance(userLocation, p)) : null;

  const visiblePins = chip === 'all' ? pins : pins.filter((p) => p.category === 'custom');
  const visibleGems = chip === 'all' ? gems : gems.filter((g) => g.category === 'custom');
  const hasAny = pins.length + gems.length > 0;

  const Card = ({ pin, shared }: { pin: Pin; shared?: boolean }) => {
    const label = pin.label;
    const description = pin.description ?? '';
    const dist = distanceOf(pin);
    const routing = routingTo === pin.id;
    return (
      <article className="bg-white rounded-2xl p-5 shadow-pill-soft border border-black/[0.04] flex flex-col gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#F0F3FD] flex items-center justify-center shrink-0">
            <span className="text-lg">{pin.category === 'custom' ? '💎' : ''}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-[1.125rem] leading-6 font-semibold text-brand-charcoal tracking-tight font-display truncate">{label}</h2>
            {description && <p className="text-xs text-[#46464B] mt-0.5 font-body">{description}</p>}
            <p className="text-xs text-[#76777B] mt-1 font-body">
              {shared ? CATEGORY_LABELS[pin.category] ?? 'Gem Spot' : pin.synced ? '✓ shared for approval' : 'on device only'}
              {dist && <span> • {dist} away</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => handleRoute({ latitude: pin.latitude, longitude: pin.longitude, label }, pin.id)}
            disabled={!userLocation || routing}
            className="bg-brand-charcoal text-white px-5 py-2.5 rounded-full text-xs font-semibold font-body flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M7 3v7a4 4 0 004 4h6m-3-3 3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {routing ? 'Routing…' : 'Route'}
          </button>
          {!shared && (
            <button
              type="button"
              aria-label={`Delete ${label}`}
              onClick={() => handleDelete((pin as Pin).id, label)}
              className="bg-[#F4F5F8] hover:bg-[#EBEDF2] text-[#46464B] hover:text-brand-charcoal px-3.5 py-2.5 rounded-full text-xs font-medium font-body flex items-center gap-1 active:scale-95 transition-all border border-black/[0.03]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a1 1 0 01-1 1H7a1 1 0 01-1-1V6h14z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FC] overflow-y-auto pb-28">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#76777B] font-body">Saved Places</span>
          <span className="text-[11px] font-medium text-slate-400 font-body">Accra, GH</span>
        </div>
        <h1 className="text-[26px] leading-[1.2] font-bold tracking-tight text-brand-charcoal font-display mt-1">Saved Pins</h1>
        <p className="text-[13px] text-[#46464B] font-medium font-body">
          {hasAny
            ? `${pins.length} of your pins${gems.length ? ` • ${gems.length} shared gem${gems.length > 1 ? 's' : ''} from others` : ''} in Makola`
            : 'Nothing bookmarked yet'}
        </p>
      </header>

      {/* Filter chips */}
      <nav aria-label="Category filters" className="px-5 pb-5 overflow-x-auto no-scrollbar flex items-center gap-2">
        {CHIPS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setChip(c.key)}
            className={
              chip === c.key
                ? 'bg-brand-charcoal text-white px-4 py-2 rounded-full text-xs font-semibold font-body whitespace-nowrap shadow-sm active:scale-95 transition-all'
                : 'bg-[#E5E8F2] text-brand-charcoal hover:bg-[#D6DAE4] px-4 py-2 rounded-full text-xs font-medium font-body whitespace-nowrap active:scale-95 transition-all'
            }
          >
            {c.key === 'all' ? `All (${pins.length + gems.length})` : c.label}
          </button>
        ))}
      </nav>

      {/* Cards */}
      <main className="px-5 flex flex-col gap-3.5">
        {!hasAny ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-xl shadow-sm mb-5">💎</div>
            <h2 className="text-[17px] font-bold text-brand-charcoal tracking-tight font-display mb-1.5">No saved pins yet</h2>
            <p className="text-[12px] text-slate-400 max-w-[240px] leading-relaxed font-medium font-body">
              Tap the map to add your first gem — it lives here once saved.
            </p>
          </div>
        ) : (
          <>
            {visiblePins.map((pin) => (
              <Card key={pin.id} pin={pin} />
            ))}
            {visibleGems.length > 0 && chip === 'all' && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#76777B] pt-2 pb-1 font-body">Shared Gems</p>
            )}
            {visibleGems.map((gem) => (
              <Card key={gem.id} pin={gem} shared />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
