import { useEffect, useState } from 'react';
import { Zap, Activity, Gauge, TrendingUp, Cpu, BatteryCharging } from 'lucide-react';
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
  Array.from({ length: 12 }, (_, index) => ({
    timestamp: new Date(Date.now() - (11 - index) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    kwh: 90 + Math.random() * 40,
    voltage: 400 + Math.random() * 10,
    current: 8 + Math.random() * 5,
    power_factor: 0.85 + Math.random() * 0.12
  }));

const mockMeters: MeterStatus[] = [
  { name: 'Main Power', status: 'online', total_consumption: 1250.5, current_load: 85.2 },
  { name: 'Zone A', status: 'online', total_consumption: 450.8, current_load: 32.1 },
  { name: 'Zone B', status: 'online', total_consumption: 380.3, current_load: 28.7 },
  { name: 'HVAC Plant', status: 'online', total_consumption: 320.2, current_load: 45.6 }
];

const EnergyMeter = () => {
  const [data, setData] = useState<EnergyReading[]>(generateMockEnergy());
  const [meters] = useState<MeterStatus[]>(mockMeters);

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
        setData(generateMockEnergy());
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Premium Energy Hero */}
      <div className="relative h-64 md:h-80 rounded-[3rem] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl group">
         <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent"></div>
         <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="h-64 w-64 text-yellow-400 rotate-12" />
         </div>
         <div className="relative h-full flex flex-col justify-center px-10 md:px-20">
            <div className="flex items-center gap-4 mb-4">
               <div className="p-4 rounded-3xl bg-yellow-500 text-black shadow-2xl shadow-yellow-500/40">
                  <Cpu className="h-8 w-8" />
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-white">Power <span className="text-yellow-400">Analytics</span></h1>
            </div>
            <p className="max-w-2xl text-slate-400 text-lg font-medium leading-relaxed">
               Advanced energy monitoring system. Real-time visualization of electrical parameters, consumption trends, and load distribution.
            </p>
         </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {meters.map((meter) => (
          <div key={meter.name} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-yellow-500/50 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
               <div className={`p-3 rounded-2xl ${meter.status === 'online' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-800 text-slate-500'}`}>
                  <Zap className="h-6 w-6" />
               </div>
               <div className={`h-2 w-2 rounded-full ${meter.status === 'online' ? 'bg-yellow-500 animate-ping' : 'bg-slate-600'}`}></div>
            </div>
            <h3 className="text-xl font-black text-white mb-1">{meter.name}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Active Load Monitor</p>
            
            <div className="flex items-end gap-2 mb-6">
               <p className="text-4xl font-black text-white">{meter.current_load}</p>
               <span className="text-slate-500 font-bold mb-1">kW</span>
            </div>

            <div className="space-y-4">
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (meter.current_load / 120) * 100)}%` }}
                  ></div>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                  <span>TOTAL: {meter.total_consumption} kWh</span>
                  <span className={meter.status === 'online' ? 'text-emerald-500' : 'text-rose-500'}>{meter.status.toUpperCase()}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analysis Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h2 className="text-3xl font-black text-white tracking-tight">Consumption Trend</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">24-Hour Historical View</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                 <TrendingUp className="h-6 w-6" />
              </div>
           </div>
           
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <AreaChart data={data}>
                    <defs>
                       <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="timestamp" stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '20px' }}
                    />
                    <Area type="monotone" dataKey="kwh" stroke="#fbbf24" strokeWidth={4} fill="url(#colorKwh)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Activity className="h-48 w-48" />
              </div>
              <h3 className="text-2xl font-black mb-8">Grid Parameters</h3>
              <div className="space-y-8">
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black uppercase text-white/60 mb-1">Voltage L-N</p>
                       <p className="text-3xl font-black">{data[data.length-1]?.voltage?.toFixed(1) || '400.2'} V</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                       <Zap className="h-6 w-6" />
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black uppercase text-white/60 mb-1">Frequency</p>
                       <p className="text-3xl font-black">50.02 Hz</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                       <Activity className="h-6 w-6" />
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black uppercase text-white/60 mb-1">Power Factor</p>
                       <p className="text-3xl font-black">{data[data.length-1]?.power_factor?.toFixed(2) || '0.92'}</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                       <Gauge className="h-6 w-6" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <BatteryCharging className="h-6 w-6" />
                 </div>
                 <h4 className="text-lg font-black text-white">Efficiency</h4>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                 The facility is currently operating at 94% power efficiency. No reactive power penalties detected in the last billing cycle.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyMeter;