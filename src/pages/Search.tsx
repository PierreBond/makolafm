import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPOIs, getAllPOIs } from '../lib/db';
import { useApp } from '../context/AppContext';
import type { POI } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  transit: '#1E88E5',
  restroom: '#43A047',
};

export default function Search() {
  const [query, setQuery] = useState('');
  const { setSelectedPOI } = useApp();
  const navigate = useNavigate();

  const results = query.trim() ? searchPOIs(query) : getAllPOIs();

  const handleSelect = (poi: POI) => {
    setSelectedPOI(poi);
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200">
        <input
          type="search"
          placeholder="Search POIs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No results found
          </div>
        ) : (
          results.map((poi) => (
            <button
              key={poi.id}
              onClick={() => handleSelect(poi)}
              className="w-full flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-white transition-colors text-left"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[poi.category] ?? '#999' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{poi.name}</div>
                <div className="text-xs text-gray-400 truncate">{poi.description}</div>
              </div>
              <span className="text-xs text-gray-400 capitalize shrink-0">{poi.category}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
