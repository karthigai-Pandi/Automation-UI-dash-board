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
  Bell,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeAlarms, setActiveAlarms] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400', bgColor: 'bg-blue-500/10 hover:bg-blue-500/20' },
    { path: '/ahu', icon: Wind, label: 'AHU', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20' },
    { path: '/fcu', icon: Fan, label: 'FCU', color: 'text-green-400', bgColor: 'bg-green-500/10 hover:bg-green-500/20' },
    { path: '/energy', icon: Zap, label: 'Energy', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20' },
    { path: '/fire', icon: Flame, label: 'Fire', color: 'text-red-400', bgColor: 'bg-red-500/10 hover:bg-red-500/20' },
    { path: '/dg', icon: Settings, label: 'DG Unit', color: 'text-purple-400', bgColor: 'bg-purple-500/10 hover:bg-purple-500/20' },
    { path: '/alarms', icon: AlertTriangle, label: 'Alarms', color: 'text-orange-400', bgColor: 'bg-orange-500/10 hover:bg-orange-500/20' },
    { path: '/trends', icon: TrendingUp, label: 'Trends', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20' },
    ...(user?.role === 'admin' ? [{ path: '/admin', icon: User, label: 'Admin', color: 'text-pink-400', bgColor: 'bg-pink-500/10 hover:bg-pink-500/20' }] : [])
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlarms(Math.floor(Math.random() * 5));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden relative">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-slate-900 border-r border-slate-800 shadow-2xl relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-tight">
                BMS<span className="text-indigo-500">.</span>PRO
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Smart Infrastructure</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800">
           <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-800/50">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                 <User className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex-1 truncate">
                 <p className="text-sm font-black text-white truncate">{user?.username}</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors">
                 <LogOut className="h-5 w-5" />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-20 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 relative z-30">
           <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
                 <Activity className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-white">BMS<span className="text-indigo-500">.</span>PRO</h1>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Bell className="h-6 w-6 text-slate-400" />
                 {activeAlarms > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse"></span>}
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-800 text-white"
              >
                 {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
           </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 lg:pb-8">
           <div className="max-w-7xl mx-auto">
              <Outlet />
           </div>
        </main>

        {/* Mobile Bottom Navigation (as requested) */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] flex items-center justify-around px-4 shadow-2xl z-40 animate-in slide-in-from-bottom-10 duration-500">
           {menuItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                    isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-110' : 'text-slate-500'
                  }`}
                >
                   <item.icon className="h-6 w-6" />
                </Link>
              );
           })}
           {/* Special Full Menu Button */}
           <button 
             onClick={() => setIsMobileMenuOpen(true)}
             className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-slate-500 hover:bg-slate-800"
           >
              <Menu className="h-6 w-6" />
           </button>
        </nav>

        {/* Fullscreen Mobile Overlay Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-950 z-[100] animate-in fade-in zoom-in duration-300 p-8 flex flex-col overflow-y-auto">
             <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                   <div className="p-3 rounded-2xl bg-indigo-600">
                      <Activity className="h-6 w-6 text-white" />
                   </div>
                   <h1 className="text-3xl font-black">Full Menu</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-slate-900 text-white">
                   <X className="h-8 w-8" />
                </button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col gap-3 p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500"
                  >
                     <item.icon className="h-8 w-8 text-indigo-400" />
                     <span className="font-bold">{item.label}</span>
                  </Link>
                ))}
             </div>
             <div className="mt-auto pt-12">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-4 p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 font-bold text-xl"
                >
                   <LogOut className="h-6 w-6" />
                   LOGOUT SESSION
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Layout;