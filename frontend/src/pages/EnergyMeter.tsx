import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Zap, Activity, Gauge, Settings, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

interface EnergyReading {
  timestamp: string;
  kwh: number;
  voltage: number;
  current: number;
  power_factor: number;
}

interface MeterStatus {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  total_consumption: number;
  current_load: number;
}

const generateMockEnergy = (): EnergyReading[] =>
  Array.from({ length: 10 }, (_, index) => ({
    timestamp: new Date(Date.now() - index * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    kwh: 90 + Math.random() * 40,
    voltage: 400 + Math.random() * 10,
    current: 8 + Math.random() * 5,
    power_factor: 0.85 + Math.random() * 0.12
  })).reverse();

const mockMeters: MeterStatus[] = [
  { name: 'Main Panel', status: 'online', total_consumption: 1250.5, current_load: 85.2 },
  { name: 'Floor 1', status: 'online', total_consumption: 450.8, current_load: 32.1 },
  { name: 'Floor 2', status: 'online', total_consumption: 380.3, current_load: 28.7 },
  { name: 'HVAC System', status: 'online', total_consumption: 320.2, current_load: 45.6 }
];

const EnergyMeter = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EnergyReading[]>(generateMockEnergy());
  const [meters, setMeters] = useState<MeterStatus[]>(mockMeters);
  const [controlLoading, setControlLoading] = useState<string | null>(null);

  const canControl = user?.role === 'admin' || user?.role === 'operator';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/energy');
        if (Array.isArray(response.data)) {
          const payload = response.data.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setData(payload);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMeters(prev => prev.map(meter => ({
        ...meter,
        current_load: parseFloat((meter.current_load + (Math.random() - 0.5) * 5).toFixed(1)),
        total_consumption: parseFloat((meter.total_consumption + Math.random() * 0.5).toFixed(1))
      })));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleControl = async (meterName: string, action: string) => {
    if (!canControl) return;

    setControlLoading(`${meterName}-${action}`);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMeters(prev => prev.map(meter => {
        if (meter.name === meterName) {
          switch (action) {
            case 'enable':
              return { ...meter, status: 'online' as const };
            case 'disable':
              return { ...meter, status: 'offline' as const };
            case 'maintenance':
              return { ...meter, status: 'maintenance' as const };
            default:
              return meter;
          }
        }
        return meter;
      }));
    } catch (error) {
      console.error('Control failed:', error);
    } finally {
      setControlLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'from-green-500 to-emerald-500';
      case 'offline': return 'from-red-500 to-rose-500';
      case 'maintenance': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-400" />
            Energy Meter
          </h1>
          <p className="text-gray-400 mt-2">Voltage, current, power factor and consumption trends.</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm px-5 py-4 shadow-lg border border-yellow-500/30">
          <p className="text-sm text-gray-400">Total Consumption</p>
          <p className="text-xl text-white mt-2 font-mono">
            {meters.reduce((sum, meter) => sum + meter.total_consumption, 0).toFixed(1)} kWh
          </p>
        </div>
      </div>

      {/* Energy Meters Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {meters.map((meter) => (
          <div key={meter.name} className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700 hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-[1.02]">
            {/* Header with Equipment Graphic */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${meter.status === 'online' ? 'bg-yellow-500/20 animate-pulse' : 'bg-gray-700/50'}`}>
                  <Zap className={`h-6 w-6 ${meter.status === 'online' ? 'text-yellow-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-yellow-400 font-semibold">{meter.name}</p>
                  <p className="text-lg font-bold text-white">Energy Meter</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-lg bg-gradient-to-r ${getStatusColor(meter.status)} text-black`}>
                {meter.status.toUpperCase()}
              </span>
            </div>

            {/* Current Load */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 mb-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <p className="text-sm text-blue-400 font-medium">Current Load</p>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-white">{meter.current_load}</p>
                <p className="text-sm text-gray-400 mb-1">kW</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (meter.current_load / 100) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Total Consumption */}
            <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <p className="text-sm text-gray-400 font-medium">Total Consumption</p>
              </div>
              <p className="text-xl font-bold text-white">{meter.total_consumption.toFixed(1)} kWh</p>
            </div>

            {/* Control Buttons */}
            {canControl && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleControl(meter.name, 'enable')}
                  disabled={controlLoading === `${meter.name}-enable` || meter.status === 'online'}
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-2 text-white font-bold text-sm hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  {controlLoading === `${meter.name}-enable` ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mx-auto"></div>
                  ) : (
                    'ON'
                  )}
                </button>
                <button
                  onClick={() => handleControl(meter.name, 'disable')}
                  disabled={controlLoading === `${meter.name}-disable` || meter.status === 'offline'}
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3 py-2 text-white font-bold text-sm hover:from-red-500 hover:to-rose-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                >
                  {controlLoading === `${meter.name}-disable` ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mx-auto"></div>
                  ) : (
                    'OFF'
                  )}
                </button>
                <button
                  onClick={() => handleControl(meter.name, 'maintenance')}
                  disabled={controlLoading === `${meter.name}-maintenance` || meter.status === 'maintenance'}
                  className="flex-1 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 px-3 py-2 text-white font-bold text-sm hover:from-yellow-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25"
                >
                  {controlLoading === `${meter.name}-maintenance` ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mx-auto"></div>
                  ) : (
                    'MAINT'
                  )}
                </button>
              </div>
            )}

            {!canControl && (
              <div className="rounded-xl bg-gradient-to-r from-gray-700/50 to-slate-700/50 p-3 mt-4 border border-gray-600">
                <p className="text-center text-gray-400 text-xs">
                  <Settings className="h-4 w-4 inline mr-1" />
                  Control access restricted
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Consumption Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-yellow-500/20">
              <TrendingUp className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Consumption Trend</h2>
              <p className="text-gray-400 text-sm">Last 10 hours energy usage</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}
                />
                <Area type="monotone" dataKey="kwh" stroke="#fbbf24" fillOpacity={1} fill="url(#energyGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Stats Panel */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Gauge className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Live Meter Stats</h2>
              <p className="text-gray-400 text-sm">Real-time readings</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-400" />
                <p className="text-sm text-blue-400 font-medium">Voltage</p>
              </div>
              <p className="text-2xl font-bold text-white">{data[0]?.voltage?.toFixed(1) || '0.0'} <span className="text-sm text-gray-400">V</span></p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-green-400" />
                <p className="text-sm text-green-400 font-medium">Current</p>
              </div>
              <p className="text-2xl font-bold text-white">{data[0]?.current?.toFixed(1) || '0.0'} <span className="text-sm text-gray-400">A</span></p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4 text-purple-400" />
                <p className="text-sm text-purple-400 font-medium">Power Factor</p>
              </div>
              <p className="text-2xl font-bold text-white">{data[0]?.power_factor?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyMeter;