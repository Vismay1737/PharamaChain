import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  History, 
  Settings, 
  LogOut,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Package size={20} />, label: 'Inventory', path: '/batches' },
    { icon: <AlertTriangle size={20} />, label: 'AI Alerts', path: '/alerts' },
    { icon: <History size={20} />, label: 'Audit Log', path: '/audit' },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-700 h-screen flex flex-col text-slate-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Pharma<span className="text-teal-400">Chain</span></h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">AI Logistics</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner' 
                : 'hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-navy-700 bg-navy-800/50">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-navy-700 overflow-hidden border border-navy-600 flex items-center justify-center text-teal-400 font-bold uppercase">
            {user?.username?.[0] || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.username || 'Guest'}</p>
            <p className="text-[10px] uppercase text-slate-500 font-bold">{user?.role || 'User'}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
