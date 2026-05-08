import { useEffect, useState } from 'react';
import api from '../services/api';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface AdminStats {
  users: {
    total_users: number;
    admin_count: number;
    active_users: number;
  };
  alarms: {
    total_alarms: number;
    unacknowledged_alarms: number;
  };
  equipment: {
    total_equipment: number;
    online_equipment: number;
  };
}

const Admin = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, statsResponse] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats')
        ]);
        setUsers(usersResponse.data);
        setStats(statsResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-2">Manage users, roles, and building monitoring resources.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-700">
          <h2 className="text-white text-xl font-semibold">System Overview</h2>
          <div className="mt-5 grid gap-4">
            <div className="rounded-3xl bg-slate-950/50 p-5">
              <p className="text-sm text-gray-400">Active Users</p>
              <p className="text-3xl text-white mt-2">{stats?.users.active_users || 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/50 p-5">
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-3xl text-white mt-2">{stats?.users.total_users || 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/50 p-5">
              <p className="text-sm text-gray-400">Admin Accounts</p>
              <p className="text-3xl text-white mt-2">{stats?.users.admin_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-slate-700">
          <h2 className="text-white text-xl font-semibold">System Health</h2>
          <div className="mt-5 grid gap-4">
            <div className="rounded-3xl bg-slate-950/50 p-5">
              <p className="text-sm text-gray-400">Total Equipment</p>
              <p className="text-3xl text-white mt-2">{stats?.equipment.total_equipment || 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/50 p-5">
              <p className="text-sm text-gray-400">Online Equipment</p>
              <p className="text-3xl text-white mt-2">{stats?.equipment.online_equipment || 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/50 p-5">
              <p className="text-sm text-gray-400">Active Alarms</p>
              <p className="text-3xl text-white mt-2">{stats?.alarms.unacknowledged_alarms || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-gray-800 p-6 shadow-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-semibold">User Management</h2>
          <button className="rounded-full bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600">Create User</button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.active ? 'bg-emerald-500 text-black' : 'bg-slate-600 text-white'}`}>
                        {user.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;