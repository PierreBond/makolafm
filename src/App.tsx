import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { TabBar } from './components/TabBar';
import MapView from './pages/MapView';
import Search from './pages/Search';
import Pins from './pages/Pins';
import RouteView from './pages/Route';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex flex-col h-screen">
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<MapView />} />
              <Route path="/search" element={<Search />} />
              <Route path="/pins" element={<Pins />} />
              <Route path="/route" element={<RouteView />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
          <TabBar />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
