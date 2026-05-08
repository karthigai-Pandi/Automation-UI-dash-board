import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TrendPoint {
  time: string;
  temperature: number;
  energy: number;
  humidity: number;
}

const generateTrendData = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const time = new Date(now.getTime() - (11 - index) * 30 * 60000);
    return {
      time: `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`,
      temperature: parseFloat((22 + Math.sin(index / 2) * 1.8 + Math.random() * 0.8).toFixed(1)),
      energy: parseFloat((320 + index * 5 + Math.random() * 18).toFixed(0)),
      humidity: parseFloat((45 + Math.cos(index / 3) * 3 + Math.random() * 1.2).toFixed(1))
    };
  });
};

const Trends = () => {
  const [trendData, setTrendData] = useState<TrendPoint[]>(generateTrendData());

  useEffect(() => {
    const interval = setInterval(() => {
      setTrendData(generateTrendData());
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trend Analysis</h1>
          <p className="text-gray-400 mt-2">Historical performance trends for HVAC, energy, and environmental metrics.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">Zone Temperature Trend</h2>
              <p className="text-slate-400 text-sm">Last 6 hours</p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2a2e37" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #334155' }} />
                <Area type="monotone" dataKey="temperature" stroke="#f97316" fill="url(#colorTemp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">Energy Usage Trend</h2>
              <p className="text-slate-400 text-sm">Kilowatt-hours over time</p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2a2e37" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #334155' }} />
                <Area type="monotone" dataKey="energy" stroke="#22c55e" fill="url(#colorEnergy)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-700">
          <h2 className="text-white text-xl font-semibold">Current Trend Summary</h2>
          <div className="mt-5 space-y-3 text-slate-300">
            <p>Temperature is stable with slight upward drift as occupancy increases.</p>
            <p>Energy demand shows a normal plateau pattern after peak cooling periods.</p>
            <p>Humidity remains within target thresholds across monitored zones.</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-700">
          <h2 className="text-white text-xl font-semibold">Trend Alerts</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl bg-slate-950/50 p-4">
              <p className="text-gray-400">Temperature trend indicates a need to tune AHU discharge setpoint within the next hour.</p>
            </div>
            <div className="rounded-3xl bg-slate-950/50 p-4">
              <p className="text-gray-400">Energy trend is consistent with expected baseline for current building load.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;