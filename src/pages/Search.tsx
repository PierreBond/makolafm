import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAllPOIs } from '../lib/db';
import type { POI } from '../types';

type Category = 'all' | 'custom' | 'transit' | 'restroom';

const CHIPS: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'custom', label: '💎 Gems' },
];

interface ResultRow {
  id: string;
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<Category>('all');
  const { gems, pins, setSelectedPOI } = useApp();
  const navigate = useNavigate();

  const results: ResultRow[] = useMemo(() => {
    const base: ResultRow[] = [
      ...getAllPOIs().map((p) => ({ id: p.id, name: p.name, description: p.description, category: p.category, latitude: p.latitude, longitude: p.longitude })),
      ...gems.map((g) => ({ id: `gem-${g.id}`, name: g.label, description: g.description ?? '', category: g.category, latitude: g.latitude, longitude: g.longitude })),
      ...pins.map((p) => ({ id: `pin-${p.id}`, name: p.label, description: p.description ?? '', category: p.category, latitude: p.latitude, longitude: p.longitude })),
    ];
    const q = query.trim().toLowerCase();
    let out = q
      ? base.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
      : base;
    if (chip !== 'all') out = out.filter((r) => r.category === chip);
    return out;
  }, [query, chip, gems, pins]);

  const total = getAllPOIs().length + gems.length + pins.length;

  const suggestions = useMemo(() => results.slice(0, 3).map((r) => r.name), [results]);

  const open = (row: ResultRow) => {
    setSelectedPOI({
      id: row.id,
      name: row.name,
      category: row.category as POI['category'],
      latitude: row.latitude,
      longitude: row.longitude,
      description: row.description,
    });
    navigate('/');
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FC] overflow-y-auto pb-28">
      {/* Editorial header */}
      <div className="px-6 pt-8 pb-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Market Guide</span>
          <span className="text-[11px] font-medium text-slate-400 font-body">Makola, Accra</span>
        </div>
        <h1 className="text-[26px] leading-[1.2] font-bold tracking-tight text-brand-charcoal font-display">Find in Makola</h1>
        <p className="text-[13px] text-slate-400 mt-1 font-medium font-body">
          {total} mapped stops, gems & amenities — yours to grow
        </p>
      </div>

      {/* Pill search bar */}
      <div className="px-6 mb-4">
        <div className="relative flex items-center w-full bg-white rounded-full border border-slate-200/80 shadow-sm px-4 py-2 transition-all focus-within:border-slate-800">
          <div className="flex items-center pointer-events-none text-slate-400 mr-2.5">
            <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search POIs, gems, pins…"
            autoFocus
            className="w-full bg-transparent text-[13px] font-semibold text-brand-charcoal placeholder-slate-400 border-none p-0 outline-none font-body"
          />
          {query && (
            <button
              aria-label="Clear search"
              type="button"
              onClick={() => setQuery('')}
              className="w-7 h-7 ml-2 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 active:scale-95 transition-transform shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="px-6 mb-5 overflow-x-auto no-scrollbar pb-1" data-purpose="quick-category-filter">
        <div className="flex items-center gap-2 text-[12px] font-semibold whitespace-nowrap">
          {CHIPS.map((c) => {
            const isActive = chip === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setChip(c.key)}
                className={
                  isActive
                    ? 'px-4 py-1.5 rounded-full bg-slate-900 text-white shadow-sm min-h-[32px] active:scale-95 transition-transform'
                    : 'px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 min-h-[32px] active:scale-95 transition-transform'
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results / empty state */}
      {results.length > 0 ? (
        <div className="px-6">
          <div className="bg-white rounded-3xl border border-black/[0.05] overflow-hidden">
            {results.map((row, i) => (
              <button
                key={row.id}
                type="button"
                onClick={() => open(row)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors ${i > 0 ? 'border-t border-black/[0.04]' : ''}`}
              >
                <span className="text-base shrink-0">{row.category === 'custom' ? '💎' : ''}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-brand-charcoal truncate">{row.name}</span>
                  <span className="block text-xs text-slate-400 truncate">{row.description || '—'}</span>
                </span>
                <svg className="w-4 h-4 text-slate-300 stroke-[2] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8">
          <div className="relative mb-5 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-700 shadow-sm">
              <svg className="w-7 h-7 text-slate-600 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
            </div>
            <span className="absolute top-0 right-0 w-4 h-4 bg-slate-900 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">!</span>
          </div>
          <h2 className="text-[17px] font-bold text-brand-charcoal tracking-tight font-display mb-1.5">No results found in Makola</h2>
          <p className="text-[12px] text-slate-400 max-w-[240px] leading-relaxed mb-6 font-medium font-body">
            Not there yet? It could be waiting to be discovered — add it as a gem on the map.
          </p>
          <div className="w-full bg-white rounded-3xl p-4 border border-black/[0.05] text-left shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Popular nearby</p>
              <span className="text-[10px] text-slate-400 font-medium font-body">Quick suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
