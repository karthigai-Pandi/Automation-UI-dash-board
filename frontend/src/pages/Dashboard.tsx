import { useState, useEffect } from 'react';
import api from '../services/api';

interface DashboardData {
  ahuCount: number;
  runningEquipment: number;
  activeAlarms: number;
  temperatureSummary: {
    average: number;
    min: number;
    max: number;
  };
  energyConsumption: {
    average: number;
    total: number;
  };
}

const floorStatus = [
  { floor: 'Floor 1', status: 'normal', label: 'All systems stable' },
  { floor: 'Floor 2', status: 'warning', label: 'Filter service due' },
  { floor: 'Floor 3', status: 'alarm', label: 'AHU alarm active' },
  { floor: 'Basement', status: 'normal', label: 'DG and meter stable' }
];

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-white">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Industrial building monitoring and trend analytics.</p>
        </div>
        <div className="text-gray-300 text-sm bg-gray-800 px-4 py-3 rounded-lg shadow-sm w-fit">
          {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-800">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-400">Total AHU</p>
          <p className="text-4xl font-semibold text-white mt-4">{data?.ahuCount || 0}</p>
          <p className="text-sm text-gray-400 mt-2">AHUs currently connected to the BMS network.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-800">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">Running</p>
          <p className="text-4xl font-semibold text-white mt-4">{data?.runningEquipment || 0}</p>
          <p className="text-sm text-gray-400 mt-2">Systems with active running status.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-800">
          <p className="text-sm uppercase tracking-[0.2em] text-rose-400">Active alarms</p>
          <p className="text-4xl font-semibold text-white mt-4">{data?.activeAlarms || 0}</p>
          <p className="text-sm text-gray-400 mt-2">Unacknowledged alarms in the alarm queue.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-800">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-400">Energy</p>
          <p className="text-4xl font-semibold text-white mt-4">{data?.energyConsumption.total?.toFixed(0) || '0'} kWh</p>
          <p className="text-sm text-gray-400 mt-2">Last 24h energy consumption summary.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-800">
          <h2 className="text-xl font-semibold text-white">Floor Status Map</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {floorStatus.map((floor) => (
              <div
                key={floor.floor}
                className={`rounded-3xl p-5 border ${
                  floor.status === 'normal'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : floor.status === 'warning'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-rose-500/30 bg-rose-500/5'
                }`}
              >
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{floor.floor}</p>
                <p className="text-2xl text-white font-semibold mt-3">{floor.status === 'normal' ? 'Normal' : floor.status === 'warning' ? 'Warning' : 'Alarm'}</p>
                <p className="text-sm text-gray-400 mt-2">{floor.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-800">
          <h2 className="text-xl font-semibold text-white">Trending Summary</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-3xl bg-slate-950/40 p-4">
              <p className="text-sm text-gray-400">Avg temp today</p>
              <p className="text-3xl text-white font-semibold">{data?.temperatureSummary.average.toFixed(1)}°C</p>
            </div>
            <div className="rounded-3xl bg-slate-950/40 p-4">
              <p className="text-sm text-gray-400">Min / Max</p>
              <p className="text-white">{data?.temperatureSummary.min.toFixed(1)}°C / {data?.temperatureSummary.max.toFixed(1)}°C</p>
            </div>
            <div className="rounded-3xl bg-slate-950/40 p-4">
              <p className="text-sm text-gray-400">Energy efficiency</p>
              <p className="text-white">{data?.energyConsumption.average?.toFixed(2) || '0.00'} kWh per device</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;