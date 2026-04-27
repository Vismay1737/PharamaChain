import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, unit = "", icon: Icon, color = "teal", trend = null }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 flex items-center gap-5 group hover:border-teal-500/30 transition-all duration-300"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
        {Icon && <Icon size={28} />}
      </div>
      
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">
            {value}
          </h3>
          <span className="text-sm font-medium text-slate-500">{unit}</span>
        </div>
        
        {trend && (
          <p className={`text-[10px] font-bold mt-1 ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}% from last 24h
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
