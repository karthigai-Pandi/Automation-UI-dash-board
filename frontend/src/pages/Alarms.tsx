import { useEffect, useState } from 'react';
import api from '../services/api';

interface AlarmEntry {
  id: number;
  equipment_name: string;
  alarm_type: string;
  priority: string;
  message: string;
  acknowledged: boolean;
  timestamp: string;
}

const Alarms = () => {
  const [alarms, setAlarms] = useState<AlarmEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const response = await api.get('/alarms');
        setAlarms(response.data.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp).toLocaleString() })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlarms();
  }, []);

  const acknowledge = async (id: number) => {
    try {
      await api.patch(`/alarms/${id}/acknowledge`);
      setAlarms((prev) => prev.map((item) => (item.id === id ? { ...item, acknowledged: true } : item)));
      setMessage('Alarm acknowledged successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to acknowledge alarm');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Alarm Management</h1>
          <p className="text-gray-400 mt-2">Track, acknowledge, and review alarm history in the BMS.</p>
        </div>
      </div>

      {message && <div className="rounded-3xl bg-slate-800 p-4 text-sm text-emerald-300">{message}</div>}

      <div className="overflow-x-auto rounded-3xl bg-gray-800 border border-slate-700 shadow-xl">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Equipment</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Alarm</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Time</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading alarms...</td>
              </tr>
            ) : alarms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No active alarms detected.</td>
              </tr>
            ) : (
              alarms.map((alarm) => (
                <tr key={alarm.id} className={alarm.acknowledged ? 'bg-slate-900' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{alarm.equipment_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{alarm.alarm_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${alarm.priority === 'high' ? 'bg-rose-500 text-white' : alarm.priority === 'medium' ? 'bg-amber-500 text-black' : 'bg-slate-600 text-white'}`}>
                      {alarm.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{alarm.acknowledged ? 'Acknowledged' : 'Unacknowledged'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{alarm.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      disabled={alarm.acknowledged}
                      onClick={() => acknowledge(alarm.id)}
                      className="rounded-full bg-slate-700 px-4 py-2 text-slate-100 hover:bg-slate-600 disabled:opacity-50"
                    >
                      Acknowledge
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alarms;