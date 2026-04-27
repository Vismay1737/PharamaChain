import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({ title }) => {
  const { dark, toggle } = useTheme();

  return (
    <header className="h-14 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-300"
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
      <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search batches..."
            className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 transition-all w-48"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' }} />
        </div>
        <button className="p-2 rounded-lg transition-all relative hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" style={{ border: '2px solid var(--bg-card)' }}></span>
        </button>
        {/* Theme Toggle */}
        <button onClick={toggle}
          className="p-2 rounded-lg transition-all hover:opacity-80"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-badge)' }}
          title={dark ? 'Switch to Light' : 'Switch to Dark'}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
