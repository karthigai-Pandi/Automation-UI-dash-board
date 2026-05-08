import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Flame, AlertTriangle, Shield, Volume2, VolumeX, CheckCircle, XCircle, Settings, Activity, Bell } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState<string | null>(null);

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
          console.warn('Expected array for fire alerts, received:', response.data);
          setStatus(defaultStatus);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleControl = async (action: string) => {
    if (!canControl) return;

    setControlLoading(action);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (action === 'acknowledge_all') {
        setStatus(prev => prev.map(item => ({ ...item, acknowledged: true })));
      } else if (action === 'test_hooter') {
        // Simulate hooter test
        console.log('Hooter test initiated');
      } else if (action === 'reset_system') {
        setSystemStatus(prev => ({ ...prev, panel_status: 'normal' }));
        setStatus([]);
      }
    } catch (error) {
      console.error('Control failed:', error);
    } finally {
      setControlLoading(null);
    }
  };

  const acknowledgeAlarm = async (alarmIndex: number) => {
    if (!canControl) return;

    try {
      setStatus(prev => prev.map((alarm, index) =>
        index === alarmIndex ? { ...alarm, acknowledged: true } : alarm
      ));
    } catch (error) {
      console.error('Failed to acknowledge alarm:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-rose-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getZoneStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'from-green-500 to-emerald-500';
      case 'alarm': return 'from-red-500 to-rose-500';
      case 'fault': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Flame className="h-8 w-8 text-red-400" />
            Fire Alarm System
          </h1>
          <p className="text-gray-400 mt-2">Monitor smoke detectors, hooter status, and fire zone alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`rounded-3xl px-5 py-3 shadow-lg border ${
            systemStatus.panel_status === 'normal'
              ? 'bg-gradient-to-r from-green-500/20 border-green-500/30'
              : systemStatus.panel_status === 'alarm'
              ? 'bg-gradient-to-r from-red-500/20 border-red-500/30'
              : 'bg-gradient-to-r from-yellow-500/20 border-yellow-500/30'
          }`}>
            <p className="text-sm text-gray-400">Panel Status</p>
            <p className={`text-lg font-bold ${
              systemStatus.panel_status === 'normal' ? 'text-green-400' :
              systemStatus.panel_status === 'alarm' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {systemStatus.panel_status.toUpperCase()}
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-r from-orange-500/20 to-red-500/20 px-5 py-3 shadow-lg border border-orange-500/30">
            <p className="text-sm text-gray-400">Active Alarms</p>
            <p className="text-lg font-bold text-orange-400">{status.filter(s => !s.acknowledged).length}</p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      {canControl && (
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => handleControl('acknowledge_all')}
            disabled={controlLoading === 'acknowledge_all'}
            className="flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white font-bold hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/25"
          >
            {controlLoading === 'acknowledge_all' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b border-white"></div>
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            Acknowledge All
          </button>
          <button
            onClick={() => handleControl('test_hooter')}
            disabled={controlLoading === 'test_hooter'}
            className="flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 text-white font-bold hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25"
          >
            {controlLoading === 'test_hooter' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b border-white"></div>
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
            Test Hooter
          </button>
          <button
            onClick={() => handleControl('reset_system')}
            disabled={controlLoading === 'reset_system'}
            className="flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white font-bold hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25"
          >
            {controlLoading === 'reset_system' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b border-white"></div>
            ) : (
              <Settings className="h-5 w-5" />
            )}
            Reset System
          </button>
        </div>
      )}

      {/* Fire Alarm Zones */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-red-500/20">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Fire Zones Status</h2>
              <p className="text-gray-400 text-sm">Real-time zone monitoring</p>
            </div>
          </div>
          <div className="space-y-4">
            {systemStatus.zones.map((zone) => (
              <div key={zone.name} className="rounded-2xl bg-slate-950/60 p-4 border border-slate-600 hover:border-slate-500 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      zone.status === 'normal' ? 'bg-green-500' :
                      zone.status === 'alarm' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-white font-medium">{zone.name}</span>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold bg-gradient-to-r ${getZoneStatusColor(zone.status)} text-black`}>
                    {zone.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Last check: {zone.last_check}</span>
                  {zone.status === 'alarm' && (
                    <div className="flex items-center gap-1 text-red-400">
                      <Bell className="h-4 w-4" />
                      <span className="text-xs">ALARM ACTIVE</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Components */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">System Components</h2>
              <p className="text-gray-400 text-sm">Equipment status overview</p>
            </div>
          </div>
          <div className="space-y-4">
            {/* MCP Panel */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-950/60 to-gray-950/60 p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    systemStatus.panel_status === 'normal' ? 'bg-green-500/20' :
                    systemStatus.panel_status === 'alarm' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <Shield className={`h-5 w-5 ${
                      systemStatus.panel_status === 'normal' ? 'text-green-400' :
                      systemStatus.panel_status === 'alarm' ? 'text-red-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">MCP Panel</p>
                    <p className="text-sm text-gray-400">Main Control Panel</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                  systemStatus.panel_status === 'normal' ? 'bg-green-500/20 text-green-400' :
                  systemStatus.panel_status === 'alarm' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {systemStatus.panel_status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Hooter */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-950/60 to-gray-950/60 p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    systemStatus.hooter_status === 'enabled' ? 'bg-green-500/20' :
                    systemStatus.hooter_status === 'disabled' ? 'bg-gray-500/20' : 'bg-yellow-500/20'
                  }`}>
                    {systemStatus.hooter_status === 'enabled' ? (
                      <Volume2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">Hooter System</p>
                    <p className="text-sm text-gray-400">Alarm Sound System</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                  systemStatus.hooter_status === 'enabled' ? 'bg-green-500/20 text-green-400' :
                  systemStatus.hooter_status === 'disabled' ? 'bg-gray-500/20 text-gray-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {systemStatus.hooter_status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Smoke Detectors */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-950/60 to-gray-950/60 p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Flame className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Smoke Detectors</p>
                    <p className="text-sm text-gray-400">Detection Sensors</p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-blue-500/20 text-blue-400">
                  {systemStatus.detectors_active}/{systemStatus.total_detectors} ACTIVE
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(systemStatus.detectors_active / systemStatus.total_detectors) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Fire Alerts */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Recent Fire Alerts</h2>
              <p className="text-gray-400 text-sm">Active and acknowledged alarms</p>
            </div>
          </div>
          <span className="text-sm uppercase tracking-[0.16em] text-orange-400 font-semibold">{status.length} Total Alerts</span>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading alerts...</p>
            </div>
          ) : status.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400">No active fire alarms</p>
            </div>
          ) : (
            status.map((item, index) => (
              <div key={item.name + item.timestamp} className={`rounded-2xl p-5 border transition-all duration-300 ${
                item.acknowledged
                  ? 'bg-slate-950/40 border-slate-600'
                  : `bg-gradient-to-r ${getPriorityColor(item.priority)}/10 border-current/30`
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      item.acknowledged ? 'bg-gray-500/20' : `bg-gradient-to-r ${getPriorityColor(item.priority)}/20`
                    }`}>
                      <Flame className={`h-5 w-5 ${
                        item.acknowledged ? 'text-gray-400' : 'text-current'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{item.name} - {item.zone}</p>
                      <h3 className="text-white text-lg font-semibold">{item.alarm_type}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold bg-gradient-to-r ${getPriorityColor(item.priority)} text-black`}>
                      {item.priority.toUpperCase()}
                    </span>
                    {item.acknowledged ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{item.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{item.timestamp}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.acknowledged ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                    </span>
                    {!item.acknowledged && canControl && (
                      <button
                        onClick={() => acknowledgeAlarm(index)}
                        className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FireAlarm;