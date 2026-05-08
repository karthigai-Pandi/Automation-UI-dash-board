import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Settings, Zap, Fuel, Thermometer, Gauge, Activity, Power, AlertTriangle, CheckCircle, Play, Square, RotateCcw } from 'lucide-react';

interface DGStatus {
  running_status: 'on' | 'off' | 'standby' | 'fault';
  fuel_level: number;
  voltage: number;
  frequency: number;
  engine_temp: number;
  oil_pressure: number;
  battery_voltage: number;
  runtime_hours: number;
  last_maintenance: string;
  next_maintenance: string;
}

const DG = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<DGStatus>({
    running_status: 'standby',
    fuel_level: 72.5,
    voltage: 0,
    frequency: 0,
    engine_temp: 25,
    oil_pressure: 0,
    battery_voltage: 24.5,
    runtime_hours: 1247.5,
    last_maintenance: '2024-12-15',
    next_maintenance: '2025-03-15'
  });
  const [controlLoading, setControlLoading] = useState<string | null>(null);

  const canControl = user?.role === 'admin' || user?.role === 'operator';

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((prev) => {
        const isRunning = prev.running_status === 'on';
        return {
          ...prev,
          fuel_level: Math.max(0, Math.min(100, parseFloat((prev.fuel_level - (isRunning ? Math.random() * 0.8 : 0)).toFixed(1)))),
          voltage: isRunning ? parseFloat((410 + Math.random() * 10).toFixed(1)) : 0,
          frequency: isRunning ? parseFloat((49.5 + Math.random() * 0.8).toFixed(2)) : 0,
          engine_temp: isRunning ? parseFloat((75 + Math.random() * 15).toFixed(1)) : parseFloat((25 + Math.random() * 5).toFixed(1)),
          oil_pressure: isRunning ? parseFloat((3.5 + Math.random() * 1).toFixed(1)) : 0,
          battery_voltage: parseFloat((24 + Math.random() * 1).toFixed(1)),
          runtime_hours: isRunning ? parseFloat((prev.runtime_hours + 0.0167).toFixed(1)) : prev.runtime_hours
        };
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleControl = async (action: string) => {
    if (!canControl) return;

    setControlLoading(action);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (action === 'start') {
        setStatus(prev => ({ ...prev, running_status: 'on' }));
      } else if (action === 'stop') {
        setStatus(prev => ({ ...prev, running_status: 'off' }));
      } else if (action === 'standby') {
        setStatus(prev => ({ ...prev, running_status: 'standby' }));
      }
    } catch (error) {
      console.error('Control failed:', error);
    } finally {
      setControlLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on': return 'from-green-500 to-emerald-500';
      case 'off': return 'from-gray-500 to-slate-500';
      case 'standby': return 'from-yellow-500 to-orange-500';
      case 'fault': return 'from-red-500 to-rose-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on': return <Activity className="h-6 w-6 text-green-400 animate-pulse" />;
      case 'off': return <Square className="h-6 w-6 text-gray-400" />;
      case 'standby': return <RotateCcw className="h-6 w-6 text-yellow-400" />;
      case 'fault': return <AlertTriangle className="h-6 w-6 text-red-400" />;
      default: return <Settings className="h-6 w-6 text-gray-400" />;
    }
  };

  const isNormalRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="h-8 w-8 text-purple-400" />
            DG Monitoring
          </h1>
          <p className="text-gray-400 mt-2">Diesel generator performance and fuel monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`rounded-3xl px-6 py-4 shadow-lg border bg-gradient-to-r ${getStatusColor(status.running_status)}`}>
            <div className="flex items-center gap-3">
              {getStatusIcon(status.running_status)}
              <div>
                <p className="text-sm text-black/70">Generator Status</p>
                <p className="text-lg font-bold text-black">{status.running_status.toUpperCase()}</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-5 py-4 shadow-lg border border-blue-500/30">
            <p className="text-sm text-gray-400">Runtime</p>
            <p className="text-lg font-bold text-white">{status.runtime_hours.toFixed(1)} <span className="text-sm text-gray-400">hrs</span></p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      {canControl && (
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => handleControl('start')}
            disabled={controlLoading === 'start' || status.running_status === 'on'}
            className="flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white font-bold hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/25"
          >
            {controlLoading === 'start' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b border-white"></div>
            ) : (
              <Play className="h-5 w-5" />
            )}
            Start Generator
          </button>
          <button
            onClick={() => handleControl('stop')}
            disabled={controlLoading === 'stop' || status.running_status === 'off'}
            className="flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 text-white font-bold hover:from-red-500 hover:to-rose-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-red-500/25"
          >
            {controlLoading === 'stop' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b border-white"></div>
            ) : (
              <Square className="h-5 w-5" />
            )}
            Stop Generator
          </button>
          <button
            onClick={() => handleControl('standby')}
            disabled={controlLoading === 'standby' || status.running_status === 'standby'}
            className="flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-4 text-white font-bold hover:from-yellow-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-yellow-500/25"
          >
            {controlLoading === 'standby' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b border-white"></div>
            ) : (
              <RotateCcw className="h-5 w-5" />
            )}
            Standby Mode
          </button>
        </div>
      )}

      {!canControl && (
        <div className="rounded-3xl bg-gradient-to-r from-gray-700/50 to-slate-700/50 p-4 border border-gray-600">
          <p className="text-center text-gray-400">
            <Settings className="h-4 w-4 inline mr-2" />
            Control access restricted to operators and administrators
          </p>
        </div>
      )}

      {/* Generator Parameters */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {/* Fuel Level */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-orange-500/20">
              <Fuel className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-400 font-semibold">Fuel Level</p>
              <p className="text-lg font-bold text-white">Diesel Generator</p>
            </div>
          </div>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-white">{status.fuel_level}%</p>
            <p className="text-sm text-gray-400 mt-1">Tank Capacity</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                status.fuel_level > 50 ? 'bg-gradient-to-r from-orange-400 to-yellow-400' :
                status.fuel_level > 25 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${status.fuel_level}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Empty</span>
            <span>Full</span>
          </div>
        </div>

        {/* Voltage */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-400 font-semibold">Voltage</p>
              <p className="text-lg font-bold text-white">Output</p>
            </div>
          </div>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-white">{status.voltage}</p>
            <p className="text-sm text-gray-400 mt-1">Volts</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isNormalRange(status.voltage, 400, 420) ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                status.voltage === 0 ? 'bg-gray-600' : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: status.voltage === 0 ? '0%' : `${Math.min(100, (status.voltage / 450) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0V</span>
            <span>450V</span>
          </div>
        </div>

        {/* Frequency */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700 hover:border-green-500/50 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-green-500/20">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-green-400 font-semibold">Frequency</p>
              <p className="text-lg font-bold text-white">Grid Sync</p>
            </div>
          </div>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-white">{status.frequency}</p>
            <p className="text-sm text-gray-400 mt-1">Hertz</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isNormalRange(status.frequency, 49, 51) ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                status.frequency === 0 ? 'bg-gray-600' : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: status.frequency === 0 ? '0%' : `${Math.min(100, (status.frequency / 55) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0Hz</span>
            <span>55Hz</span>
          </div>
        </div>

        {/* Engine Temperature */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700 hover:border-red-500/50 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-red-500/20">
              <Thermometer className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-red-400 font-semibold">Engine Temp</p>
              <p className="text-lg font-bold text-white">Cooling System</p>
            </div>
          </div>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-white">{status.engine_temp}°C</p>
            <p className="text-sm text-gray-400 mt-1">Operating Range</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isNormalRange(status.engine_temp, 70, 95) ? 'bg-gradient-to-r from-red-400 to-orange-400' :
                status.engine_temp < 70 ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-red-600 to-red-800'
              }`}
              style={{ width: `${Math.min(100, (status.engine_temp / 120) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0°C</span>
            <span>120°C</span>
          </div>
        </div>
      </div>

      {/* Additional Parameters */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Gauge className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Engine Parameters</h2>
              <p className="text-gray-400 text-sm">Oil pressure and battery status</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-r from-slate-950/60 to-gray-950/60 p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-purple-400" />
                  <p className="text-sm text-purple-400 font-medium">Oil Pressure</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isNormalRange(status.oil_pressure, 3, 5) ? 'bg-green-500/20 text-green-400' :
                  status.oil_pressure === 0 ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {status.oil_pressure === 0 ? 'OFF' : 'ON'}
                </span>
              </div>
              <p className="text-xl font-bold text-white">{status.oil_pressure} <span className="text-sm text-gray-400">bar</span></p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-slate-950/60 to-gray-950/60 p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Power className="h-4 w-4 text-yellow-400" />
                  <p className="text-sm text-yellow-400 font-medium">Battery Voltage</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isNormalRange(status.battery_voltage, 23, 26) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {isNormalRange(status.battery_voltage, 23, 26) ? 'OK' : 'LOW'}
                </span>
              </div>
              <p className="text-xl font-bold text-white">{status.battery_voltage} <span className="text-sm text-gray-400">V</span></p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-cyan-500/20">
              <CheckCircle className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Maintenance Status</h2>
              <p className="text-gray-400 text-sm">Service schedule and history</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-r from-slate-950/60 to-gray-950/60 p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-cyan-400 font-medium">Last Maintenance</p>
                <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">COMPLETED</span>
              </div>
              <p className="text-white font-semibold">{status.last_maintenance}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-slate-950/60 to-gray-950/60 p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-orange-400 font-medium">Next Maintenance</p>
                <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">SCHEDULED</span>
              </div>
              <p className="text-white font-semibold">{status.next_maintenance}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-indigo-500/20">
              <AlertTriangle className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">System Alerts</h2>
              <p className="text-gray-400 text-sm">Active warnings and notifications</p>
            </div>
          </div>
          <div className="space-y-3">
            {status.fuel_level < 25 && (
              <div className="rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 p-4 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-red-400 font-medium">Low Fuel Alert</p>
                </div>
                <p className="text-sm text-gray-300">Fuel level is critically low. Schedule refueling immediately.</p>
              </div>
            )}
            {status.engine_temp > 100 && (
              <div className="rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 p-4 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-red-400 font-medium">Overheat Warning</p>
                </div>
                <p className="text-sm text-gray-300">Engine temperature is above safe limits.</p>
              </div>
            )}
            {status.oil_pressure < 3 && status.running_status === 'on' && (
              <div className="rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <p className="text-sm text-yellow-400 font-medium">Oil Pressure Low</p>
                </div>
                <p className="text-sm text-gray-300">Check oil levels and pressure sensors.</p>
              </div>
            )}
            {status.fuel_level >= 25 && status.engine_temp <= 100 && (status.oil_pressure >= 3 || status.running_status !== 'on') && (
              <div className="rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <p className="text-sm text-green-400 font-medium">All Systems Normal</p>
                </div>
                <p className="text-sm text-gray-300">Generator is operating within expected parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DG;