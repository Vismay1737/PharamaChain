import React from 'react';
import { Bell, Search, Moon } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="h-16 bg-[var(--background)]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-black tracking-tight text-white uppercase">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search batches..." 
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/5 rounded-xl focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 text-sm text-white placeholder:text-slate-600 transition-all w-56 outline-none"
          />
        </div>

        <button className="p-2 text-slate-500 hover:text-teal-400 hover:bg-white/5 rounded-lg transition-all relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--background)]"></span>
        </button>

        <button className="p-2 text-slate-500 hover:text-teal-400 hover:bg-white/5 rounded-lg transition-all">
          <Moon size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
