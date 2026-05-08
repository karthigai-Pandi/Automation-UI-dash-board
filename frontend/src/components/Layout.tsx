import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wind,
  Fan,
  Zap,
  Flame,
  Settings,
  AlertTriangle,
  TrendingUp,
  User,
  LogOut,
  Activity,
  Shield,
  Bell
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeAlarms, setActiveAlarms] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400', bgColor: 'bg-blue-500/10 hover:bg-blue-500/20' },
    { path: '/ahu', icon: Wind, label: 'AHU Monitoring', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20' },
    { path: '/fcu', icon: Fan, label: 'FCU Monitoring', color: 'text-green-400', bgColor: 'bg-green-500/10 hover:bg-green-500/20' },
    { path: '/energy', icon: Zap, label: 'Energy Meter', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20' },
    { path: '/fire', icon: Flame, label: 'Fire Alarm', color: 'text-red-400', bgColor: 'bg-red-500/10 hover:bg-red-500/20' },
    { path: '/dg', icon: Settings, label: 'DG Monitoring', color: 'text-purple-400', bgColor: 'bg-purple-500/10 hover:bg-purple-500/20' },
    { path: '/alarms', icon: AlertTriangle, label: 'Alarms', color: 'text-orange-400', bgColor: 'bg-orange-500/10 hover:bg-orange-500/20' },
    { path: '/trends', icon: TrendingUp, label: 'Trends', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20' },
    ...(user?.role === 'admin' ? [{ path: '/admin', icon: User, label: 'Admin', color: 'text-pink-400', bgColor: 'bg-pink-500/10 hover:bg-pink-500/20' }] : [])
  ];

  // Simulate active alarms count
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlarms(Math.floor(Math.random() * 5));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      {/* Enhanced Sidebar */}
      <div className="w-72 bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl border-r border-slate-700/50 backdrop-blur-sm">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                BMS Dashboard
              </h1>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Smart Building Monitoring</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${activeAlarms > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-sm text-gray-400">System Status</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${activeAlarms > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {activeAlarms > 0 ? `${activeAlarms} Alarms` : 'Normal'}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                    isActive
                      ? `${item.bgColor} border border-current/30 shadow-lg`
                      : 'hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                    isActive ? `${item.color} bg-current/20` : 'text-gray-400 group-hover:text-current'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className={`font-medium transition-colors ${
                      isActive ? item.color : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                    {item.path === '/alarms' && activeAlarms > 0 && (
                      <div className="flex items-center mt-1">
                        <Bell className="w-3 h-3 text-red-400 mr-1" />
                        <span className="text-xs text-red-400">{activeAlarms} active</span>
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <div className="w-1 h-6 bg-current rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 w-72 p-6 border-t border-slate-700/50 bg-gradient-to-t from-gray-900/50 to-transparent">
          <div className="flex items-center mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                user?.role === 'admin' ? 'bg-red-500' : user?.role === 'operator' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-white">{user?.username}</p>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 rounded-xl border border-transparent hover:border-red-500/30 group"
          >
            <LogOut className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-900/50 to-gray-900/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;