import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Fan, Thermometer, Users, Power, Settings, Zap } from 'lucide-react';

interface FCUData {
  name: string;
  running_status: string;
  temperature: number;
  speed_status: string;
  occupancy_status: boolean;
}

const defaultData: FCUData[] = [
  { name: 'FCU-01', running_status: 'on', temperature: 24.2, speed_status: 'medium', occupancy_status: true },
  { name: 'FCU-02', running_status: 'off', temperature: 26.4, speed_status: 'low', occupancy_status: false },
  { name: 'FCU-03', running_status: 'on', temperature: 23.8, speed_status: 'high', occupancy_status: true }
];

const FCU = () => {
  const { user } = useAuth();
  const [data, setData] = useState<FCUData[]>(defaultData);
  const [controlLoading, setControlLoading] = useState<string | null>(null);

  const canControl = user?.role === 'admin' || user?.role === 'operator';

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((item) => ({
          ...item,
          running_status: Math.random() > 0.2 ? item.running_status : item.running_status === 'on' ? 'off' : 'on',
          temperature: parseFloat((item.temperature + (Math.random() - 0.5) * 0.8).toFixed(1)),
          speed_status: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          occupancy_status: Math.random() > 0.4
        }))
      );
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleControl = async (fcuName: string, action: string) => {
    if (!canControl) return;

    setControlLoading(`${fcuName}-${action}`);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setData(prev => prev.map(fcu => {
        if (fcu.name === fcuName) {
          switch (action) {
            case 'start':
              return { ...fcu, running_status: 'on' };
            case 'stop':
              return { ...fcu, running_status: 'off' };
            case 'speed-low':
              return { ...fcu, speed_status: 'low' };
            case 'speed-medium':
              return { ...fcu, speed_status: 'medium' };
            case 'speed-high':
              return { ...fcu, speed_status: 'high' };
            default:
              return fcu;
          }
        }
        return fcu;
      }));
    } catch (error) {
      console.error('Control failed:', error);
    } finally {
      setControlLoading(null);
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'low': return 'from-blue-500 to-cyan-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'high': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Fan className="h-8 w-8 text-green-400" />
            FCU Monitoring
          </h1>
          <p className="text-gray-400 mt-2">Fan coil units and occupancy control status.</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm px-5 py-4 shadow-lg border border-green-500/30">
          <p className="text-sm text-gray-400">Active Units</p>
          <p className="text-xl text-white mt-2 font-mono">{data.filter(fcu => fcu.running_status === 'on').length}/{data.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {data.map((item) => (
          <div key={item.name} className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700 hover:border-green-500/50 transition-all duration-300 transform hover:scale-[1.02]">
            {/* Header with Equipment Graphic */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${item.running_status === 'on' ? 'bg-green-500/20 animate-pulse' : 'bg-gray-700/50'}`}>
                  <Fan className={`h-8 w-8 ${item.running_status === 'on' ? 'text-green-400 animate-spin' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-green-400 font-semibold">{item.name}</p>
                  <h2 className="text-2xl font-bold text-white">Fan Coil Unit</h2>
                </div>
              </div>
              <span className={`text-sm px-4 py-2 rounded-full font-bold shadow-lg ${
                item.running_status === 'on'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black animate-pulse'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
              }`}>
                {item.running_status.toUpperCase()}
              </span>
            </div>

            {/* Temperature Display */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 mb-6 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="h-5 w-5 text-blue-400" />
                <p className="text-sm text-blue-400 font-medium">Room Temperature</p>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-white">{item.temperature}</p>
                <p className="text-xl text-gray-400 mb-1">°C</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                <div
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, ((item.temperature - 18) / 12) * 100))}%` }}
                ></div>
              </div>
            </div>

            {/* Fan Speed Control */}
            <div className="rounded-2xl bg-slate-950/60 p-4 mb-6 border border-slate-600">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-400" />
                <p className="text-sm text-gray-400 font-medium">Fan Speed</p>
              </div>
              <div className="flex items-center justify-between">
                <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getSpeedColor(item.speed_status)} text-black font-bold text-lg`}>
                  {item.speed_status.toUpperCase()}
                </div>
                <div className="flex gap-1">
                  {['low', 'medium', 'high'].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleControl(item.name, `speed-${speed}`)}
                      disabled={!canControl || controlLoading === `${item.name}-speed-${speed}`}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        item.speed_status === speed
                          ? `border-white bg-gradient-to-r ${getSpeedColor(speed)}`
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {controlLoading === `${item.name}-speed-${speed}` && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-white mx-auto"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Occupancy Status */}
            <div className="rounded-2xl bg-slate-950/60 p-4 mb-6 border border-slate-600">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-purple-400" />
                <p className="text-sm text-gray-400 font-medium">Occupancy Status</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                item.occupancy_status
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black'
                  : 'bg-gradient-to-r from-gray-600 to-slate-600 text-white'
              }`}>
                <div className={`w-3 h-3 rounded-full ${item.occupancy_status ? 'bg-black animate-pulse' : 'bg-white'}`}></div>
                {item.occupancy_status ? 'OCCUPIED' : 'VACANT'}
              </div>
            </div>

            {/* Control Buttons */}
            {canControl && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleControl(item.name, 'start')}
                  disabled={controlLoading === `${item.name}-start` || item.running_status === 'on'}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-white font-bold hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  {controlLoading === `${item.name}-start` ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    <>
                      <Power className="h-4 w-4 inline mr-2" />
                      START
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleControl(item.name, 'stop')}
                  disabled={controlLoading === `${item.name}-stop` || item.running_status === 'off'}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-white font-bold hover:from-red-500 hover:to-rose-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                >
                  {controlLoading === `${item.name}-stop` ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    <>
                      <Power className="h-4 w-4 inline mr-2" />
                      STOP
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

export default FCU;