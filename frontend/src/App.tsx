import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Infrastructure from './pages/Infrastructure';
import Requests from './pages/Requests';
import Queue from './pages/Queue';
import AllocationEngine from './pages/AllocationEngine';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="requests" element={<Requests />} />
          <Route path="queue" element={<Queue />} />
          <Route path="allocation" element={<AllocationEngine />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
