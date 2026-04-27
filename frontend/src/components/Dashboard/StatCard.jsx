import React from 'react';
import { motion } from 'framer-motion';

const colorMap = {
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', shadow: 'shadow-teal-500/10' },
  red: { bg: 'bg-rose-500/10', text: 'text-rose-400', shadow: 'shadow-rose-500/10' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', shadow: 'shadow-indigo-500/10' },
};

const StatCard = ({ title, value, unit = "", icon: Icon, color = "teal", trend = null }) => {
  const c = colorMap[color] || colorMap.teal;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 flex items-center gap-5 group hover:border-teal-500/20 transition-all duration-300 ${c.shadow}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${c.bg} ${c.text} group-hover:scale-110 transition-transform duration-300`}>
        {Icon && <Icon size={28} strokeWidth={1.5} />}
      </div>
      
      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-black text-white tabular-nums">
            {value}
          </h3>
          <span className="text-sm font-medium text-slate-500">{unit}</span>
        </div>
        
        {trend && (
          <p className={`text-[10px] font-bold mt-1.5 ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last 24h
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
