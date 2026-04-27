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
    <aside className="w-60 h-screen flex flex-col transition-colors duration-300"
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>
      <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: 'var(--accent)' }}>
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Pharma<span style={{ color: 'var(--accent)' }}>Chain</span>
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>AI Logistics</p>
        </div>
      </div>
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--text-muted)' }}>Menu</p>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all`}
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent-light)' : 'transparent',
              color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500
            })}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--accent)' }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.username || 'Guest'}</p>
            <p className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>{user?.role || 'User'}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          style={{ color: 'var(--text-muted)' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
