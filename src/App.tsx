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
        <div className="relative w-full h-full h-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<MapView />} />
            <Route path="/search" element={<Search />} />
            <Route path="/pins" element={<Pins />} />
            <Route path="/route" element={<RouteView />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <TabBar />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
