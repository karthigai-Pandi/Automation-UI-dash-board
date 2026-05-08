import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AHU from './pages/AHU';
import FCU from './pages/FCU';
import EnergyMeter from './pages/EnergyMeter';
import FireAlarm from './pages/FireAlarm';
import DG from './pages/DG';
import Alarms from './pages/Alarms';
import Trends from './pages/Trends';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="ahu" element={<AHU />} />
          <Route path="fcu" element={<FCU />} />
          <Route path="energy" element={<EnergyMeter />} />
          <Route path="fire" element={<FireAlarm />} />
          <Route path="dg" element={<DG />} />
          <Route path="alarms" element={<Alarms />} />
          <Route path="trends" element={<Trends />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
