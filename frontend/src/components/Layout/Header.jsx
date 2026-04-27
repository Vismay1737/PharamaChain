import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="h-20 bg-[var(--background)] border-b border-slate-200 dark:border-navy-700 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white uppercase">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search batches..." 
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-navy-800 border-none rounded-lg focus:ring-2 focus:ring-teal-500/30 text-sm transition-all w-64"
          />
        </div>

        <button className="p-2 text-slate-500 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--background)]"></span>
        </button>

        <button className="p-2 text-slate-500 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-all">
          <Moon size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
