import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Settings, Zap, Thermometer, Gauge, Activity, AlertTriangle, CheckCircle, Play, Square, Clock, ShieldCheck } from 'lucide-react';

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
          fuel_level: Math.max(0, Math.min(100, parseFloat((prev.fuel_level - (isRunning ? Math.random() * 0.2 : 0)).toFixed(1)))),
          voltage: isRunning ? parseFloat((410 + Math.random() * 10).toFixed(1)) : 0,
          frequency: isRunning ? parseFloat((49.5 + Math.random() * 0.8).toFixed(2)) : 0,
          engine_temp: isRunning ? parseFloat((75 + Math.random() * 15).toFixed(1)) : parseFloat((25 + Math.random() * 5).toFixed(1)),
          oil_pressure: isRunning ? parseFloat((3.5 + Math.random() * 1).toFixed(1)) : 0,
          battery_voltage: parseFloat((24 + Math.random() * 1).toFixed(1)),
          runtime_hours: isRunning ? parseFloat((prev.runtime_hours + 0.01).toFixed(1)) : prev.runtime_hours
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleControl = async (action: string) => {
    if (!canControl) return;

    setControlLoading(action);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (action === 'start') setStatus(prev => ({ ...prev, running_status: 'on' }));
      else if (action === 'stop') setStatus(prev => ({ ...prev, running_status: 'off' }));
      else if (action === 'standby') setStatus(prev => ({ ...prev, running_status: 'standby' }));
    } catch (error) {
      console.error('Control failed:', error);
    } finally {
      setControlLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on': return 'from-emerald-500 to-green-600 shadow-green-500/50';
      case 'off': return 'from-slate-600 to-gray-700 shadow-gray-500/50';
      case 'standby': return 'from-amber-500 to-orange-600 shadow-amber-500/50';
      case 'fault': return 'from-rose-500 to-red-600 shadow-red-500/50';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Section with Image and Main Status */}
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
          <img 
            src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2070" 
            alt="Diesel Generator"
            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30">
                <Settings className="h-8 w-8 text-indigo-400 animate-spin-slow" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                DG <span className="text-indigo-400">Unit 01</span>
              </h1>
            </div>
            <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
              Main power backup system for the facility. Real-time monitoring of fuel, load, and engine health with automated failover management.
            </p>
            
            {/* Control Panel Integrated in Hero */}
            {canControl && (
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => handleControl('start')}
                  disabled={controlLoading === 'start' || status.running_status === 'on'}
                  className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:grayscale overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Play className={`h-5 w-5 ${controlLoading === 'start' ? 'animate-spin' : ''}`} />
                  <span>START SYSTEM</span>
                </button>
                <button
                  onClick={() => handleControl('stop')}
                  disabled={controlLoading === 'stop' || status.running_status === 'off'}
                  className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-400 transition-all duration-300 disabled:opacity-50 overflow-hidden"
                >
                   <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Square className={`h-5 w-5 ${controlLoading === 'stop' ? 'animate-pulse' : ''}`} />
                  <span>EMERGENCY STOP</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <div className={`relative p-8 rounded-[2rem] bg-gradient-to-br ${getStatusColor(status.running_status)} transition-all duration-500 shadow-2xl`}>
              <div className="absolute -top-4 -right-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg animate-bounce">
                   <ShieldCheck className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 rounded-full bg-black/20">
                    <Activity className={`h-8 w-8 text-white ${status.running_status === 'on' ? 'animate-pulse' : ''}`} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-black/60 uppercase tracking-widest">Live Status</p>
                    <p className="text-3xl font-black text-white tracking-widest">{status.running_status.toUpperCase()}</p>
                 </div>
              </div>
              <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                 <div className={`h-full bg-white/40 ${status.running_status === 'on' ? 'animate-progress-fast' : 'w-0'}`}></div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center">
                <p className="text-xs text-white/60 uppercase font-bold mb-1">Runtime</p>
                <p className="text-2xl font-black text-white">{status.runtime_hours.toFixed(1)}h</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center">
                <p className="text-xs text-white/60 uppercase font-bold mb-1">Fuel</p>
                <p className="text-2xl font-black text-white">{status.fuel_level}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Parameters Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Voltage', value: status.voltage, unit: 'V', icon: Zap, color: 'blue', range: [400, 420] },
          { label: 'Frequency', value: status.frequency, unit: 'Hz', icon: Activity, color: 'green', range: [49.5, 50.5] },
          { label: 'Temp', value: status.engine_temp, unit: '°C', icon: Thermometer, color: 'orange', range: [70, 95] },
          { label: 'Oil PSI', value: status.oil_pressure, unit: 'bar', icon: Gauge, color: 'purple', range: [3, 5] },
        ].map((param) => (
          <div key={param.label} className="group bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-2xl bg-${param.color}-500/10`}>
                <param.icon className={`h-6 w-6 text-${param.color}-400`} />
              </div>
              <div className={`h-2 w-2 rounded-full ${status.running_status === 'on' ? 'bg-green-500 animate-ping' : 'bg-slate-600'}`}></div>
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{param.label}</p>
            <div className="flex items-end gap-2 mt-2">
              <h3 className="text-4xl font-black text-white">{param.value}</h3>
              <span className="text-slate-500 font-bold mb-1">{param.unit}</span>
            </div>
            <div className="mt-6 space-y-2">
               <div className="flex justify-between text-xs font-bold text-slate-500">
                 <span>{param.range[0]}{param.unit}</span>
                 <span>{param.range[1]}{param.unit}</span>
               </div>
               <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${param.color}-500 transition-all duration-1000 ease-out`}
                    style={{ width: status.running_status === 'on' ? '75%' : '0%' }}
                  ></div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Maintenance Log */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10">
                 <Clock className="h-6 w-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Maintenance Schedule</h2>
            </div>
            <button className="px-6 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold hover:bg-indigo-500/20 transition-colors">
              VIEW HISTORY
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative group p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/30 transition-all">
              <p className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Last Service</p>
              <h4 className="text-2xl font-bold text-white mb-2">{status.last_maintenance}</h4>
              <p className="text-slate-500">Full engine diagnostics and oil filter replacement completed successfully.</p>
              <div className="absolute top-6 right-6">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <div className="relative group p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/30 transition-all">
              <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-4">Next Service</p>
              <h4 className="text-2xl font-bold text-white mb-2">{status.next_maintenance}</h4>
              <p className="text-slate-500">Scheduled 500-hour fuel injector cleaning and battery load testing.</p>
              <div className="absolute top-6 right-6">
                <AlertTriangle className="h-6 w-6 text-amber-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 scale-150">
            <ShieldCheck className="h-48 w-48" />
          </div>
          <h2 className="text-2xl font-black mb-6">System Health</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between font-bold mb-2">
                <span>Fuel Reservoir</span>
                <span>{status.fuel_level}%</span>
              </div>
              <div className="h-3 w-full bg-white/20 rounded-full">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000" 
                  style={{ width: `${status.fuel_level}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold mb-2">
                <span>Battery Efficiency</span>
                <span>94%</span>
              </div>
              <div className="h-3 w-full bg-white/20 rounded-full">
                <div className="h-full bg-white rounded-full w-[94%]"></div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="font-black">All Systems Nominal</p>
                    <p className="text-sm text-white/70">No active faults detected</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DG;