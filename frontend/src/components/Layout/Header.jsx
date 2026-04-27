import React from 'react';
import { Bell, Search } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h2>
      <div className="flex items-center gap-3">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input type="text" placeholder="Search batches..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 transition-all w-52" />
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
