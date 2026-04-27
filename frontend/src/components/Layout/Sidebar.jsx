import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, AlertTriangle, History, LogOut, ShieldCheck, BrainCircuit, ScanSearch } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/' },
    { icon: <Package size={18} />, label: 'Inventory', path: '/batches' },
    { icon: <AlertTriangle size={18} />, label: 'AI Alerts', path: '/alerts' },
    { icon: <BrainCircuit size={18} />, label: 'AI Chat', path: '/chat' },
    { icon: <ScanSearch size={18} />, label: 'Verify Drug', path: '/verify' },
    { icon: <History size={18} />, label: 'Audit Log', path: '/audit' },
  ];

  return (
    <aside className="w-60 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-gray-100">
        <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center text-white">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">PharmaChain</h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">AI Logistics</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
              isActive 
                ? 'bg-green-50 text-green-700 font-semibold' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.username || 'Guest'}</p>
            <p className="text-[10px] text-gray-400 uppercase font-medium">{user?.role || 'User'}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
