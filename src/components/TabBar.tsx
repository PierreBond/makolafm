import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/', label: 'Map', icon: '🗺️' },
  { path: '/search', label: 'Search', icon: '🔍' },
  { path: '/pins', label: 'Pins', icon: '📌' },
];

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex bg-white border-t border-gray-200">
      {TABS.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
