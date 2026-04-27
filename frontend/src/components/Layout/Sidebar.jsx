import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, AlertTriangle, History, LogOut, ShieldCheck, Zap, BrainCircuit, ScanSearch } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Package size={20} />, label: 'Inventory', path: '/batches' },
    { icon: <AlertTriangle size={20} />, label: 'AI Alerts', path: '/alerts' },
    { icon: <BrainCircuit size={20} />, label: 'AI Chat', path: '/chat' },
    { icon: <ScanSearch size={20} />, label: 'Verify Drug', path: '/verify' },
    { icon: <History size={20} />, label: 'Audit Log', path: '/audit' },
  ];

  return (
    <aside className="w-64 bg-[#080c16] border-r border-white/5 h-screen flex flex-col text-slate-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />
      <div className="p-6 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Pharma<span className="text-teal-400">Chain</span></h1>
          <p className="text-[9px] uppercase tracking-[0.2em] text-teal-400/60 font-bold flex items-center gap-1"><Zap size={8} /> AI Logistics</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1 relative z-10">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            {item.icon}
            <span className="font-semibold text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-teal-500/20">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.username || 'Guest'}</p>
            <p className="text-[10px] uppercase text-teal-400/60 font-bold tracking-wider">{user?.role || 'User'}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-lg transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
