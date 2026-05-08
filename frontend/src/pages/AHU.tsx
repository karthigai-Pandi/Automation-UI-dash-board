import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Fan, Thermometer, Wind, AlertTriangle, Power, Settings, Zap } from 'lucide-react';
import api from '../services/api';

interface AHUData {
  name: string;
  supply_temp: number;
  return_temp: number;
  fan_status: string;
  auto_manual: string;
  damper_percentage: number;
  filter_dirty: boolean;
  alarm_status: boolean;
}

const generateMockAHU = (): AHUData[] => [
  {
    name: 'AHU-01',
    supply_temp: 22.5 + Math.random() * 2,
    return_temp: 25.0 + Math.random() * 1.5,
    fan_status: Math.random() > 0.15 ? 'on' : 'off',
    auto_manual: Math.random() > 0.2 ? 'auto' : 'manual',
    damper_percentage: Math.floor(40 + Math.random() * 60),
    filter_dirty: Math.random() > 0.8,
    alarm_status: Math.random() > 0.85
  },
  {
    name: 'AHU-02',
    supply_temp: 21.8 + Math.random() * 2,
    return_temp: 24.3 + Math.random() * 1.5,
    fan_status: Math.random() > 0.2 ? 'on' : 'off',
    auto_manual: Math.random() > 0.3 ? 'auto' : 'manual',
    damper_percentage: Math.floor(35 + Math.random() * 60),
    filter_dirty: Math.random() > 0.7,
    alarm_status: Math.random() > 0.9
  }
];

const AHU = () => {
  const { user } = useAuth();
  const [ahuData, setAhuData] = useState<AHUData[]>([]);
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState<string | null>(null);

  const canControl = user?.role === 'admin' || user?.role === 'operator';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/ahu');
        setAhuData(response.data);
      } catch (error) {
        console.error('Failed to fetch AHU data:', error);
        setAhuData(generateMockAHU());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      setAhuData((prev) => prev.map((item) => ({
        ...item,
        supply_temp: parseFloat((item.supply_temp + (Math.random() - 0.5) * 0.5).toFixed(1)),
        return_temp: parseFloat((item.return_temp + (Math.random() - 0.5) * 0.4).toFixed(1)),
        damper_percentage: Math.min(100, Math.max(0, item.damper_percentage + (Math.random() > 0.5 ? 1 : -1))),
        filter_dirty: Math.random() > 0.92 ? !item.filter_dirty : item.filter_dirty,
        alarm_status: Math.random() > 0.9 ? !item.alarm_status : item.alarm_status
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleControl = async (ahuName: string, action: string) => {
    if (!canControl) return;

    setControlLoading(`${ahuName}-${action}`);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAhuData(prev => prev.map(ahu => {
        if (ahu.name === ahuName) {
          switch (action) {
            case 'start':
              return { ...ahu, fan_status: 'on' };
            case 'stop':
              return { ...ahu, fan_status: 'off' };
            case 'toggle-mode':
              return { ...ahu, auto_manual: ahu.auto_manual === 'auto' ? 'manual' : 'auto' };
            default:
              return ahu;
          }
        }
        return ahu;
      }));
    } catch (error) {
      console.error('Control failed:', error);
    } finally {
      setControlLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Fan className="h-8 w-8 text-blue-400" />
            AHU Monitoring
          </h1>
          <p className="text-gray-400 mt-2">Control and visualize AHU conditions across the building.</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm px-5 py-4 shadow-lg border border-blue-500/30">
          <p className="text-sm text-gray-400">Realtime status</p>
          <p className="text-xl text-white mt-2 font-mono">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {ahuData.map((ahu) => (
          <div key={ahu.name} className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-[1.02]">
            {/* Header with Equipment Graphic */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${ahu.fan_status === 'on' ? 'bg-blue-500/20 animate-pulse' : 'bg-gray-700/50'}`}>
                  <Fan className={`h-8 w-8 ${ahu.fan_status === 'on' ? 'text-blue-400 animate-spin' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-blue-400 font-semibold">{ahu.name}</p>
                  <h2 className="text-2xl font-bold text-white">Air Handling Unit</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ahu.alarm_status && (
                  <div className="animate-bounce">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                )}
                <span className={`text-sm px-4 py-2 rounded-full font-bold shadow-lg ${
                  ahu.alarm_status
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse'
                    : ahu.fan_status === 'on'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                }`}>
                  {ahu.alarm_status ? 'ALARM' : ahu.fan_status === 'on' ? 'RUNNING' : 'STOPPED'}
                </span>
              </div>
            </div>

            {/* Temperature Readings */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="h-5 w-5 text-blue-400" />
                  <p className="text-sm text-blue-400 font-medium">Supply Air</p>
                </div>
                <p className="text-3xl font-bold text-white">{ahu.supply_temp}°C</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (ahu.supply_temp / 30) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="h-5 w-5 text-orange-400" />
                  <p className="text-sm text-orange-400 font-medium">Return Air</p>
                </div>
                <p className="text-3xl font-bold text-white">{ahu.return_temp}°C</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (ahu.return_temp / 30) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <p className="text-sm text-gray-400">Fan Status</p>
                </div>
                <p className={`text-xl font-bold ${ahu.fan_status === 'on' ? 'text-green-400' : 'text-red-400'}`}>
                  {ahu.fan_status.toUpperCase()}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-5 w-5 text-purple-400" />
                  <p className="text-sm text-gray-400">Control Mode</p>
                </div>
                <p className={`text-xl font-bold ${ahu.auto_manual === 'auto' ? 'text-blue-400' : 'text-orange-400'}`}>
                  {ahu.auto_manual.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-600">
                <p className="text-sm text-gray-400 mb-2">Damper Position</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${ahu.damper_percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-white">{ahu.damper_percentage}%</span>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-600">
                <p className="text-sm text-gray-400 mb-2">Filter Status</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                  ahu.filter_dirty
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-black'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${ahu.filter_dirty ? 'bg-black' : 'bg-black'}`}></div>
                  {ahu.filter_dirty ? 'DIRTY' : 'CLEAN'}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            {canControl && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleControl(ahu.name, 'start')}
                  disabled={controlLoading === `${ahu.name}-start` || ahu.fan_status === 'on'}
                  className="flex-1 min-w-0 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-white font-bold hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  {controlLoading === `${ahu.name}-start` ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    <>
                      <Power className="h-4 w-4 inline mr-2" />
                      START
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleControl(ahu.name, 'stop')}
                  disabled={controlLoading === `${ahu.name}-stop` || ahu.fan_status === 'off'}
                  className="flex-1 min-w-0 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-white font-bold hover:from-red-500 hover:to-rose-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                >
                  {controlLoading === `${ahu.name}-stop` ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    <>
                      <Power className="h-4 w-4 inline mr-2" />
                      STOP
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleControl(ahu.name, 'toggle-mode')}
                  disabled={controlLoading === `${ahu.name}-toggle-mode`}
                  className="flex-1 min-w-0 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-white font-bold hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                >
                  {controlLoading === `${ahu.name}-toggle-mode` ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 inline mr-2" />
                      {ahu.auto_manual === 'auto' ? 'MANUAL' : 'AUTO'}
                    </>
                  )}
                </button>
              </div>
            )}

            {!canControl && (
              <div className="rounded-2xl bg-gradient-to-r from-gray-700/50 to-slate-700/50 p-4 border border-gray-600">
                <p className="text-center text-gray-400">
                  <Settings className="h-5 w-5 inline mr-2" />
                  Control access restricted to operators and administrators
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AHU;