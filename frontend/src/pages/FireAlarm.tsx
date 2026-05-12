import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Flame, Shield, Volume2, Activity, Bell, Radio, Zap } from 'lucide-react';
import api from '../services/api';

interface FireAlarmStatus {
  name: string;
  alarm_type: string;
  priority: string;
  message: string;
  acknowledged: boolean;
  timestamp: string;
  zone: string;
}

interface FireSystemStatus {
  panel_status: 'normal' | 'fault' | 'alarm';
  hooter_status: 'enabled' | 'disabled' | 'fault';
  detectors_active: number;
  total_detectors: number;
  zones: {
    name: string;
    status: 'normal' | 'alarm' | 'fault';
    last_check: string;
  }[];
}

const defaultStatus: FireAlarmStatus[] = [
  {
    name: 'Fire Alarm Panel',
    alarm_type: 'Smoke Detector',
    priority: 'high',
    message: 'Smoke detected in zone 3',
    acknowledged: false,
    timestamp: new Date().toISOString(),
    zone: 'Zone 3'
  }
];

const mockSystemStatus: FireSystemStatus = {
  panel_status: 'normal',
  hooter_status: 'enabled',
  detectors_active: 18,
  total_detectors: 20,
  zones: [
    { name: 'Zone 1 - Ground Floor', status: 'normal', last_check: '2 min ago' },
    { name: 'Zone 2 - First Floor', status: 'normal', last_check: '1 min ago' },
    { name: 'Zone 3 - Second Floor', status: 'alarm', last_check: '30 sec ago' },
    { name: 'Zone 4 - Basement', status: 'normal', last_check: '3 min ago' },
    { name: 'Zone 5 - Roof', status: 'normal', last_check: '5 min ago' }
  ]
};

const FireAlarm = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<FireAlarmStatus[]>(defaultStatus);
  const [systemStatus, setSystemStatus] = useState<FireSystemStatus>(mockSystemStatus);

  const canControl = user?.role === 'admin' || user?.role === 'operator';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/fire');
        if (Array.isArray(response.data)) {
          setStatus(response.data.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp).toLocaleString(),
            zone: item.zone || 'Unknown Zone'
          })));
        } else {
          setStatus(defaultStatus);
        }
      } catch (error) {
        setStatus(defaultStatus);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleControl = async (action: string) => {
    if (!canControl) return;
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (action === 'reset_system') {
      setSystemStatus(prev => ({ ...prev, panel_status: 'normal' }));
      setStatus([]);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Critical Status Header */}
      <div className={`relative h-64 md:h-80 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 ${
        systemStatus.panel_status === 'alarm' ? 'bg-rose-600 animate-pulse' : 'bg-slate-900 border border-white/5'
      }`}>
         <div className="absolute inset-0 opacity-20">
            <Radio className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] text-white opacity-10 animate-ping" />
         </div>
         <div className="relative h-full flex flex-col justify-center px-10 md:px-20">
            <div className="flex items-center gap-6 mb-6">
               <div className={`p-5 rounded-3xl backdrop-blur-xl border ${systemStatus.panel_status === 'alarm' ? 'bg-white/20 border-white/40' : 'bg-rose-500/20 border-rose-500/30'}`}>
                  <Flame className={`h-10 w-10 ${systemStatus.panel_status === 'alarm' ? 'text-white animate-bounce' : 'text-rose-500'}`} />
               </div>
               <div>
                  <h1 className="text-4xl md:text-6xl font-black text-white">Fire <span className={systemStatus.panel_status === 'alarm' ? 'text-white' : 'text-rose-500'}>Safety</span></h1>
                  <p className="text-white/60 font-black uppercase tracking-[0.3em] text-xs mt-2">Certified Protection Systems</p>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase text-white/50 mb-1">System Health</p>
                  <p className="text-2xl font-black text-white">{systemStatus.panel_status === 'normal' ? 'OPERATIONAL' : 'FAULT DETECTED'}</p>
               </div>
               <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase text-white/50 mb-1">Active Alerts</p>
                  <p className="text-2xl font-black text-white">{status.filter(s => !s.acknowledged).length}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Control Actions */}
      {canControl && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Silence Hooter', icon: Volume2, color: 'indigo', action: 'silence' },
             { label: 'Reset Panel', icon: Shield, color: 'rose', action: 'reset_system' },
             { label: 'System Test', icon: Activity, color: 'emerald', action: 'test_hooter' },
             { label: 'Manual Alarm', icon: Bell, color: 'amber', action: 'manual_alarm' }
           ].map((btn) => (
             <button
               key={btn.label}
               onClick={() => handleControl(btn.action)}
               className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-slate-900 border border-slate-800 hover:border-${btn.color}-500/50 transition-all hover:scale-105 active:scale-95 shadow-xl`}
             >
                <div className={`p-4 rounded-2xl bg-${btn.color}-500/10 text-${btn.color}-500 group-hover:bg-${btn.color}-500 group-hover:text-white transition-all`}>
                   <btn.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest">{btn.label}</span>
             </button>
           ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
         {/* Live Zones heat-style display */}
         <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3rem] p-10">
            <h2 className="text-2xl font-black text-white mb-8">Zone Awareness</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
               {systemStatus.zones.map((zone) => (
                  <div key={zone.name} className={`p-6 rounded-[2rem] border transition-all duration-500 ${
                     zone.status === 'alarm' ? 'bg-rose-600 text-white shadow-2xl shadow-rose-500/40 animate-pulse' :
                     'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}>
                     <p className="text-[10px] font-black uppercase opacity-60 mb-1">{zone.name}</p>
                     <p className="text-lg font-black tracking-tighter mb-4">{zone.status.toUpperCase()}</p>
                     <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${zone.status === 'alarm' ? 'bg-white' : 'bg-indigo-500'}`}></div>
                        <span className="text-[10px] font-bold opacity-60 uppercase">{zone.last_check}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Smoke Detector Health */}
         <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 flex flex-col justify-between">
            <div>
               <h2 className="text-2xl font-black text-white mb-4">Sensors</h2>
               <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                  Percentage of active smoke detectors across the entire facility network.
               </p>
               <div className="relative h-48 w-48 mx-auto mb-8">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-800" />
                     <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 80}
                        strokeDashoffset={2 * Math.PI * 80 * (1 - systemStatus.detectors_active/systemStatus.total_detectors)}
                        className="text-indigo-500" 
                     />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-4xl font-black text-white">{Math.round((systemStatus.detectors_active/systemStatus.total_detectors)*100)}%</span>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Online</span>
                  </div>
               </div>
            </div>
            <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
               <div className="flex items-center gap-3 mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Self-Diagnostic</span>
               </div>
               <p className="text-xs font-bold leading-relaxed">System performing auto-calibration of all smoke sensors. Status: OK.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FireAlarm;