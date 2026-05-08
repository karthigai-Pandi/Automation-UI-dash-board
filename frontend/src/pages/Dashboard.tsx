import { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Wind, Zap, AlertCircle, Clock, Building2, Map as MapIcon, ChevronRight } from 'lucide-react';

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
  { floor: 'Floor 1', status: 'normal', label: 'All systems stable', load: 45 },
  { floor: 'Floor 2', status: 'warning', label: 'Filter service due', load: 78 },
  { floor: 'Floor 3', status: 'alarm', label: 'AHU alarm active', load: 92 },
  { floor: 'Basement', status: 'normal', label: 'DG and meter stable', load: 12 }
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

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">System <span className="text-indigo-500">Overview</span></h1>
           <p className="text-slate-500 font-medium text-lg mt-2 italic">Monitoring the heartbeat of your infrastructure.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-[2rem] shadow-xl">
           <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Clock className="h-6 w-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Server Time</p>
              <p className="text-white font-black text-lg">{new Date().toLocaleTimeString()}</p>
           </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Connected AHUs', value: data?.ahuCount || 0, icon: Wind, color: 'indigo', trend: '+2% from yesterday' },
          { label: 'Active Load', value: data?.runningEquipment || 0, icon: Activity, color: 'emerald', trend: 'Systems nominal' },
          { label: 'Critical Alarms', value: data?.activeAlarms || 0, icon: AlertCircle, color: 'rose', trend: 'Immediate action needed' },
          { label: 'Daily Energy', value: `${data?.energyConsumption?.total?.toFixed(0) || '0'} kWh`, icon: Zap, color: 'amber', trend: 'Within target range' }
        ].map((kpi) => (
          <div key={kpi.label} className="group relative bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5 overflow-hidden">
             <div className={`absolute -top-12 -right-12 h-32 w-32 bg-${kpi.color}-500/5 rounded-full blur-3xl group-hover:bg-${kpi.color}-500/10 transition-colors`}></div>
             <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl bg-${kpi.color}-500/10 text-${kpi.color}-400`}>
                   <kpi.icon className="h-7 w-7" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-slate-400 transition-colors" />
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
             <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">{kpi.value}</h3>
             <p className={`text-[10px] font-bold text-${kpi.color}-500/80 uppercase`}>{kpi.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Floor Map Simulation */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <MapIcon className="h-6 w-6" />
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tight">Facility Heatmap</h2>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[8px] font-black text-emerald-500 uppercase">Normal</span>
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-[8px] font-black text-rose-500 uppercase">Fault</span>
                 </div>
              </div>
           </div>

           <div className="grid gap-6 sm:grid-cols-2 relative z-10">
             {floorStatus.map((floor) => (
               <div
                 key={floor.floor}
                 className={`group relative p-8 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] ${
                   floor.status === 'normal' ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50' :
                   floor.status === 'warning' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/50' :
                   'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/50'
                 }`}
               >
                 <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                       <Building2 className={`h-6 w-6 ${floor.status === 'normal' ? 'text-emerald-400' : floor.status === 'warning' ? 'text-amber-400' : 'text-rose-400'}`} />
                    </div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{floor.floor}</span>
                 </div>
                 <h4 className="text-2xl font-black text-white mb-2">{floor.status === 'normal' ? 'Healthy' : floor.status === 'warning' ? 'Tuning Req.' : 'Active Alarm'}</h4>
                 <p className="text-slate-500 text-sm font-medium mb-6">{floor.label}</p>
                 
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                       <span>Current Load</span>
                       <span>{floor.load}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${floor.status === 'normal' ? 'bg-emerald-500' : floor.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`}
                         style={{ width: `${floor.load}%` }}
                       ></div>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Intelligence Side Panel */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-2xl font-black text-white mb-8">Metrics Hub</h2>
              
              <div className="space-y-6">
                 {[
                   { label: 'Avg Temperature', value: `${data?.temperatureSummary?.average?.toFixed(1) || '0.0'}°C`, sub: 'Optimal Range 21-24°C', color: 'indigo' },
                   { label: 'Thermal Spread', value: `${(data?.temperatureSummary?.min ?? 0).toFixed(1)}° - ${(data?.temperatureSummary?.max ?? 0).toFixed(1)}°`, sub: 'Stable across all zones', color: 'emerald' },
                   { label: 'Energy Efficiency', value: `${data?.energyConsumption?.average?.toFixed(2) || '0.00'}`, sub: 'kWh per connected node', color: 'amber' }
                 ].map((metric) => (
                   <div key={metric.label} className="p-6 rounded-[2rem] bg-slate-950/50 border border-slate-800 hover:border-slate-600 transition-colors">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{metric.label}</p>
                      <h4 className="text-3xl font-black text-white mb-1 tracking-tighter">{metric.value}</h4>
                      <p className={`text-[10px] font-bold text-${metric.color}-500/80 uppercase`}>{metric.sub}</p>
                   </div>
                 ))}
              </div>

              <div className="mt-10 p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                 <h4 className="text-lg font-black mb-2">Smart Insights</h4>
                 <p className="text-xs text-white/80 font-medium leading-relaxed">
                    Based on current trends, we recommend lowering AHU discharge by 0.5°C to optimize tonight's cooling load.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;