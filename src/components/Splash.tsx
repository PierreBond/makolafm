import { useEffect, useState } from 'react';

// Launch splash: script wordmark on obsidian canvas. Fades out once the map
// signals makola:map-ready (min 1.2s for the brand beat, 6s fallback).
export function Splash() {
  const [ready, setReady] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const min = setTimeout(() => setMinElapsed(true), 1200);
    const onReady = () => setReady(true);
    window.addEventListener('makola:map-ready', onReady);
    const fallback = setTimeout(onReady, 6000);
    return () => {
      clearTimeout(min);
      clearTimeout(fallback);
      window.removeEventListener('makola:map-ready', onReady);
    };
  }, []);

  useEffect(() => {
    if (!ready || !minElapsed) return;
    const t = setTimeout(() => setGone(true), 600);
    return () => clearTimeout(t);
  }, [ready, minElapsed]);

  if (gone) return null;
  const fading = ready && minElapsed;

  return (
    <div
      aria-hidden={fading}
      className={`fixed inset-0 z-[100] bg-brand-charcoal flex flex-col items-center justify-between pointer-events-none transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex-1 flex items-center justify-center">
        <span
          className="text-white text-[64px] leading-none select-none"
          style={{ fontFamily: 'var(--font-script)' }}
        >
          Makola FM
        </span>
      </div>
      <div className="pb-10 flex flex-col items-center gap-3">
        <span className="text-[11px] font-semibold text-brand-muted tracking-[0.08em] font-body">
          Pedestrian Navigation • Accra, GH
        </span>
      </div>
    </div>
  );
}
