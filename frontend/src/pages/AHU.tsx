import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Fan, Thermometer, Wind, Droplets, Gauge } from 'lucide-react';
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
    supply_temp: 22.5,
    return_temp: 25.0,
    fan_status: 'on',
    auto_manual: 'auto',
    damper_percentage: 65,
    filter_dirty: false,
    alarm_status: false
  },
  {
    name: 'AHU-02',
    supply_temp: 21.8,
    return_temp: 24.3,
    fan_status: 'off',
    auto_manual: 'manual',
    damper_percentage: 45,
    filter_dirty: true,
    alarm_status: false
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
        if (Array.isArray(response.data)) {
          setAhuData(response.data);
        } else {
          setAhuData(generateMockAHU());
        }
      } catch (error) {
        setAhuData(generateMockAHU());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      setAhuData((prev) => prev.map((item) => ({
        ...item,
        supply_temp: parseFloat((item.supply_temp + (Math.random() - 0.5) * 0.2).toFixed(1)),
        return_temp: parseFloat((item.return_temp + (Math.random() - 0.5) * 0.2).toFixed(1)),
        damper_percentage: Math.min(100, Math.max(0, item.damper_percentage + (Math.random() > 0.5 ? 1 : -1))),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleControl = async (ahuName: string, action: string) => {
    if (!canControl) return;
    setControlLoading(`${ahuName}-${action}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAhuData(prev => prev.map(ahu => {
        if (ahu.name === ahuName) {
          if (action === 'start') return { ...ahu, fan_status: 'on' };
          if (action === 'stop') return { ...ahu, fan_status: 'off' };
          if (action === 'toggle-mode') return { ...ahu, auto_manual: ahu.auto_manual === 'auto' ? 'manual' : 'auto' };
        }
        return ahu;
      }));
    } finally {
      setControlLoading(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 rounded-[3rem] overflow-hidden group shadow-2xl border border-white/10">
         <img 
           src="https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=2070" 
           className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
           alt="HVAC"
         />
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
         <div className="relative h-full flex flex-col justify-center px-8 md:px-16">
            <div className="flex items-center gap-4 mb-4">
               <div className="p-3 rounded-2xl bg-indigo-500/20 backdrop-blur-md">
                  <Wind className="h-8 w-8 text-indigo-400 animate-pulse" />
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-white">HVAC <span className="text-indigo-500">Air Control</span></h1>
            </div>
            <p className="max-w-xl text-slate-300 text-lg font-medium leading-relaxed">
               Advanced Air Handling Units monitoring. Precise control over temperature, humidity, and ventilation for optimal building comfort.
            </p>
         </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {ahuData.map((ahu) => (
          <div key={ahu.name} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-indigo-500/50 transition-all duration-500 hover:shadow-3xl hover:shadow-indigo-500/5 overflow-hidden">
            {/* Subtle background glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] transition-colors duration-1000 ${ahu.fan_status === 'on' ? 'bg-indigo-500/20' : 'bg-slate-500/10'}`}></div>

            <div className="flex items-start justify-between mb-10">
              <div className="flex gap-5">
                <div className={`p-5 rounded-3xl transition-all duration-500 ${ahu.fan_status === 'on' ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/40 animate-spin-slow' : 'bg-slate-800 text-slate-500'}`}>
                  <Fan className="h-10 w-10" />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-white tracking-tight">{ahu.name}</h3>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Air Handling Unit</p>
                </div>
              </div>
              <div className={`px-6 py-2 rounded-2xl font-black text-sm tracking-widest shadow-xl transition-all duration-500 ${
                ahu.alarm_status ? 'bg-rose-500 text-white animate-pulse' :
                ahu.fan_status === 'on' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {ahu.alarm_status ? 'CRITICAL ALARM' : ahu.fan_status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-indigo-400">
                   <Thermometer className="h-5 w-5" />
                   <span className="font-black text-xs uppercase">Supply Air</span>
                </div>
                <div className="flex items-end gap-1">
                   <p className="text-4xl font-black text-white">{ahu.supply_temp}</p>
                   <p className="text-slate-500 font-bold mb-1">°C</p>
                </div>
              </div>
              <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-amber-400">
                   <Droplets className="h-5 w-5" />
                   <span className="font-black text-xs uppercase">Return Air</span>
                </div>
                <div className="flex items-end gap-1">
                   <p className="text-4xl font-black text-white">{ahu.return_temp}</p>
                   <p className="text-slate-500 font-bold mb-1">°C</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3 text-emerald-400">
                       <Gauge className="h-5 w-5" />
                       <span className="font-black text-xs uppercase">Damper Position</span>
                    </div>
                    <span className="text-xl font-black text-white">{ahu.damper_percentage}%</span>
                 </div>
                 <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000"
                      style={{ width: `${ahu.damper_percentage}%` }}
                    ></div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className={`flex-1 p-4 rounded-2xl bg-slate-950/50 border transition-colors ${ahu.filter_dirty ? 'border-rose-500/50 text-rose-400' : 'border-emerald-500/50 text-emerald-400'}`}>
                    <p className="text-[10px] font-black uppercase mb-1">Filter Status</p>
                    <p className="text-lg font-black tracking-widest">{ahu.filter_dirty ? 'DIRTY' : 'CLEAN'}</p>
                 </div>
                 <div className={`flex-1 p-4 rounded-2xl bg-slate-950/50 border transition-colors ${ahu.auto_manual === 'auto' ? 'border-indigo-500/50 text-indigo-400' : 'border-amber-500/50 text-amber-400'}`}>
                    <p className="text-[10px] font-black uppercase mb-1">Control Mode</p>
                    <p className="text-lg font-black tracking-widest">{ahu.auto_manual.toUpperCase()}</p>
                 </div>
              </div>
            </div>

            {canControl && (
              <div className="grid grid-cols-3 gap-3 mt-10">
                <button 
                  onClick={() => handleControl(ahu.name, 'start')}
                  disabled={controlLoading === `${ahu.name}-start` || ahu.fan_status === 'on'}
                  className="p-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg hover:shadow-indigo-500/20"
                >
                  {controlLoading === `${ahu.name}-start` ? <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin mx-auto rounded-full"></div> : 'START'}
                </button>
                <button 
                   onClick={() => handleControl(ahu.name, 'stop')}
                   disabled={controlLoading === `${ahu.name}-stop` || ahu.fan_status === 'off'}
                   className="p-4 rounded-2xl bg-slate-800 text-white font-black hover:bg-slate-700 disabled:opacity-50 transition-all"
                >
                  {controlLoading === `${ahu.name}-stop` ? <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin mx-auto rounded-full"></div> : 'STOP'}
                </button>
                <button 
                  onClick={() => handleControl(ahu.name, 'toggle-mode')}
                  className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 font-black hover:bg-indigo-500/20 border border-indigo-500/30 transition-all"
                >
                  {ahu.auto_manual === 'auto' ? 'MANUAL' : 'AUTO'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AHU;