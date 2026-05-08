import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Fan, Thermometer, Users, Power, Settings, Zap, Home, Clock } from 'lucide-react';

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
          temperature: parseFloat((item.temperature + (Math.random() - 0.5) * 0.4).toFixed(1)),
        }))
      );
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleControl = async (fcuName: string, action: string) => {
    if (!canControl) return;
    setControlLoading(`${fcuName}-${action}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setData(prev => prev.map(fcu => {
        if (fcu.name === fcuName) {
          if (action === 'start') return { ...fcu, running_status: 'on' };
          if (action === 'stop') return { ...fcu, running_status: 'off' };
          if (action.startsWith('speed-')) return { ...fcu, speed_status: action.replace('speed-', '') };
        }
        return fcu;
      }));
    } finally {
      setControlLoading(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in zoom-in duration-700">
      {/* Visual Header */}
      <div className="relative h-48 md:h-64 rounded-[2.5rem] bg-gradient-to-r from-emerald-600 to-teal-700 overflow-hidden shadow-2xl">
         <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse"></div>
         </div>
         <div className="relative h-full flex flex-col justify-center px-10">
            <div className="flex items-center gap-4 mb-2">
               <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-xl">
                  <Home className="h-8 w-8 text-white" />
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white">Zone <span className="text-emerald-300">Comfort</span></h1>
            </div>
            <p className="text-emerald-50 text-lg font-medium">Precision Fan Coil Units for localized climate control.</p>
         </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <div key={item.name} className="group bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-3xl hover:shadow-emerald-500/5">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl transition-all duration-500 ${item.running_status === 'on' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                     <Fan className={`h-7 w-7 ${item.running_status === 'on' ? 'animate-spin-slow' : ''}`} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white">{item.name}</h3>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">FCU Terminal</p>
                  </div>
               </div>
               <div className={`h-3 w-3 rounded-full ${item.running_status === 'on' ? 'bg-emerald-500 animate-ping' : 'bg-slate-700'}`}></div>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 mb-8 relative overflow-hidden">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ambient Temp</span>
                  <Thermometer className="h-4 w-4 text-blue-400" />
               </div>
               <div className="flex items-end gap-1">
                  <p className="text-5xl font-black text-white">{item.temperature}</p>
                  <p className="text-slate-500 font-bold mb-2">°C</p>
               </div>
               <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000" 
                    style={{ width: `${((item.temperature - 18) / 10) * 100}%` }}
                  ></div>
               </div>
            </div>

            <div className="space-y-6 mb-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                     <Clock className="h-4 w-4" />
                     <span className="text-xs font-bold uppercase tracking-wider">Fan Speed</span>
                  </div>
                  <div className="flex gap-1.5">
                     {['low', 'medium', 'high'].map((s) => (
                        <button 
                          key={s}
                          onClick={() => handleControl(item.name, `speed-${s}`)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                            item.speed_status === s ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                           {s}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-3">
                     <Users className={`h-5 w-5 ${item.occupancy_status ? 'text-purple-400' : 'text-slate-600'}`} />
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Occupancy</span>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${item.occupancy_status ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-800 text-slate-500'}`}>
                     {item.occupancy_status ? 'OCCUPIED' : 'VACANT'}
                  </span>
               </div>
            </div>

            {canControl && (
               <div className="flex gap-3">
                  <button 
                    onClick={() => handleControl(item.name, item.running_status === 'on' ? 'stop' : 'start')}
                    disabled={controlLoading?.includes(item.name)}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${
                      item.running_status === 'on' 
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20' 
                        : 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500'
                    }`}
                  >
                     {controlLoading?.includes(item.name) ? '...' : item.running_status === 'on' ? 'SHUT DOWN' : 'POWER ON'}
                  </button>
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FCU;