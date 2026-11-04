import type { ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ICONS: Record<string, (c: string) => ReactElement> = {
  search: (c) => (
    <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  map: (c) => (
    <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M9 6l6-3 6 3v15l-6-3-6 3-6-3V3l6 3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 6v15M15 3v15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  pin: (c) => (
    <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const TABS = [
  { path: '/search', label: 'Search', icon: 'search' },
  { path: '/', label: 'Map', icon: 'map' },
  { path: '/pins', label: 'Saved', icon: 'pin' },
];

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-charcoal text-white rounded-full p-1.5 shadow-nav-dock flex items-center justify-between w-[220px]"
    >
      {TABS.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => navigate(tab.path)}
            className={
              isActive
                ? 'w-10 h-10 rounded-full bg-white text-[#111215] flex items-center justify-center shadow-sm transition-transform active:scale-95'
                : 'w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors'
            }
          >
            {ICONS[tab.icon]('w-5 h-5 stroke-[2]')}
          </button>
        );
      })}
    </nav>
  );
}
